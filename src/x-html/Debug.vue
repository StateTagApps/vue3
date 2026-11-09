<template>
  <pre>{{ error ? '[' + error + ']' : JSON.stringify(content, null, 2) }}</pre>
</template>

<script setup>
// Shows the raw value at a locus (any service) — for building and debugging pages.
import {sourceProps, useSource} from '@/sta/source';

const props = defineProps(sourceProps);

const {content, error} = useSource(props);
</script>
