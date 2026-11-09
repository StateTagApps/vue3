<template>
  <div class="sta-field">
    <label>
      <i v-if="icon" :class="'fa fa-' + icon"></i>
      <span v-else>{{ label }}</span>
    </label>
    <select :name="name" v-model="content" :disabled="!!problem" @change="onChange" @blur="onBlur">
      <option v-for="(language, code) in languages.options" :key="code" :value="code">
        {{ code.toUpperCase() }} - {{ language }}
      </option>
    </select>
    <span v-if="problem" class="sta-error">[{{ problem }}]</span>
  </div>
</template>

<script setup>
// Pick a language for any locus (e.g. a user's preferred language), from langpack.options.
import {computed} from 'vue';
import {sourceProps, useSource} from '@/sta/source';
import {fieldProps, useField} from '@/composables/useField';
import {useLanguages} from '@/composables/useLanguages';

const props = defineProps({...sourceProps, ...fieldProps});
const emit = defineEmits(['updated']);

const {content, error} = useSource(props);
const {label, onChange, onBlur} = useField(props, emit);
const languages = useLanguages();

const problem = computed(() => error.value || languages.value.error);
</script>
