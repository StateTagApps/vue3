<template>
  <button :type="type"
          class="btn sta-progress-button"
          :class="'btn-' + variant"
          :disabled="disabled || busy">
    <slot></slot>
    <span v-if="busy" class="sta-progress-stripe"></span>
  </button>
</template>

<script setup>
// A button that shows a moving stripe while busy: loading="true", or bound to state with loading-locus
// (e.g. loading-locus="sta.api.pending" — any truthy value counts as busy).
import {computed} from 'vue';

const props = defineProps({
  variant: {type: String, default: 'primary'},
  loading: {type: Boolean, default: false},
  loadingLocus: {type: String, default: null},
  disabled: {type: Boolean, default: false},
  type: {type: String, default: 'button'}
});

const busy = computed(() => props.loading || (!!props.loadingLocus && !!window.stateTagApp.$read(props.loadingLocus)));
</script>
