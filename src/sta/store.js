// State adapter. $read / $write / reset / watch are the only state API; Pinia is an implementation
// detail of this file and can be swapped without touching tags, watchers or commands.
import {createPinia, defineStore} from 'pinia';
import {watch} from 'vue';
import {clone, get, isOpenContainer, isPlainObject, segments, set} from './util';

export const pinia = createPinia();

const STORAGES = {
    blackhole: () => null,
    localStorage: () => window.localStorage,
    sessionStorage: () => window.sessionStorage
};

let store = null;
let declared = null;

export function createStore(sta) {
    declared = clone(sta.state);

    const storage = STORAGES[sta.disk]();
    const storageKey = sta.namespace + '-state';
    const saved = storage ? load(storage, storageKey) : undefined;

    store = defineStore('stateTagApp', {
        state: () => mergeDeclared(clone(declared), saved)
    })(pinia);

    if (storage) {
        let timer = null;
        store.$subscribe(() => {
            clearTimeout(timer);
            timer = setTimeout(() => storage.setItem(storageKey, JSON.stringify(store.$state)), 100);
        }, {detached: true});
    }
}

export function read(locus) {
    assertDeclared(locus);
    return get(store.$state, locus);
}

// Read without the declared-locus check: for lookups where "absent" is a valid answer (e.g. a missing translation).
export function peek(locus) {
    return get(store.$state, locus);
}

export function write(locus, value) {
    assertDeclared(locus);
    set(store.$state, locus, value);
}

// reset() restores everything except the reserved "sta" branch; reset('user') restores one branch.
export function reset(branch) {
    if (branch === undefined) {
        Object.keys(declared)
            .filter(key => key !== 'sta')
            .forEach(key => {
                store.$state[key] = clone(declared[key]);
            });
        return;
    }

    assertDeclared(branch);
    set(store.$state, branch, clone(get(declared, branch)));
}

export function watchLocus(locus, callback) {
    assertDeclared(locus);
    return watch(() => get(store.$state, locus), callback, {deep: true});
}

// Passed to initGlobalStateWatchers: stateObserver.watch(state => state.msg.en, (fresh, stale) => ...)
export const stateObserver = {
    watch(getter, callback) {
        return watch(() => getter(store.$state), callback, {deep: true});
    }
};

// Dev only: a locus must exist in the declared state, or sit inside a declared open container.
function assertDeclared(locus) {
    if (!import.meta.env.DEV) {
        return;
    }

    const keys = segments(locus ?? '');

    if (!keys.length) {
        throw new Error('STA: empty locus.');
    }

    let cursor = declared;

    for (let i = 0; i < keys.length; i++) {
        if (i > 0 && isOpenContainer(cursor)) {
            return;
        }

        if (!isPlainObject(cursor) && !Array.isArray(cursor) || !(keys[i] in cursor)) {
            throw new Error(`STA: locus "${locus}" is not declared in sta-state.js (unknown at "${keys.slice(0, i + 1).join('.')}").`);
        }

        cursor = cursor[keys[i]];
    }
}

function load(storage, key) {
    const raw = storage.getItem(key);

    if (raw === null) {
        return undefined;
    }

    try {
        return JSON.parse(raw);
    } catch (e) {
        throw new Error(`STA: persisted state "${key}" is not valid JSON. Clear it from ${storage === window.localStorage ? 'localStorage' : 'sessionStorage'}.`);
    }
}

// Saved values win, but only where the declared shape allows them; new declared keys survive.
function mergeDeclared(base, saved) {
    if (saved === undefined) {
        return base;
    }

    if (isOpenContainer(base) || !isPlainObject(base) || !isPlainObject(saved)) {
        return saved;
    }

    Object.keys(base).forEach(key => {
        if (key in saved) {
            base[key] = mergeDeclared(base[key], saved[key]);
        }
    });

    return base;
}
