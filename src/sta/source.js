// useSource: one get/set over (service, src, locus) for every data-bound tag.
//   state  — locus is a path into state            (read/write)
//   api    — src is a URL, locus a path into JSON  (read; write to the API with $api)
//   socket — src is an event, locus a path into the payload (read)
//   nebula — locus is a key in the nebula room     (read/write)
// Sources for the same api src / socket event / nebula key are shared by every tag that uses them.
import {computed, onBeforeUnmount, ref, shallowRef} from 'vue';
import {read, write} from './store';
import {socketConnected} from './socket';
import {get} from './util';

export const sourceProps = {
    locus: {type: String, default: null},
    src: {type: String, default: null},
    service: {type: String, default: 'state'},
    refresh: {type: Number, default: 0}, // service="api" only: refetch every N seconds; 0 = never
    connectingMsg: {type: String, default: 'connecting...'},
    waitingMsg: {type: String, default: 'waiting...'}
};

const shared = {api: new Map(), socket: new Map(), nebula: new Map()};

function sharedSource(service, id, start) {
    if (!shared[service].has(id)) {
        const source = {data: shallowRef(null), loading: ref(true), error: ref(null)};
        shared[service].set(id, source);
        start(source);
    }

    return shared[service].get(id);
}

const remote = {
    api(sta, props) {
        if (!props.src) {
            throw new Error('STA: service="api" needs a src attribute.');
        }

        return sharedSource('api', props.src, source => {
            // A refetch cancels one still in flight (same key); the cancelled one leaves the source alone.
            source.fetch = () => sta.$api(props.src, {caller: 'source', key: 'source:' + props.src})
                .then(response => {
                    source.data.value = response.data;
                    source.error.value = null;
                    source.loading.value = false;
                })
                .catch(error => {
                    if (error.name === 'AbortError') {
                        return;
                    }
                    source.error.value = error.message;
                    source.loading.value = false;
                });

            source.fetch();
        });
    },

    socket(sta, props) {
        if (!props.src) {
            throw new Error('STA: service="socket" needs a src attribute (the event name).');
        }

        return sharedSource('socket', props.src, source => {
            sta.$onSocket(props.src, payload => {
                source.data.value = payload;
                source.loading.value = false;
            });
        });
    },

    nebula(sta, props) {
        if (!props.locus) {
            throw new Error('STA: service="nebula" needs a locus attribute (the nebula key).');
        }

        return sharedSource('nebula', props.locus, source => {
            sta.$onNebula(props.locus, value => {
                source.data.value = value;
                source.loading.value = false;
            });
        });
    }
};

export function useSource(props) {
    const sta = window.stateTagApp;
    const service = props.service;
    let source = null;
    let setupError = null;

    try {
        if (service !== 'state') {
            if (!remote[service]) {
                throw new Error(`STA: unknown service "${service}" (use state, api, socket or nebula).`);
            }
            source = remote[service](sta, props);
        }

        if (props.refresh) {
            if (service !== 'api') {
                throw new Error(`STA: refresh only applies to service="api" (this tag uses "${service}").`);
            }
            if (!(props.refresh > 0)) {
                throw new Error(`STA: refresh must be a number of seconds, got "${props.refresh}".`);
            }

            const timer = setInterval(source.fetch, props.refresh * 1000);
            onBeforeUnmount(() => clearInterval(timer));
        }
    } catch (error) {
        setupError = error.message;
    }

    const resolved = computed(() => {
        if (setupError) {
            return {value: undefined, error: setupError};
        }

        try {
            if (service === 'state') {
                return {value: read(props.locus), error: null};
            }

            const data = source.data.value;
            const value = service === 'nebula' ? data : get(data, props.locus);

            return {value, error: source.error.value};
        } catch (error) {
            return {value: undefined, error: error.message};
        }
    });

    const content = computed({
        get: () => resolved.value.value,
        set: value => {
            if (service === 'state') {
                write(props.locus, value);
            } else if (service === 'nebula') {
                sta.$nebula(props.locus, value);
            } else {
                throw new Error(`STA: service="${service}" is read-only; write to the API with $api().`);
            }
        }
    });

    const loading = computed(() => !!source && source.loading.value && !resolved.value.error);

    const statusMessage = computed(() => {
        if (!loading.value) {
            return '';
        }

        return {
            api: 'loading...',
            socket: socketConnected.value ? props.waitingMsg : props.connectingMsg,
            nebula: ''
        }[service];
    });

    return {
        content,
        loading,
        error: computed(() => resolved.value.error),
        statusMessage
    };
}
