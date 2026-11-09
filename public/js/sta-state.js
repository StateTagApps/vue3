// The declared state shape. It is the contract: the runtime refuses writes outside it.
// Empty objects, arrays and null are open containers (anything may be written inside them).
stateTagApp.state = {
    sta: {}, // required & reserved for the runtime

    msg: {
        en: 'This text is inside state.js.',
        sp: 'Este texto está dentro del estado.',
        fr: "Ce texte est à l'intérieur de l'état."
    },

    user: {
        token: '',
        lang: 'en'
    },

    rolex: null,

    langpack: {
        options: {en: 'English', es: 'Español'},
        selected: 'en',
        uiux: {},
        numberFormat: '#,###.##'
    },

    currencies: {
        selected: 'USD',
        options: ['USD', 'EUR', 'CAD']
    },

    badges: {
        inbox: 3
    },

    form: {
        name: '',
        age: 30,
        notes: '',
        birthday: '',
        currency: 'USD',
        numberFormat: '',
        amount: 1234567.891
    },

    i18nDemo: {
        greeting: 'greeting',
        untranslated: 'not-translated-yet'
    },

    hello: null
};

// UI translations for this instance. A real STA would usually load these with <x-lang pack-src="...">.
stateTagApp.translations = {
    en: {greeting: 'Hello', name: 'Name', age: 'Age', notes: 'Notes', birthday: 'Birthday', currency: 'Currency', 'demo-modal': 'Demo modal'},
    es: {greeting: 'Hola', name: 'Nombre', age: 'Edad', notes: 'Notas', birthday: 'Cumpleaños', currency: 'Moneda', 'demo-modal': 'Modal de demostración'}
};

function initGlobalStateWatchers(stateObserver) {
    ['en', 'sp', 'fr'].forEach(function (lang) {
        stateObserver.watch(
            function (state) {
                return state.msg[lang];
            },
            function (fresh, stale) {
                stateTagApp.log('Global watcher heard msg.' + lang + ' change from ' + stale + ' to ' + fresh);
            }
        );
    });

    // Switching language swaps the UI translations.
    stateTagApp.watch('langpack.selected', function (lang) {
        stateTagApp.$write('langpack.uiux', stateTagApp.translations[lang] || {});
    });
    stateTagApp.$write('langpack.uiux', stateTagApp.translations[stateTagApp.$read('langpack.selected')] || {});
}
