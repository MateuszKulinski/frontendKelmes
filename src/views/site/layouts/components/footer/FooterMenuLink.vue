<template>
  <a v-if="isExternal" :href="href" :target="item.target_blank ? '_blank' : undefined"
    :rel="item.target_blank ? 'noopener noreferrer' : undefined" class="footer-link">{{ item.name }}</a>
  <router-link v-else-if="href" :to="routerHref" :target="item.target_blank ? '_blank' : undefined"
    class="footer-link">{{ item.name }}</router-link>
  <span v-else>{{ item.name }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuItem } from '@/core/stores/contentStore'
import { isExternalUrl, toInternalUrl, useUrlResolver } from '@/composables/useUrlResolver'
const props = defineProps<{ item: MenuItem }>()
const { resolve } = useUrlResolver()
const href = computed(() => resolve(props.item.url))
const isExternal = computed(() => !!props.item.url && isExternalUrl(href.value))
const routerHref = computed(() => isExternal.value ? href.value : toInternalUrl(href.value))
</script>

<style scoped>
.footer-link {
  color: inherit;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}
</style>
