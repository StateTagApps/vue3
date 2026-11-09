// Every <x-*> tag is built here: Vue 3 custom elements in light DOM (host-page CSS applies),
// each element app wired to the one shared Pinia instance.
import {defineCustomElement} from 'vue';
import {pinia} from './store';

export function defineStaElement(component) {
    // The host element keeps its own attributes (onclick, style, class, id). Without inheritAttrs: false,
    // Vue copies undeclared ones onto the tag's root too: onclick would fire twice, styles would double up.
    return defineCustomElement({...component, inheritAttrs: false}, {
        shadowRoot: false,
        configureApp(app) {
            app.use(pinia);
        }
    });
}

export function registerElements(sta, manifest) {
    for (const [name, component] of Object.entries(manifest)) {
        const tag = sta.namespace + '-' + name;

        if (customElements.get(tag)) {
            throw new Error(`STA: <${tag}> is already defined on this page.`);
        }

        customElements.define(tag, defineStaElement(component));
    }
}
