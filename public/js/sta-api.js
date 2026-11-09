// Named endpoints with {placeholders}. Fill them through $api(endpoint, {params: {...}}).
stateTagApp.endPoints = {
    helloWorld: 'HelloWorld/TextHtml.json'
};

// Endpoints that need the bearer token (read from stateTagApp.tokenLocus).
stateTagApp.endPoints.secure = [];

stateTagApp.isSecureEndpoint = function (endpoint) {
    var path = endpoint.split('?')[0].replace(/^\/|\/$/g, '');

    return stateTagApp.endPoints.secure.some(function (pattern) {
        var normalized = pattern.split('?')[0].replace(/^\/|\/$/g, '');
        return new RegExp('^' + normalized.replace(/{[^}]+}/g, '[^/]+') + '$').test(path);
    });
};
