// Nebula: gun.js sync across a user's GUI instances. Keys live in a room scoped by
// namespace + sta.nebulaId; changing sta.nebulaId (e.g. pairing) moves every subscription to the new room.
import Gun from 'gun/gun';
import {watch} from 'vue';
import {isConfigured, serviceUrl} from './config';

export function installNebula(sta, {read}) {
    if (!isConfigured(sta, 'nebula')) {
        sta.$nebula = () => {
            throw new Error('STA: nebula service used but stateTagApp.nebula is not configured in sta-config.js.');
        };
        sta.$onNebula = sta.$nebula;
        return false;
    }

    const gun = Gun({peers: [serviceUrl(sta, 'nebula').replace(/\/+$/, '') + '/gun'], localStorage: false});

    // Address the room node directly by its soul ("x/demo" — the same node Vue 2 STA reached with
    // gun.get('x').get('demo')). Walking the shared namespace parent stalled every room after a room switch.
    const roomNode = roomId => gun.get(sta.namespace + '/' + roomId);
    const room = () => roomNode(read('sta.nebulaId'));

    sta.gun = gun;

    sta.$nebula = (key, value) => {
        room().get(key).put(value);
    };

    // Never call gun's .off(): in this gun version it silences every subscription under the namespace
    // root. Listeners for rooms we have left stay attached and ignore their updates instead.
    sta.$onNebula = (key, callback) => {
        const joined = new Set();
        let first = true;

        watch(() => read('sta.nebulaId'), roomId => {
            // Moving rooms: drop the old room's value until the new room speaks.
            if (!first) {
                callback(null);
            }
            first = false;

            if (!roomId || joined.has(roomId)) {
                return;
            }
            joined.add(roomId);

            // No {change: true}: joining a room delivers its current value, not only later changes.
            roomNode(roomId).get(key).on(value => {
                if (roomId === read('sta.nebulaId')) {
                    callback(value);
                }
            });
        }, {immediate: true});
    };

    return true;
}
