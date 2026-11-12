<template>
  <div ref="menuRef" class="menu-wrapper">
    <nav class="main-menu desktop-menu" :aria-label="t('menu.navigation')">
      <div class="category-links">
        <MegaMenu v-for="item in categoryItems" :key="item.id" :item="item" />
      </div>
      <div class="links">
        <HeaderMenuItem v-for="item in otherItems" :key="item.id" :item="item" />
      </div>
    </nav>

    <button ref="toggleRef" type="button" class="mobile-menu-toggle"
      :aria-label="t(mobileOpen ? 'menu.close' : 'menu.open')" :aria-expanded="mobileOpen"
      :aria-controls="mobileMenuId" @click="mobileOpen = !mobileOpen">
      <BaseIcon :name="mobileOpen ? 'remove' : 'hamburger'" />
    </button>

    <nav v-if="mobileOpen" :id="mobileMenuId" class="mobile-menu-panel" :aria-label="t('menu.navigation')">
      <ul class="mobile-menu-list">
        <MobileMenuItem v-for="item in mobileItems" :key="item.id" :item="item" @navigate="closeMenu" />
        <li class="mobile-inquiry">
          <router-link :to="t('url.routes.inquiries')" @click="closeMenu">
            {{ t('inquiry.ask_for_offer') }}
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, useId, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MegaMenu from './MegaMenu.vue'
import HeaderMenuItem from './HeaderMenuItem.vue'
import MobileMenuItem from './MobileMenuItem.vue'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import { useContentStore } from '@/core/stores/contentStore'
const { menu } = storeToRefs(useContentStore())
const categoryItems = computed(() => menu.value.filter(item => item.type === 'category'))
const otherItems = computed(() => menu.value.filter(item => item.type !== 'category'))
const mobileItems = computed(() => [...categoryItems.value, ...otherItems.value])

const { t } = useI18n()
const route = useRoute()
const mobileOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const toggleRef = ref<HTMLButtonElement | null>(null)
const mobileMenuId = `mobile-menu-${useId()}`
let mobileQuery: MediaQueryList | undefined

function closeMenu() {
  mobileOpen.value = false
}

function handleOutsideClick(event: PointerEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) closeMenu()
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && mobileOpen.value) {
    closeMenu()
    toggleRef.value?.focus()
  }
}

watch(() => route.fullPath, closeMenu)

onMounted(() => {
  mobileQuery = window.matchMedia('(max-width: 62rem)')
  mobileQuery.addEventListener('change', closeMenu)
  document.addEventListener('pointerdown', handleOutsideClick)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  mobileQuery?.removeEventListener('change', closeMenu)
  document.removeEventListener('pointerdown', handleOutsideClick)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.mobile-menu-toggle,
.mobile-menu-panel {
  display: none;
}

.main-menu {
  padding-top: var(--padding-ex-sm);
  padding-bottom: var(--padding-ex-sm);
  display: flex;
  align-items: center;
}

.main-menu::after {
  content: '';
  flex: 1 1 0;
  min-width: 0;
}

.menu-wrapper {
  width: 100%;
}

.links {
  gap: var(--gap-lg);
  display: flex;
  flex: 0 1 auto;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  min-width: 0;
}

.category-links {
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  justify-content: flex-start;
  align-items: center;
  gap: var(--gap-sm);
}

@media (max-width: 62rem) {
  .menu-wrapper {
    grid-column: 1;
    grid-row: 2;
    min-width: 0;
  }

  .desktop-menu {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(var(--padding-lg) + var(--padding-xl));
    height: calc(var(--padding-lg) + var(--padding-xl));
    padding: 0;
    border: thin solid var(--border-light);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--font-size-lg-plus);
    cursor: pointer;
  }

  .mobile-menu-toggle:focus-visible {
    outline: 0.125rem solid var(--accent);
    outline-offset: 0.125rem;
  }

  .mobile-menu-panel {
    position: absolute;
    top: 100%;
    left: var(--padding-sm);
    right: var(--padding-sm);
    display: block;
    max-height: calc(100vh - var(--header-height, 10rem) - var(--padding-sm));
    max-height: calc(100dvh - var(--header-height, 10rem) - var(--padding-sm));
    overflow-y: auto;
    overscroll-behavior: contain;
    background: var(--bg-surface);
    color: var(--text-primary);
    border: thin solid var(--border-light);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 1001;
  }

  .mobile-menu-list {
    list-style: none;
    margin: 0;
    padding: var(--padding-sm);
  }

  .mobile-inquiry {
    margin-top: var(--margin-md);
    border-top: thin solid var(--border-light);
    padding-top: var(--padding-sm);
  }

  .mobile-inquiry a {
    display: flex;
    align-items: center;
    min-height: calc(var(--padding-lg) + var(--padding-xl));
    padding: var(--padding-sm) var(--padding-md);
    color: var(--accent);
    text-decoration: none;
    overflow-wrap: anywhere;
  }
}
</style>
