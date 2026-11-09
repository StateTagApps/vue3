import {bootConfig} from './sta/config';
import {createStore, peek, read, reset, stateObserver, watchLocus, write} from './sta/store';
import {installBroadcast} from './sta/broadcast';
import {installI18n} from './sta/i18n';
import {installFormatters} from './sta/formatters';
import {installApi} from './sta/api';
import {installModal} from './sta/modal';
import {installSocket} from './sta/socket';
import {installNebula} from './sta/nebula';
import {installRouter} from './sta/router';
import {injectStyles} from './sta/styles';
import {registerElements} from './sta/element';
import manifest from './x-html/manifest';

const sta = bootConfig();

sta.version = __STA_VERSION__;
sta.uuid = () => crypto.randomUUID();
sta.instanceId = sta.uuid(); // this page load, e.g. to ignore our own nebula commands
sta.bootedAt = Date.now();

createStore(sta);
sta.$read = read;
sta.$write = write;
sta.reset = reset;
sta.watch = watchLocus;

// Vue 2 STA compatibility: $execute('resetState', branch?) / $execute('resetApp')
sta.$execute = (action, payload) => {
    if (action === 'resetState') {
        return reset(payload);
    }
    if (action === 'resetApp') {
        reset();
        reset('sta');
        write('sta.nebulaId', sta.uuid());
        return;
    }
    throw new Error(`STA: unknown $execute action "${action}" (use resetState or resetApp).`);
};

installBroadcast(sta, read);
installI18n(sta, {peek});
installFormatters(sta, {peek});
installApi(sta, {read, write});
installModal(sta, {read, write});
write('sta.api', {pending: 0});

const hasSocket = installSocket(sta);
const hasNebula = installNebula(sta, {read});

if (!read('sta.nebulaId')) {
    write('sta.nebulaId', sta.uuid());
}

installRouter(sta, {write});

// App-layer hooks (public/js/sta-*.js)
if (typeof window.initGlobalStateWatchers === 'function') {
    window.initGlobalStateWatchers(stateObserver);
}
if (hasSocket && typeof window.initGlobalSocketWatchers === 'function') {
    window.initGlobalSocketWatchers();
}
if (hasNebula && typeof window.initGlobalNebulaWatchers === 'function') {
    window.initGlobalNebulaWatchers();
}

// Define tags only once the page is parsed: a tag upgraded mid-parse has no children yet,
// so its slot content would be lost (app.js loaded as a plain <script> in <head>).
const boot = () => {
    injectStyles();
    registerElements(sta, manifest);
    sta.log(`${sta.namespace}-html: STA ${sta.version} (${sta.env})`);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, {once: true});
} else {
    boot();
}
