<template>
  <div class="sta-field">
    <label>
      <i v-if="icon" :class="'fa fa-' + icon"></i>
      <span v-else>{{ label }}</span>
    </label>
    <input type="date"
           :name="name"
           :required="required"
           :min="min"
           :max="max"
           v-model="content"
           :disabled="!!error"
           @change="onChange"
           @blur="onBlur">
    <span v-if="error" class="sta-error">[{{ error }}]</span>
  </div>
</template>

<script setup>
// Native date input: reads and writes YYYY-MM-DD at the locus (replaces CostGuard's v-calendar picker).
import {sourceProps, useSource} from '@/sta/source';
import {fieldProps, useField} from '@/composables/useField';

const props = defineProps({
  ...sourceProps,
  ...fieldProps,
  min: {type: String, default: null},
  max: {type: String, default: null}
});

const emit = defineEmits(['updated']);

const {content, error} = useSource(props);
const {label, onChange, onBlur} = useField(props, emit);
</script>
