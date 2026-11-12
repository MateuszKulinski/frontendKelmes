<template>
  <component
    :is="component"
    v-if="component && contentStore.page"
    :data="contentStore.page"
  />

  <div v-else-if="contentStore.loading" class="loader-wrapper">
    <div class="spinner"></div>
  </div>

  <div v-else>Nie znaleziono</div>
</template>

<script setup lang="ts">
import { useDynamicPage } from "./DynamicPage";

const { component, contentStore } = useDynamicPage();
</script>

<style scoped>
.loader-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  animation: fadeIn 0.2s ease-in;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>