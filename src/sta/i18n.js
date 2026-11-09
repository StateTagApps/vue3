// i18n: the app layer declares a "langpack" branch: {options, selected, uiux: {key: text}, numberFormat}.
// $translate(key) returns langpack.uiux[key], or the key itself when it is missing — visible and fixable.
export function installI18n(sta, {peek}) {
    sta.$translate = key => {
        const text = peek('langpack.uiux.' + key);
        return text === undefined || text === null || text === '' ? key : text;
    };
}
