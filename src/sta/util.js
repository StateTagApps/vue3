// Locus helpers: a locus is a dot path ("msg.en", "receipts.3.total").

export function segments(locus) {
    return String(locus).split('.').filter(key => key !== '');
}

export function get(target, locus) {
    if (locus === null || locus === undefined || locus === '') {
        return target;
    }

    let cursor = target;

    for (const key of segments(locus)) {
        if (cursor === null || cursor === undefined) {
            return undefined;
        }
        cursor = cursor[key];
    }

    return cursor;
}

export function set(target, locus, value) {
    const keys = segments(locus);

    if (!keys.length) {
        throw new Error('STA: cannot write to an empty locus.');
    }

    let cursor = target;

    keys.slice(0, -1).forEach((key, i) => {
        if (cursor[key] === null || typeof cursor[key] !== 'object') {
            cursor[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
        }
        cursor = cursor[key];
    });

    cursor[keys[keys.length - 1]] = value;
}

export function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

export function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Open containers accept any key: null, arrays and empty objects in the declared state.
export function isOpenContainer(value) {
    return value === null || Array.isArray(value) || (isPlainObject(value) && !Object.keys(value).length);
}

export function isEmptyContent(value) {
    return value === null || value === undefined || value === ''
        || (typeof value === 'object' && !Object.keys(value).length);
}

export function isUrl(url) {
    return typeof url === 'string' && (url.startsWith('http') || url.startsWith('//'));
}

// v4 UUID. crypto.randomUUID only exists on https/localhost; getRandomValues also works on plain http.
export function uuid() {
    if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant

    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function joinUrl(base, path) {
    return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
}
