<template>
  <div class="sta-field">
    <label>
      <i v-if="icon" :class="'fa fa-' + icon"></i>
      <span v-else>{{ label }}</span>
    </label>
    <input type="number"
           :name="name"
           :placeholder="placeholder"
           :required="required"
           :min="min"
           :max="max"
           :step="step"
           v-model="number"
           :disabled="!!error"
           @change="onChange"
           @blur="onBlur">
    <span v-if="error" class="sta-error">[{{ error }}]</span>
  </div>
</template>

<script setup>
import {computed} from 'vue';
import {sourceProps, useSource} from '@/sta/source';
import {fieldProps, useField} from '@/composables/useField';

const props = defineProps({
  ...sourceProps,
  ...fieldProps,
  min: {type: Number, default: null},
  max: {type: Number, default: null},
  step: {type: Number, default: 1}
});

const emit = defineEmits(['updated']);

const {content, error} = useSource(props);
const {label, onChange, onBlur} = useField(props, emit);

// Writes numbers (or null when cleared), never strings.
const number = computed({
  get: () => content.value,
  set: value => {
    content.value = value === '' || value === null ? null : Number(value);
  }
});
</script>
