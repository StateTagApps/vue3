<template>
  <div v-if="open" class="sta-modal-backdrop" @click.self="backdropClose">
    <div class="sta-modal" role="dialog" aria-modal="true">
      <div class="sta-modal-header">
        <span>{{ translate(modal.header) }}</span>
        <button v-if="modal.options.x" type="button" class="sta-modal-close" aria-label="Close" @click="close">&times;</button>
      </div>

      <div v-if="modal.error" class="sta-modal-error">{{ translate(modal.error) }}</div>

      <div v-if="isHtml" class="sta-modal-body" v-html="modal.body"></div>
      <div v-else class="sta-modal-body">{{ modal.body }}</div>
    </div>
  </div>
</template>

<script setup>
// Renders sta.modal. Open with stateTagApp.showModal(header, body, {x, backdrop, keyboard}); close with hideModal().
import {computed, onBeforeUnmount, onMounted} from 'vue';

const sta = window.stateTagApp;

const modal = computed(() => sta.$read('sta.modal'));
const open = computed(() => !!(modal.value.header || modal.value.body));
const isHtml = computed(() => /<\/?[a-z][\s\S]*>/i.test(String(modal.value.body).trim()));

const translate = key => (key ? sta.$translate(key) : '');
const close = () => sta.hideModal();

const backdropClose = () => {
  if (modal.value.options.backdrop) {
    close();
  }
};

const onKey = event => {
  if (event.key === 'Escape' && open.value && modal.value.options.keyboard) {
    close();
  }
};

onMounted(() => document.addEventListener('keydown', onKey));
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
</script>
