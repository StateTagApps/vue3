import {io} from 'socket.io-client';
import {ref} from 'vue';
import {isConfigured, serviceUrl} from './config';

export const socketConnected = ref(false);

export function installSocket(sta) {
    if (!isConfigured(sta, 'socket')) {
        sta.$onSocket = () => {
            throw new Error('STA: socket service used but stateTagApp.socket is not configured in sta-config.js.');
        };
        sta.$emitSocket = sta.$onSocket;
        return false;
    }

    const socket = io(serviceUrl(sta, 'socket'));

    socket.on('connect', () => {
        socketConnected.value = true;
    });

    socket.on('disconnect', () => {
        socketConnected.value = false;
    });

    sta.socketIo = socket;
    sta.$onSocket = (event, handler) => socket.on(event, handler);
    sta.$emitSocket = (event, payload) => socket.emit(event, payload);

    return true;
}
