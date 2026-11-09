<template>
  <div class="sta-field">
    <label>
      <i v-if="icon" :class="'fa fa-' + icon"></i>
      <span v-else>{{ label }}</span>
    </label>
    <select :name="name" v-model="content" :disabled="!!problem" @change="onChange" @blur="onBlur">
      <option v-for="currency in options.list" :key="currency" :value="currency">{{ currency }}</option>
    </select>
    <span v-if="problem" class="sta-error">[{{ problem }}]</span>
  </div>
</template>

<script setup>
// Options come from state (options-locus); options-src optionally loads them from the API first.
import {computed, onMounted, ref} from 'vue';
import {sourceProps, useSource} from '@/sta/source';
import {fieldProps, useField} from '@/composables/useField';

const props = defineProps({
  ...sourceProps,
  ...fieldProps,
  optionsLocus: {type: String, default: 'currencies.options'},
  optionsSrc: {type: String, default: null}
});

const emit = defineEmits(['updated']);

const {content, error} = useSource(props);
const {label, onChange, onBlur} = useField(props, emit);
const loadError = ref(null);

const options = computed(() => {
  try {
    return {list: window.stateTagApp.$read(props.optionsLocus) || [], error: null};
  } catch (e) {
    return {list: [], error: e.message};
  }
});

const problem = computed(() => error.value || options.value.error || loadError.value);

onMounted(() => {
  if (props.optionsSrc) {
    window.stateTagApp.$api(props.optionsSrc, {caller: 'currency-input', key: 'currency-input:' + props.optionsSrc})
        .then(response => window.stateTagApp.$write(props.optionsLocus, response.data))
        .catch(e => {
          loadError.value = e.message;
        });
  }
});
</script>
