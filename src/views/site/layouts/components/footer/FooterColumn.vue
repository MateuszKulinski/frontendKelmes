<template>
  <div class="col-12 col-md mb-3">
    <div v-for="section in items" :key="section.id" class="footer-col mb-3">
      <h6 v-if="section.children?.length" class="footer-section-title">
        <FooterMenuLink :item="section" />
      </h6>
      <ul v-if="section.children?.length" class="list-unstyled">
        <FooterMenuItem v-for="item in section.children" :key="item.id" :item="item" />
      </ul>
      <div v-else class="footer-single-link"><FooterMenuLink :item="section" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/core/stores/contentStore'
import FooterMenuItem from './FooterMenuItem.vue'
import FooterMenuLink from './FooterMenuLink.vue'
defineProps<{ items: MenuItem[] }>()
</script>

<style scoped>
.footer-section-title {
  font-weight: 600;
  font-size: var(--font-size-md);
  line-height: 1.25;
  margin-bottom: var(--margin-xl);
}

.footer-single-link {
  margin-bottom: var(--margin-md);
}
</style>
