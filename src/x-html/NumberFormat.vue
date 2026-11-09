<template>
  <select :name="name" v-model="content" :disabled="!!error">
    <option v-for="format in formats" :key="format.pattern" :value="format.pattern">{{ format.example }}</option>
  </select>
  <span v-if="error" class="sta-error"> [{{ error }}]</span>
</template>

<script setup>
// Pick a number-format pattern for a locus. An empty locus starts from langpack.numberFormat.
import {onMounted} from 'vue';
import {sourceProps, useSource} from '@/sta/source';
import {numberPatterns} from '@/sta/formatters';

const props = defineProps({
  ...sourceProps,
  name: {type: String, default: 'number_format'}
});

const {content, error} = useSource(props);

const formats = numberPatterns.map(pattern => ({
  pattern,
  example: window.stateTagApp.formatters.numberFormat(1234567.89, true, pattern)
}));

onMounted(() => {
  if (!error.value && props.locus !== 'langpack.numberFormat' && !content.value) {
    content.value = window.stateTagApp.$read('langpack.numberFormat');
  }
});
</script>
