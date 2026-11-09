<template>
  <select v-model="selected" :disabled="!!problem">
    <option v-for="(language, code) in languages.options" :key="code" :value="code">
      {{ code.toUpperCase() }} - {{ language }}
    </option>
  </select>
  <span v-if="problem" class="sta-error"> [{{ problem }}]</span>
</template>

<script setup>
// The UI language switcher: binds langpack.selected.
//   options-src — loads langpack.options from the API on mount
//   pack-src    — loads langpack.uiux for the selected language, e.g. pack-src="api/language-pack?pack=uiux&lang={lang}"
import {computed, onMounted, ref, watch} from 'vue';
import {useLanguages} from '@/composables/useLanguages';

const props = defineProps({
  optionsSrc: {type: String, default: null},
  packSrc: {type: String, default: null}
});

const sta = window.stateTagApp;
const languages = useLanguages();
const loadError = ref(null);

const selected = computed({
  get: () => sta.$read('langpack.selected'),
  set: value => sta.$write('langpack.selected', value)
});

const problem = computed(() => languages.value.error || loadError.value);

const fail = e => {
  if (e.name !== 'AbortError') {
    loadError.value = e.message;
  }
};

const loadPack = () => {
  if (!props.packSrc) {
    return;
  }
  sta.$api(props.packSrc, {params: {lang: selected.value}, caller: 'lang', key: 'lang:pack'})
      .then(response => {
        loadError.value = null;
        sta.$write('langpack.uiux', response.data);
      })
      .catch(fail);
};

watch(selected, loadPack);

onMounted(() => {
  if (props.optionsSrc) {
    sta.$api(props.optionsSrc, {caller: 'lang', key: 'lang:options'})
        .then(response => {
          sta.$write('langpack.options', response.data);
          loadPack();
        })
        .catch(fail);
  } else {
    loadPack();
  }
});
</script>
