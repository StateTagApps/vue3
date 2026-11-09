// Routing is state: the hash path lands in sta.route. #/pair/<nebulaId> joins that nebula room.
export function installRouter(sta, {write}) {
    const apply = () => {
        const path = window.location.hash.replace(/^#/, '') || '/';
        const pair = path.match(/^\/pair\/([^/]+)$/);

        if (pair) {
            write('sta.nebulaId', decodeURIComponent(pair[1]));
            window.location.hash = '#/';
            return;
        }

        write('sta.route', {path});
    };

    window.addEventListener('hashchange', apply);
    apply();
}
