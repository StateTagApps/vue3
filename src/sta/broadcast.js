// STA events go to the embedding page (window.parent). Incoming messages are validated before the
// app layer's stateTagApp.onMessage sees them.
const REQUIRED = ['type', 'from', 'event'];

export function installBroadcast(sta, read) {
    const appId = 'stateTagApp:' + sta.namespace;

    sta.$broadcast = function (data) {
        const message = {...data, app: appId};
        const context = read('sta.context');

        if (context !== undefined && context !== null) {
            message.context = context;
        }

        for (const field of REQUIRED) {
            if (message[field] === undefined || message[field] === null || message[field] === '') {
                throw new Error(`STA: broadcast is missing "${field}": ${JSON.stringify(message)}`);
            }
        }

        window.parent.postMessage(JSON.stringify(message), sta.broadcastOrigin);
    };

    window.addEventListener('message', event => {
        if (typeof event.data !== 'string') {
            return;
        }

        let message;
        try {
            message = JSON.parse(event.data);
        } catch (e) {
            return;
        }

        const valid = message && message.app === appId
            && REQUIRED.every(field => message[field] !== undefined && message[field] !== null);

        if (valid && typeof sta.onMessage === 'function') {
            sta.onMessage(message);
        }
    });
}
