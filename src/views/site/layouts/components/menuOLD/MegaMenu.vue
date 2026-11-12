<template>
  <div class="position-relative mega-wrapper d-flex align-items-center" @mouseenter="open(item.id)" @mouseleave="close">
    <!-- BUTTON -->
    <BaseIcon name="hamburger" />
    <router-link v-if="item.type !== 'external'" :to="resolve(item.url)"
      class="d-block text-decoration-none text-white">
      {{ item.name }}
    </router-link>

    <a v-else :href="item.url?.url" target="_blank" class="d-block text-decoration-none text-dark">
      {{ item.name }}
    </a>

    <!-- MEGA MENU -->
    <div class="mega-menu shadow bg-white p-4" v-show="isOpen(item.id)">
      <div class="row">
        <MegaColumn v-for="child in item.children" :key="child.id" :item="child" :level="1" />
      </div>
    </div>
  </div>
</template>

<script setup>
import MegaColumn from "./MegaColumn.vue";
import "./MegaMenu.css";
import { useUrlResolver } from "@/composables/useUrlResolver";
import { useMenu } from "./Menu.ts";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";

const { resolve } = useUrlResolver();
const { open, close, isOpen } = useMenu();

defineProps({
  item: Object,
});
</script>
<style scoped>
.mega-wrapper {
  padding: var(--padding-sm) 0;
  gap: var(--gap-lg);
  cursor: pointer;
}

.mega-menu {
  cursor: auto;
}
</style>