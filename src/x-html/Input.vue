<template>
  <div class="sta-field">
    <label>
      <i v-if="icon" :class="'fa fa-' + icon"></i>
      <span v-else>{{ label }}</span>
    </label>
    <input :type="type"
           :name="name"
           :placeholder="placeholder"
           :required="required"
           :maxlength="maxlength"
           v-model="content"
           :disabled="!!error"
           @change="onChange"
           @blur="onBlur">
    <span v-if="error" class="sta-error">[{{ error }}]</span>
  </div>
</template>

<script setup>
import {sourceProps, useSource} from '@/sta/source';
import {fieldProps, useField} from '@/composables/useField';

const props = defineProps({
  ...sourceProps,
  ...fieldProps,
  type: {type: String, default: 'text'},
  maxlength: {type: Number, default: null}
});

const emit = defineEmits(['updated']);

const {content, error} = useSource(props);
const {label, onChange, onBlur} = useField(props, emit);
</script>
