// langpack.options sorted by language code: {options: {en: 'English', ...}, error}
import {computed} from 'vue';

export function useLanguages() {
    return computed(() => {
        try {
            const options = window.stateTagApp.$read('langpack.options') || {};
            const sorted = Object.fromEntries(Object.keys(options).sort().map(code => [code, options[code]]));
            return {options: sorted, error: null};
        } catch (e) {
            return {options: {}, error: e.message};
        }
    });
}
