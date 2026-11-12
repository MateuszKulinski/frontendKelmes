<template>
  <div class="header-node">
    <a v-if="isExternal" :href="href" :target="item.target_blank ? '_blank' : undefined"
      :rel="item.target_blank ? 'noopener noreferrer' : undefined">{{ item.name }}</a>
    <router-link v-else-if="href" :to="routerHref" :target="item.target_blank ? '_blank' : undefined">
      {{ item.name }}
    </router-link>
    <button v-else-if="item.children?.length" type="button">{{ item.name }}</button>
    <span v-else>{{ item.name }}</span>
    <div v-if="item.children?.length" class="header-submenu">
      <HeaderMenuItem v-for="child in item.children" :key="child.id" :item="child" />
    </div>
  </div>
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
.header-node {
  position: relative;
  min-width: max-content;
}

.header-node>a,
.header-node>span,
.header-node>button {
  display: block;
  padding: 0px var(--padding-ex-sm);
  color: white;
  text-decoration: none;
  font-size: var(--font-size-md-plus);
}

.header-node>button {
  border: 0;
  background: transparent;
  cursor: pointer;
}

.header-node>a:hover,
.header-node>a:focus-visible,
.header-node>button:hover,
.header-node>button:focus-visible {
  color: var(--accent-strong);
}

.header-submenu {
  display: none;
  position: absolute;
  left: 0;
  top: 100%;
  min-width: 13.125rem;
  padding: var(--padding-sm);
  background: #fff;
  border: thin solid #ececec;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
}

.header-node:hover>.header-submenu,
.header-node:focus-within>.header-submenu {
  display: block;
}

.header-submenu .header-submenu {
  left: 100%;
  top: 0;
}

.header-submenu .header-node>a,
.header-submenu .header-node>span,
.header-submenu .header-node>button {
  color: #333;
  font-size: var(--font-size-md-minus);
  padding: var(--padding-sm);
}

.header-submenu .header-node>a:hover,
.header-submenu .header-node>a:focus-visible,
.header-submenu .header-node>button:hover,
.header-submenu .header-node>button:focus-visible {
  background: #f0f0f0;
  color: var(--bs-primary);
}
</style>
