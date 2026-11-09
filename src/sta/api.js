// $api(endpoint, {params, body, method, headers, caller, key, undo, cache})
// - fills {placeholders} from params (missing param throws)
// - adds the bearer token when stateTagApp.isSecureEndpoint(endpoint) says so
// - auto-cancels the previous request with the same key (default: caller)
// - undo: true delays the request by stateTagApp.undoDelay seconds; stateTagApp.undo() (or <x-undo>) cancels it
// - cache: true reuses a GET response for stateTagApp.cacheTimeout ms
// - broadcasts every result; never swallows errors
// - keeps sta.api.pending current so tags can show activity
import {serviceUrl} from './config';
import {isUrl, joinUrl} from './util';

const controllers = new Map();
const cache = new Map();
let pending = 0;
let pendingUndo = null;

export function installApi(sta, {read, write}) {
    const activity = delta => {
        const before = pending;
        pending += delta;
        write('sta.api', {pending});

        if (before === 0 && pending === 1) {
            sta.$broadcast({type: 'animation', from: 'api', event: 'start'});
        } else if (pending === 0) {
            sta.$broadcast({type: 'animation', from: 'api', event: 'stop'});
        }
    };

    const clearUndo = () => {
        pendingUndo = null;
        write('sta.undo', {pending: false, until: 0});
    };

    // Starting a new undoable request commits the previous one immediately.
    const waitForUndo = caller => {
        if (typeof sta.undoDelay !== 'number' || sta.undoDelay <= 0) {
            throw new Error('STA $api: {undo: true} needs stateTagApp.undoDelay (seconds) in sta-config.js.');
        }

        if (pendingUndo) {
            clearTimeout(pendingUndo.timer);
            pendingUndo.resolve();
        }

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                clearUndo();
                resolve();
            }, sta.undoDelay * 1000);

            pendingUndo = {timer, resolve, reject, caller};
            write('sta.undo', {pending: true, until: Date.now() + sta.undoDelay * 1000});
        });
    };

    clearUndo();

    sta.undo = () => {
        if (!pendingUndo) {
            return false;
        }

        const {timer, reject, caller} = pendingUndo;
        clearTimeout(timer);
        clearUndo();

        const error = new Error('STA $api: cancelled by undo.');
        error.name = 'UndoError';
        reject(error);

        sta.$broadcast({type: 'api', from: caller, event: 'undo'});
        return true;
    };

    sta.$api = async function (endpoint, options = {}) {
        const {params = {}, body, method, headers = {}, caller = 'api', key, undo = false} = options;

        if (typeof endpoint !== 'string' || !endpoint) {
            throw new Error('STA $api: endpoint must be a non-empty string.');
        }

        const path = fillPlaceholders(endpoint, params);
        const url = isUrl(path) ? path : joinUrl(serviceUrl(sta, 'api'), path);
        const verb = (method || (body === undefined ? 'GET' : 'POST')).toUpperCase();
        const useCache = options.cache === true && verb === 'GET';

        if (options.cache === true && verb !== 'GET') {
            throw new Error(`STA $api: cache only applies to GET (${verb} ${url}).`);
        }

        if (useCache) {
            if (typeof sta.cacheTimeout !== 'number' || sta.cacheTimeout <= 0) {
                throw new Error('STA $api: {cache: true} needs stateTagApp.cacheTimeout (ms) in sta-config.js.');
            }

            const hit = cache.get(url);
            if (hit && hit.expires > Date.now()) {
                return hit.response;
            }
        }

        if (undo) {
            await waitForUndo(caller);
        }

        const requestHeaders = {...headers};

        if (typeof sta.isSecureEndpoint === 'function' && sta.isSecureEndpoint(path)) {
            requestHeaders.Authorization = 'Bearer ' + (read(sta.tokenLocus) || '');
        }

        let payload = body;

        if (body !== undefined && !(body instanceof FormData) && typeof body !== 'string') {
            payload = JSON.stringify(body);
            requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
        }

        const cancelKey = key || caller;
        controllers.get(cancelKey)?.abort();
        const controller = new AbortController();
        controllers.set(cancelKey, controller);

        activity(1);

        try {
            let res;
            try {
                res = await fetch(url, {method: verb, headers: requestHeaders, body: payload, signal: controller.signal});
            } catch (error) {
                if (error.name !== 'AbortError') {
                    sta.$broadcast({type: 'api', from: caller, event: 'network-error', message: error.message});
                }
                throw error;
            }

            const response = {data: await parseBody(res), status: res.status, headers: res.headers};
            const message = res.ok
                ? 'success'
                : ((response.data && response.data.message) || res.statusText || 'HTTP error');

            sta.$broadcast({type: 'api', from: caller, event: res.status, message});

            if (!res.ok) {
                const error = new Error(`STA $api: ${verb} ${url} failed with ${res.status} ${message}`);
                error.response = response;
                throw error;
            }

            if (useCache) {
                cache.set(url, {response, expires: Date.now() + sta.cacheTimeout});
            }

            return response;
        } finally {
            if (controllers.get(cancelKey) === controller) {
                controllers.delete(cancelKey);
            }
            activity(-1);
        }
    };
}

function fillPlaceholders(endpoint, params) {
    return endpoint.replace(/{([^}]+)}/g, (match, name) => {
        const value = params[name];

        if (value === undefined || value === null || value === '') {
            throw new Error(`STA $api: missing param "${name}" for endpoint "${endpoint}".`);
        }

        return encodeURIComponent(value);
    });
}

async function parseBody(res) {
    const text = await res.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        if ((res.headers.get('content-type') || '').includes('json')) {
            throw new Error(`STA $api: response from ${res.url} claims JSON but does not parse.`);
        }
        return text;
    }
}
