<template>
  <span><slot></slot>{{ status }}</span>
</template>

<script setup>
import {computed} from 'vue';
import {socketConnected} from '@/sta/socket';

const status = computed(() => {
  if (!window.stateTagApp.socketIo) {
    return 'not configured';
  }
  return socketConnected.value ? 'connected' : 'disconnected';
});
</script>
