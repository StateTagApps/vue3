// Validates the app layer (public/js/sta-*.js) before anything else boots. Fail loud, no silent defaults.

export function bootConfig() {
    const sta = window.stateTagApp;

    if (!sta || typeof sta !== 'object') {
        throw new Error('STA: window.stateTagApp is missing. Load sta-config.js before app.js.');
    }

    const required = {
        namespace: value => typeof value === 'string' && /^[a-z][a-z0-9]*$/.test(value),
        disk: value => ['blackhole', 'localStorage', 'sessionStorage'].includes(value),
        broadcastOrigin: value => typeof value === 'string' && value.length > 0,
        log: value => typeof value === 'function',
        state: value => value && typeof value === 'object' && value.sta && typeof value.sta === 'object'
    };

    for (const [key, valid] of Object.entries(required)) {
        if (!valid(sta[key])) {
            throw new Error(`STA: stateTagApp.${key} is missing or invalid in the app layer (sta-config.js / sta-state.js).`);
        }
    }

    sta.env = sta.env || import.meta.env.MODE;

    return sta;
}

// Resolves a service URL (api / socket / nebula) for the current environment.
export function serviceUrl(sta, service) {
    const map = sta[service];

    if (!map || typeof map !== 'object') {
        throw new Error(`STA: service "${service}" is used but stateTagApp.${service} is not configured in sta-config.js.`);
    }

    if (!map[sta.env]) {
        throw new Error(`STA: stateTagApp.${service} has no URL for env "${sta.env}".`);
    }

    return map[sta.env];
}

export function isConfigured(sta, service) {
    return sta[service] !== undefined;
}
