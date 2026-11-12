<template>
  <li class="mb-2">
    <FooterMenuLink :item="item" />
    <ul v-if="item.children?.length" class="list-unstyled nested-items">
      <FooterMenuItem v-for="child in item.children" :key="child.id" :item="child" />
    </ul>
  </li>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/core/stores/contentStore'
import FooterMenuLink from './FooterMenuLink.vue'
defineProps<{ item: MenuItem }>()
</script>

<style scoped>
.nested-items {
  margin: var(--margin-md) 0 0 var(--margin-lg);
  padding-left: var(--padding-sm);
  border-left: thin solid var(--border-light);
}
</style>
