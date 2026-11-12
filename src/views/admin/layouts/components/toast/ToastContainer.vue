<template>
  <teleport to="body">
    <div class="toast-container">
      <div
        v-for="toast in ui.toasts"
        :key="toast.id"
        class="app-toast"
        :class="toast.type"
        @click="ui.removeToast(toast.id)"
      >
        {{ toast.message }}
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useUiStore } from "@/core/stores/uiStore";

const ui = useUiStore();
</script>

<style scoped src="./ToastContainer.css"></style>