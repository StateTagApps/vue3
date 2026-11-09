// App layer: written per running instance (the website using the tags).
// Loaded before the runtime (app.js). The runtime fails loud if anything required is missing.
var stateTagApp = {
    namespace: 'x',
    disk: ['blackhole', 'localStorage', 'sessionStorage'][1],
    log: console.log,

    // Origin used when broadcasting to the embedding page. '*' because any site may embed the tags,
    // so never put sensitive data in a broadcast.
    broadcastOrigin: '*',

    // Locus holding the bearer token for secure endpoints (see sta-api.js).
    tokenLocus: 'user.token',

    // $api(endpoint, {undo: true}) waits this many seconds; <x-undo> cancels during the wait.
    undoDelay: 5,

    // $api(endpoint, {cache: true}) reuses a GET response for this many ms.
    cacheTimeout: 60 * 1000,

    format: {
        date: {year: 'numeric', month: '2-digit', day: '2-digit'} // Intl.DateTimeFormat options
    },

    base: window.location.protocol
        .concat('//')
        .concat(window.location.host)
        .concat('/#/'),

    // Keyed by environment: stateTagApp.env if set, otherwise the build mode.
    api: {
        production: 'https://data.StateTagApps.com',
        development: 'https://data.StateTagApps.com'
    },

    socket: {
        production: 'https://timesocket.io:3030',
        development: 'http://localhost:3131'
    },

    nebula: {
        production: 'https://json-data.io:8080',
        development: 'http://localhost:8181'
    }
};
