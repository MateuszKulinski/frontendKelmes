<template>
  <div v-if="ui.loading" class="overlay">
    <div class="spinner"></div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from "@/core/stores/uiStore";

const ui = useUiStore();
</script>

<style scoped src="./Loader.css"></style>