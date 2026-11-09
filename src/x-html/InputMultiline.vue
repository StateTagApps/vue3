<template>
  <div class="sta-field">
    <label>
      <i v-if="icon" :class="'fa fa-' + icon"></i>
      <span v-else>{{ label }}</span>
    </label>
    <textarea :name="name"
              :placeholder="placeholder"
              :required="required"
              :rows="rows"
              v-model="content"
              :disabled="!!error"
              @change="onChange"
              @blur="onBlur"></textarea>
    <span v-if="error" class="sta-error">[{{ error }}]</span>
  </div>
</template>

<script setup>
import {sourceProps, useSource} from '@/sta/source';
import {fieldProps, useField} from '@/composables/useField';

const props = defineProps({
  ...sourceProps,
  ...fieldProps,
  rows: {type: Number, default: 3}
});

const emit = defineEmits(['updated']);

const {content, error} = useSource(props);
const {label, onChange, onBlur} = useField(props, emit);
</script>
