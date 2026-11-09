<template>
  <component v-if="isHtml"
             :is="wrapper.tag"
             :class="wrapper.classes"
             v-show="visible"
             v-html="display">
  </component>

  <component v-else
             :is="wrapper.tag"
             :class="wrapper.classes"
             v-show="visible"
  >{{ display }}</component>
</template>

<script setup>
import {computed} from 'vue';
import {sourceProps, useSource} from '@/sta/source';
import {tagSpec} from '@/sta/tagSpecs';
import {applyFilters, parseFilters} from '@/sta/formatters';
import {isEmptyContent} from '@/sta/util';

const props = defineProps({
  ...sourceProps,
  fallback: {type: String, default: ''},
  tagSpecs: {type: String, default: 'div,span'},
  isHtml: {type: Boolean, default: false},
  filters: {type: String, default: '[]'}
});

const {content, error, statusMessage} = useSource(props);

const rendered = computed(() => {
  try {
    const wrapper = tagSpec(props.tagSpecs, props.isHtml ? 0 : 1);

    if (error.value) {
      return {wrapper, text: `[${error.value}]`};
    }

    if (statusMessage.value) {
      return {wrapper, text: statusMessage.value};
    }

    const value = content.value;
    const text = isEmptyContent(value) && typeof value !== 'number'
        ? props.fallback
        : applyFilters(window.stateTagApp, value, parseFilters(props.filters));

    return {wrapper, text};
  } catch (e) {
    return {wrapper: {tag: 'span', classes: ''}, text: `[${e.message}]`};
  }
});

const wrapper = computed(() => rendered.value.wrapper);
const display = computed(() => rendered.value.text);
const visible = computed(() => !isEmptyContent(display.value) || typeof display.value === 'number');
</script>
