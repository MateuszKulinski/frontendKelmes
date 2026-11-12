<template>
  <li class="mobile-menu-item">
    <div class="mobile-menu-row">
      <a v-if="isExternal" :href="href" class="mobile-menu-link" :target="item.target_blank ? '_blank' : undefined"
        :rel="item.target_blank ? 'noopener noreferrer' : undefined" @click="emit('navigate')">
        {{ item.name }}
      </a>
      <router-link v-else-if="item.url" :to="routerHref" class="mobile-menu-link"
        :target="item.target_blank ? '_blank' : undefined"
        :rel="item.target_blank ? 'noopener noreferrer' : undefined" @click="emit('navigate')">
        {{ item.name }}
      </router-link>
      <button v-else-if="item.children?.length" type="button" class="mobile-menu-link mobile-menu-heading"
        :aria-expanded="expanded" :aria-controls="childrenId" @click="expanded = !expanded">
        {{ item.name }}
      </button>
      <span v-else class="mobile-menu-link">{{ item.name }}</span>

      <button v-if="item.children?.length" type="button" class="mobile-submenu-toggle"
        :aria-label="t(expanded ? 'menu.collapse' : 'menu.expand', { name: item.name })"
        :aria-expanded="expanded" :aria-controls="childrenId" @click="expanded = !expanded">
        <BaseIcon :name="expanded ? 'chUp' : 'chDown'" />
      </button>
    </div>

    <ul v-if="expanded" :id="childrenId" class="mobile-submenu">
      <MobileMenuItem v-for="child in visibleChildren" :key="child.id" :item="child" :depth="depth + 1" @navigate="emit('navigate')" />
      <li v-if="hiddenCount && depth === 0">
        <button type="button" class="mobile-more" :aria-expanded="showAll" @click="showAll = !showAll">
          {{ showAll ? t('menu.less') : t('menu.more') }} <span v-if="!showAll">+{{ hiddenCount }}</span>
        </button>
      </li>
      <li v-if="hasMoreChildren">
        <button type="button" class="mobile-all-categories" :aria-expanded="showAllChildren" @click="showAllChildren = !showAllChildren">
          {{ showAllChildren ? t('menu.less') : t('menu.allCategories') }} {{ showAllChildren ? '↑' : '↓' }}
        </button>
      </li>
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { isExternalUrl, toInternalUrl, useUrlResolver, type UrlObject } from '@/composables/useUrlResolver'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'

interface MobileItem {
  id: number
  name: string
  url: UrlObject
  type?: string
  target_blank?: boolean
  children?: MobileItem[]
  has_children?: boolean
}

const props = withDefaults(defineProps<{ item: MobileItem; depth?: number }>(), { depth: 0 })
const emit = defineEmits<{ navigate: [] }>()
const { t } = useI18n()
const { resolve } = useUrlResolver()
const expanded = ref(false)
const showAll = ref(false)
const showAllChildren = ref(false)
const childrenId = `mobile-submenu-${useId()}`
const href = computed(() => resolve(props.item.url))
const isExternal = computed(() => !!props.item.url && isExternalUrl(href.value))
const routerHref = computed(() => isExternal.value ? href.value : toInternalUrl(href.value))
const visibleChildren = computed(() => {
  if ((props.depth === 0 && showAll.value) || (props.depth >= 1 && showAllChildren.value)) {
    return props.item.children || []
  }
  return (props.item.children || []).slice(0, props.depth === 0 ? 10 : 6)
})
const hiddenCount = computed(() => Math.max(0, (props.item.children?.length || 0) - 10))
const hasMoreChildren = computed(() => props.depth >= 1 &&
  (props.item.children?.length || 0) > 6)
</script>

<style scoped>
.mobile-menu-row {
  display: flex;
  align-items: stretch;
  min-width: 0;
}

.mobile-menu-link {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  min-height: calc(var(--padding-lg) + var(--padding-xl));
  padding: var(--padding-sm) var(--padding-md);
  color: var(--text-primary);
  text-decoration: none;
  text-align: left;
  overflow-wrap: anywhere;
  border-radius: var(--radius-sm);
}

.mobile-menu-heading,
.mobile-submenu-toggle {
  border: 0;
  background: transparent;
  cursor: pointer;
}

.mobile-submenu-toggle {
  flex: 0 0 calc(var(--padding-lg) + var(--padding-xl));
  min-height: calc(var(--padding-lg) + var(--padding-xl));
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
}

.mobile-menu-link:hover,
.mobile-menu-link.router-link-exact-active,
.mobile-submenu-toggle:hover {
  background: var(--accent-muted);
  color: var(--accent);
}

button:focus-visible,
a:focus-visible {
  outline: 0.125rem solid var(--accent);
  outline-offset: -0.125rem;
}

.mobile-submenu {
  list-style: none;
  margin: 0 0 var(--margin-sm) var(--margin-md);
  padding: 0 0 0 var(--padding-sm);
  border-left: thin solid var(--border-light);
}
.mobile-more,
.mobile-all-categories {
  display: block;
  width: 100%;
  padding: var(--padding-sm) var(--padding-md);
  border: 0;
  background: transparent;
  color: var(--accent);
  text-align: left;
  text-decoration: none;
  font-weight: 600;
}
</style>
