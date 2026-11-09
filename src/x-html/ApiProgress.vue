<template>
  <div v-if="pending > 0" class="sta-api-progress" role="progressbar" aria-label="Loading"></div>
</template>

<script setup>
// A thin bar at the top of the page while any $api request is in flight (replaces Vue 2 STA's NProgress).
import {computed} from 'vue';

const pending = computed(() => window.stateTagApp.$read('sta.api.pending'));
</script>
