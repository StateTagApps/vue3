<template>
  <button v-if="undo.pending" type="button" class="sta-undo" @click.prevent.stop="cancel">
    <slot>&#8630;</slot> {{ remaining }}
  </button>
</template>

<script setup>
// Shows while an {undo: true} $api request is waiting; clicking cancels it (the request's promise rejects with UndoError).
import {computed, onBeforeUnmount, ref, watch} from 'vue';

const sta = window.stateTagApp;
const undo = computed(() => sta.$read('sta.undo'));
const now = ref(Date.now());
let ticker = null;

const remaining = computed(() => Math.max(0, Math.ceil((undo.value.until - now.value) / 1000)));

watch(() => undo.value.pending, pending => {
  clearInterval(ticker);
  if (pending) {
    now.value = Date.now();
    ticker = setInterval(() => {
      now.value = Date.now();
    }, 250);
  }
}, {immediate: true});

onBeforeUnmount(() => clearInterval(ticker));

const cancel = () => sta.undo();
</script>
