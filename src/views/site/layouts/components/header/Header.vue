<template>
  <div class="fill-header" :style="{ height: isFixed ? `${headerHeight}px` : '0' }"></div>
  <header ref="headerRef" class="app-header" :class="{ 'fixed': isFixed }"
    :style="{ '--header-height': `${headerHeight}px` }">
    <!-- GÓRNY BAR -->
    <div class="topbar">
      <div class="content-container d-flex justify-content-between top-bar-section">
        <div v-if="freeDeliveryMessage" class="free-delivery-message" role="status" aria-live="polite">
          <BaseIcon name="delivery" aria-hidden="true" />
          <span>{{ freeDeliveryMessage }}</span>
        </div>

        <div class="top-bar-actions">
          <LanguageSwitcher />
          <PriceTypeSwitch />
        </div>
      </div>
    </div>
    <div class="header-main">
      <div class="middlebar">
        <div class="content-container header-middle">
          <!-- LEFT -->
          <div class="left-section">
            <!-- LOGO z backendu -->
            <router-link :to="t('url.routes.dashboard')">
              <img src="/img/logo.png" alt="Logo" class="header-logo" />
            </router-link>
          </div>

          <!-- CENTER -->
          <div class="center-secton">
            <SearchProduct ref="searchProductRef" :on-select="handleProductSelect">
              <template #action>
                <AiChatSearchButton @click="openAiSearch" />
                <router-link :to="t('url.routes.inquiries')" class="text-decoration-none inquiry-link">
                  <BaseButton variant="secondary" class="inquiry-button">{{ t('inquiry.ask_for_offer') }}</BaseButton>
                </router-link>
              </template>
            </SearchProduct>
          </div>

          <!-- RIGHT -->
          <div class="d-flex justify-content-end align-items-center right-section">
            <router-link :to="t('url.routes.compare')"
              class="cart-header-link d-flex align-items-center text-decoration-none flex-column"
              :aria-label="t('compare.title')">
              <BaseIcon name="compare" />
              <span v-if="compareCount > 0" class="cart-badge white">
                {{ compareCount }}
              </span>
              <span class="item-title">{{ t('compare.title') }}</span>
            </router-link>
            <router-link :to="t('url.routes.favourites')"
              class="cart-header-link d-flex align-items-center text-decoration-none flex-column"
              :aria-label="t('favourite.title')">
              <BaseIcon name="heartOutline" />
              <span class="item-title">{{ t('favourite.title') }}</span>
            </router-link>
            <UserMenu compact />
            <router-link :to="t('url.routes.mainCart')"
              class="cart-header-link d-flex align-items-center text-decoration-none flex-column"
              :aria-label="t('cart.title')">
              <span class="custom-icon icon-cart"></span>
              <span v-if="cartCount !== null && cartCount > 0" class="cart-badge white">
                {{ cartCount }}
              </span>
              <span class="item-title">{{ t('cart.title') }}</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- DOLNY BAR (MENU) -->
      <div class="menubar">
        <div class="content-container header-bottom">
          <Menu />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";

import LanguageSwitcher from "@topbar/LanguageSwitcher.vue";

// komponenty
import UserMenu from "@topbar/UserMenu.vue";
import PriceTypeSwitch from "@/views/shared/components/PriceTypeSwitch/PriceTypeSwitch.vue";
import Menu from "@site/layouts/components/menu/Menu.vue";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";
import SearchProduct from "@/views/shared/components/SearchProduct/SearchProduct.vue";
import BaseButton from "@/views/shared/ui/BaseButton.vue";
import AiChatSearchButton from "@site/layouts/components/aiChat/AiChatSearchButton.vue";

// tlumaczenia
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

import { useRouter } from "vue-router";
import { useUrlResolver } from "@/composables/useUrlResolver";
import type { UrlObject } from "@/composables/useUrlResolver";
// import type { ProductSearchItem } from "@/views/shared/components/SearchProduct/SearchProduct";

import type { ProductSearchItem } from
  "@/composables/types/productSearch";

const emit = defineEmits<{ openAiChat: [query: string] }>()
const searchProductRef = ref<InstanceType<typeof SearchProduct> | null>(null)

function openAiSearch() {
  const query = searchProductRef.value?.getQuery().trim() ?? ''
  searchProductRef.value?.clear()
  emit('openAiChat', query)
}

// store
import { useCartStore } from "@/core/stores/cartStore";
import { useCompareStore } from "@/core/stores/compareStore";
import { useAuthStore } from "@/core/stores/authStore";

const router = useRouter();
const { resolve } = useUrlResolver();

function handleProductSelect(product: ProductSearchItem) {
  const path = resolve(product.url as UrlObject);
  router.push(path);
}

const cartStore = useCartStore();
const cartCount = computed(() => cartStore.count);
const freeDeliveryMessage = computed(() => {
  const freeDelivery = cartStore.cart?.free_delivery;
  if (!freeDelivery) return "";
  if (freeDelivery.always_free || freeDelivery.achieved) {
    return t("cart.free_delivery_achieved");
  }
  if (!freeDelivery.threshold || freeDelivery.remaining === null) return "";

  return t("cart.free_delivery_remaining", {
    amount: freeDelivery.remaining_formatted,
  });
});

const compareStore = useCompareStore()
const compareCount = computed(() => compareStore.count)
const authStore = useAuthStore();

const isFixed = ref(false);
const headerRef = ref<HTMLElement | null>(null);
const headerHeight = ref(0);

let resizeObserver: ResizeObserver | undefined;

function handleScroll() {
  isFixed.value = window.scrollY > headerHeight.value;
}

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    headerHeight.value = headerRef.value?.offsetHeight ?? 0;
    handleScroll();
  });
  if (headerRef.value) {
    headerHeight.value = headerRef.value.offsetHeight;
    resizeObserver.observe(headerRef.value);
  }
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  void cartStore.loadActiveCart();
});

watch(
  () => authStore.currentUnitId,
  (unitId, previousUnitId) => {
    if (unitId !== previousUnitId) {
      void cartStore.loadActiveCart();
    }
  },
);

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.header-middle {
  display: grid;
  grid-template-columns: minmax(120px, .7fr) minmax(200px, 1fr) auto;
  grid-template-columns: minmax(120px, .2fr) minmax(200px, .5fr) minmax(120px, .3fr);
  align-items: center;
  gap: 8px;
}

.app-header .content-container {
  padding-inline: var(--padding-md);
}

.left-section,
.center-secton {
  min-width: 0;
}

.center-secton {
  width: 100%;
}

.left-section a {
  display: inline-flex;
  align-items: center;
}

.header-logo {
  display: block;
  height: 40px;
  max-width: 100%;
  object-fit: contain;
}

.cart-header-link {
  position: relative;
  font-size: 1.2rem;
  color: inherit;
}

:deep(.cart-badge) {
  position: absolute;
  top: -6px;
  right: 0;
  background: var(--secondary-accent);
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  min-width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-icon {
  background-color: #000;
  height: 19.2px;
  width: 24px;
}

.right-section {
  gap: var(--gap-md);
}

.right-section .item-title {
  font-size: var(--font-size-sm);
  color: #000000A6;
  font-weight: 400;
}

.center-secton :deep(.inquiry-button) {
  height: var(--search-btn-height);
  padding-inline: var(--padding-sm);
  white-space: nowrap;
  border-color: var(--accent) !important;
  background: var(--bg-surface) !important;
  color: var(--accent) !important;
  font-size: var(--font-size-sm-plus) !important;
  font-weight: 500;
}

.center-secton :deep(.inquiry-button:hover) {
  background: var(--accent-muted) !important;
}

.center-secton :deep(.ai-chat-search-button) {
  font-size: var(--font-size-sm-plus) !important;
  font-weight: 500;
}

.top-bar-section {
  align-items: center;
  gap: 8px;
  padding-inline: var(--padding-md);
}

.top-bar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.free-delivery-message {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm-plus);
  font-weight: 600;
}

@media (max-width: 992px) {
  .header-main {
    position: relative;
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    padding: var(--padding-sm) var(--padding-md);
  }

  .app-header .middlebar,
  .header-middle,
  .app-header .menubar,
  .header-bottom {
    display: contents;
  }

  .left-section {
    grid-column: 1 / 3;
    grid-row: 1;
  }

  .header-logo {
    width: auto;
    height: auto;
    max-width: min(140px, 100%);
    max-height: 40px;
  }

  .right-section {
    --header-action-gap: 4px;
    grid-column: 3;
    grid-row: 1;
    gap: 4px;
  }

  .right-section :deep(.item-title) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .cart-header-link {
    width: 40px;
    height: 44px;
    justify-content: center;
    flex-shrink: 0;
    font-size: 22px;
    border-radius: var(--radius-sm);
  }

  .cart-header-link:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .cart-badge {
    top: 0;
    right: 0;
    padding-inline: 3px;
    width: auto;
    min-width: 16px;
    height: 16px;
  }

  .custom-icon {
    height: 24px;
    width: 28px;
  }

  .center-secton {
    grid-column: 2 / 4;
    grid-row: 2;
  }

  .center-secton :deep(.inquiry-link) {
    display: none;
  }

  .center-secton :deep(.form-control) {
    min-height: 44px;
    font-size: 16px;
    border-radius: var(--radius-md);
  }

  .center-secton :deep(.results) {
    max-height: min(400px, calc(100dvh - var(--header-height) - 12px));
    text-align: left;
  }

  .center-secton :deep(.title) {
    overflow-wrap: anywhere;
  }

  .top-bar-section {
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px;
  }

  .top-bar-actions :deep(.position-relative) {
    width: 100px !important;
  }
}

@media (max-width: 359.98px) {
  .right-section {
    --header-action-gap: 0px;
    gap: 0;
  }
}
</style>
