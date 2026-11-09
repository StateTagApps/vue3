<template>
  <span v-if="error" class="sta-error">[{{ error }}]</span>
  <span v-else-if="count > 0" class="sta-badge">{{ display }}</span>
</template>

<script setup>
// A count pill, hidden at zero; large counts shorten (1500 → 1.5k).
import {computed} from 'vue';
import {sourceProps, useSource} from '@/sta/source';

const props = defineProps(sourceProps);

const {content, error} = useSource(props);

const count = computed(() => Number(content.value) || 0);
const display = computed(() => window.stateTagApp.formatters.k(count.value));
</script>
