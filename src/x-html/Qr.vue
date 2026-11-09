<template>
  <span v-if="qr.error">[{{ qr.error }}]</span>
  <qrcode-vue v-else-if="qr.value"
              :value="qr.value"
              :size="size"
              :render-as="renderAs"
              :level="level"
              :margin="margin"
              :foreground="foreground"
              :background="background"
  />
</template>

<script setup>
import {computed} from 'vue';
import QrcodeVue from 'qrcode.vue';
import {sourceProps, useSource} from '@/sta/source';
import {get} from '@/sta/util';

const props = defineProps({
  ...sourceProps,
  // e.g. template="{stateTagApp.base}pair/{value}" — tokens: {value} and {stateTagApp.<path>}
  template: {type: String, default: null},
  size: {type: Number, default: 100},
  renderAs: {type: String, default: 'svg'},
  margin: {type: Number, default: 0},
  level: {type: String, default: 'H'},
  foreground: {type: String, default: '#000000'},
  background: {type: String, default: '#ffffff'}
});

const {content, error} = useSource(props);

const qr = computed(() => {
  if (error.value) {
    return {error: error.value};
  }

  const value = content.value === null || content.value === undefined ? '' : String(content.value);

  if (props.template === null) {
    return {value};
  }

  try {
    return {value: interpolate(props.template, value)};
  } catch (e) {
    return {error: e.message};
  }
});

function interpolate(template, value) {
  return template.replace(/{([^}]+)}/g, (match, token) => {
    token = token.trim();

    if (token === 'value') {
      return value;
    }

    if (token.startsWith('stateTagApp.')) {
      const resolved = get(window.stateTagApp, token.slice('stateTagApp.'.length));

      if (resolved === undefined) {
        throw new Error(`STA <qr>: template token {${token}} is undefined.`);
      }

      return resolved;
    }

    throw new Error(`STA <qr>: unknown template token {${token}}.`);
  });
}
</script>
