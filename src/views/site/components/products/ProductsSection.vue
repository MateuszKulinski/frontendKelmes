<template>
    <section v-if="products.length" ref="sectionEl" class="products-section d-flex flex-column justify-content-center">
        <h2 class="products-section-title d-flex align-items-center">
            <span class="custom-icon icon-sparkle"></span>
            {{ title }}
        </h2>

        <div ref="swiperEl" class="swiper products-swiper">
            <div class="swiper-wrapper">
                <div v-for="product in products" :key="product.id" class="swiper-slide">
                    <ProductCard :product="product" :viewType="'grid'" />
                </div>
            </div>
        </div>

        <div ref="prevEl" class="swiper-button-prev products-swiper-btn products-swiper-btn--prev"></div>

        <div ref="nextEl" class="swiper-button-next products-swiper-btn products-swiper-btn--next"></div>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Swiper from 'swiper'
import { Navigation } from 'swiper/modules'
import 'swiper/swiper-bundle.css'
import ProductCard from './ProductCard.vue'
import type { ProductItem } from '@/composables/indexStore'

const props = withDefaults(
    defineProps<{
        title: string
        products: ProductItem[]
        slidesPerView?: number
    }>(),
    {
        slidesPerView: 5,
    },
)

const swiperEl = ref<HTMLElement | null>(null)
const prevEl = ref<HTMLElement | null>(null)
const nextEl = ref<HTMLElement | null>(null)

let swiperInstance: Swiper | null = null

onMounted(() => {
    if (!swiperEl.value || !prevEl.value || !nextEl.value) return

    const x = props.slidesPerView

    swiperInstance = new Swiper(swiperEl.value, {
        modules: [Navigation],

        slidesPerView: 1,
        spaceBetween: 16,

        navigation: {
            prevEl: prevEl.value,
            nextEl: nextEl.value,
        },

        breakpoints: {
            576: {
                slidesPerView: 2,
                spaceBetween: 16,
            },

            900: {
                slidesPerView: 3,
                spaceBetween: 20,
            },

            1200: {
                slidesPerView: x,
                spaceBetween: 24,
            },
        },
    })
})

onBeforeUnmount(() => {
    swiperInstance?.destroy(true, true)
})
</script>

<style scoped>
.custom-icon {
    width: 15px;
    height: 15px;
}

.products-section {
    position: relative;
}

.products-section-title {
    font-size: var(--font-size-lg-plus);
    font-weight: 500;
    text-transform: uppercase;
    margin-bottom: var(--margin-xl);
    padding-bottom: var(--padding-md);
    border-bottom: 1px solid var(--border-default);
    gap: var(--gap-sm);
}

.products-section-title i {
    color: var(--accent);
    font-size: var(--font-size-md);
}

.products-swiper {
    position: relative;
    max-height: stretch;
    max-width: stretch;
}
@media (max-width: 575px) {
    .products-swiper .swiper-slide {
        min-width: 0;
    }
}

.products-swiper-btn {
    color: #fff;
    background-color: #4F78BEAD;
    border-radius: 50%;
    top: auto;
}

.products-swiper-btn--prev {
    left: 8px;
}

.products-swiper-btn--next {
    right: 8px;
}

.products-swiper-btn.swiper-button-disabled {
    background-color: #D9D9D9;
    opacity: 1;
    transition: var(--transition-default);
}

.products-swiper-btn :deep(.swiper-navigation-icon) {
    height: 20px;
}

.products-swiper-btn::after {
    font-size: 1.2rem;
}
</style>
