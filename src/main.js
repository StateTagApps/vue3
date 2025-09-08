// src/main.js
import { defineCustomElement } from 'vue';
import XTextHtml from './x-html/TextHtml.vue';

customElements.define('x-text-html', defineCustomElement(XTextHtml));
