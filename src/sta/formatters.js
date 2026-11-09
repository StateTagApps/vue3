// Formatters replace Vue 2 filters. Tags chain them with filters='[{"name":"date"},{"name":"number","args":[...]}]'.
// The app layer can add its own: stateTagApp.formatters = {shout: v => String(v).toUpperCase()}.
const NUMBER_PATTERNS = {
    '#,###.##': {thousand: ',', decimal: '.'},
    '#.###,##': {thousand: '.', decimal: ','},
    '# ###,##': {thousand: ' ', decimal: ','},
    "#'###.##": {thousand: "'", decimal: '.'},
    '##,##,###.##': {thousand: ',', decimal: '.', indian: true},
    '######.##': {thousand: '', decimal: '.'}
};

export const numberPatterns = Object.keys(NUMBER_PATTERNS);

export function installFormatters(sta, {peek}) {
    sta.formatters = Object.assign({
        date: (value, options) => new Intl.DateTimeFormat(undefined, options || sta.format?.date).format(new Date(value)),
        number: (value, options) => new Intl.NumberFormat(undefined, options).format(Number(value)),
        json: value => JSON.stringify(value, null, 2),
        translation: value => sta.$translate(value),

        // {en: 'Hello', es: 'Hola'} → the entry for langpack.selected
        userLang: value => {
            const lang = peek('langpack.selected');
            return value && value[lang] !== undefined ? value[lang] : `[missing ${lang}]`;
        },

        // Uses langpack.numberFormat unless a pattern is passed: {"name":"numberFormat","args":[true,"#.###,##"]}
        numberFormat: (value, showFractionals = true, pattern) => {
            const number = typeof value === 'number' ? value : parseFloat(value);

            if (isNaN(number)) {
                return value;
            }

            const rules = NUMBER_PATTERNS[pattern || peek('langpack.numberFormat') || '#,###.##'];

            if (!rules) {
                throw new Error(`STA: unknown number format "${pattern || peek('langpack.numberFormat')}".`);
            }

            let [integer, fraction] = number.toFixed(2).split('.');

            if (rules.indian) {
                const lastThree = integer.slice(-3);
                const rest = integer.slice(0, -3);
                if (rest) {
                    integer = rest.replace(/\B(?=(\d{2})+(?!\d))/g, rules.thousand) + rules.thousand + lastThree;
                }
            } else if (rules.thousand) {
                integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, rules.thousand);
            }

            return showFractionals ? integer + rules.decimal + fraction : integer;
        },

        // 1500 → 1.5k, 2000000 → 2m
        k: value => {
            if (typeof value !== 'number') {
                return value;
            }

            const abs = Math.abs(value);
            const [divisor, suffix] = abs >= 1e6 ? [1e6, 'm'] : abs >= 1e3 ? [1e3, 'k'] : [1, ''];

            if (!suffix) {
                return String(value);
            }

            return (value / divisor).toFixed(1).replace(/\.0$/, '') + suffix;
        }
    }, sta.formatters || {});
}

export function applyFilters(sta, value, filters) {
    for (const filter of filters) {
        const formatter = sta.formatters[filter.name];

        if (typeof formatter !== 'function') {
            throw new Error(`STA: unknown filter "${filter.name}".`);
        }

        value = formatter(value, ...(filter.args || []));
    }

    return value;
}

export function parseFilters(json) {
    let filters;

    try {
        filters = JSON.parse(json);
    } catch (e) {
        throw new Error(`STA: filters attribute is not valid JSON: ${json}`);
    }

    if (!Array.isArray(filters)) {
        throw new Error('STA: filters attribute must be a JSON array.');
    }

    return filters;
}
