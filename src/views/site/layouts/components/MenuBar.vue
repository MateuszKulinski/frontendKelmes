<template>
  <div class="container d-flex align-items-center justify-content-between">
    <!-- LEWA STRONA -->
    <Menu :items="menuItems" />

    <!-- PRAWA STRONA (na przyszłość) -->
    <div class="d-flex align-items-center gap-3">
      <!-- np. search, konto, itd -->
    </div>
  </div>
</template>

<script setup lang="ts">
import Menu from "./menu/Menu.vue";

defineProps({
  menuItems: Array,
});
</script>