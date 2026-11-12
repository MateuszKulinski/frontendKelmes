<template>
  <section class="ai-products" :aria-label="label || t('aiChat.recommended_products')">
    <div class="ai-products-heading">
      <div class="ai-products-title"><strong v-if="showTitle">{{ t('aiChat.products') }}</strong><span class="ai-products-count">{{ slideCount }}</span></div>
      <div v-show="slideCount > 1" class="ai-products-controls">
        <button ref="prevEl" type="button" :aria-label="t('aiChat.previous_product')"><BaseIcon name="chLeft" class="ai-chat-icon" aria-hidden="true" /></button>
        <button ref="nextEl" type="button" :aria-label="t('aiChat.next_product')"><BaseIcon name="chRight" class="ai-chat-icon" aria-hidden="true" /></button>
      </div>
    </div>
    <div ref="swiperEl" class="swiper ai-products-swiper">
      <div class="swiper-wrapper">
        <slot name="slides">
        <div v-for="product in products" :key="product.id" class="swiper-slide">
          <article class="ai-product-card">
            <router-link :to="resolve(product.url ?? null)" class="ai-product-link">
              <ProductImage :src="product.image" :alt="product.name ?? ''" />
              <small v-if="product.catalog_number">{{ t('aiChat.catalog_number') }}: {{ product.catalog_number }}</small>
              <small v-else-if="product.indeks">{{ t('aiChat.index') }}: {{ product.indeks }}</small>
              <strong>{{ product.name || t('aiChat.product') }}</strong>
            </router-link>
            <p v-if="isNet && product.net_price" class="ai-product-price">{{ product.net_price }} <small>{{ t('aiChat.net') }}</small></p>
            <p v-if="isGross && product.gross_price" class="ai-product-price">{{ product.gross_price }} <small>{{ t('aiChat.gross') }}</small></p>
          </article>
        </div>
        </slot>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Swiper from 'swiper'
import { A11y, Navigation } from 'swiper/modules'
import 'swiper/swiper-bundle.css'
import { useUrlResolver } from '@/composables/useUrlResolver'
import { usePriceTypeStore } from '@/core/stores/priceTypeStore'
import ProductImage from '@/views/site/components/products/ProductImage.vue'
import { useI18n } from 'vue-i18n'
import type { AiChatProduct } from './aiChatApi'
import './AiChatProductCarousel.css'

const props = withDefaults(defineProps<{ products?: AiChatProduct[]; itemCount?: number; label?: string; showTitle?: boolean }>(), {
  products: () => [],
  showTitle: true,
})
const slideCount = computed(() => props.itemCount ?? props.products.length)
const swiperEl = ref<HTMLElement | null>(null)
const prevEl = ref<HTMLButtonElement | null>(null)
const nextEl = ref<HTMLButtonElement | null>(null)
let swiperInstance: Swiper | null = null
const { resolve } = useUrlResolver()
const { isNet, isGross } = storeToRefs(usePriceTypeStore())
const { t } = useI18n()

onMounted(() => {
  if (!swiperEl.value || !prevEl.value || !nextEl.value) return

  swiperInstance = new Swiper(swiperEl.value, {
    modules: [Navigation, A11y],
    speed: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240,
    a11y: {
      prevSlideMessage: t('aiChat.previous_product'), nextSlideMessage: t('aiChat.next_product'),
      slideLabelMessage: '{{index}} / {{slidesLength}}',
    },
    slidesPerView: 'auto',
    spaceBetween: parseFloat(getComputedStyle(swiperEl.value).getPropertyValue('--gap-sm')) || 10,
    watchOverflow: true,
    nested: true,
    navigation: {
      prevEl: prevEl.value,
      nextEl: nextEl.value,
    },
  })
})

watch([() => props.products, () => props.itemCount], async () => {
  await nextTick()
  swiperInstance?.update()
}, { deep: true })

onBeforeUnmount(() => {
  swiperInstance?.destroy(true, true)
})
</script>
