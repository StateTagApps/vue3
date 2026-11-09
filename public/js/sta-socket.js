function initGlobalSocketWatchers() {
    stateTagApp.$onSocket('timecast', function (payload) {
        stateTagApp.$write('rolex', payload.stamp);
    });
}
