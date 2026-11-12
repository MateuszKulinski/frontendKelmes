<template>
    <div class="product-info col-md-5">
        <div class="title-section">
            <div class="d-flex justify-content-between align-items-start">
                <div class="title-container d-flex">
                    <!-- <span class="blue-line"></span> -->
                    <h1 class="product-title">{{ product.name }}</h1>
                </div>
                <FavouriteButton v-if="auth.isLogged" :product-id="product.id" />
            </div>
            <div class="title-section-bottom">
                <div class="product-meta">
                    <ProductRating :rating="product.rating" />

                    <div v-if="product.catalog_number" class="product-code">
                        <span>
                            <b>{{ t('products.details.nr_katalogowy') }}:</b>
                            {{ product.catalog_number }}
                        </span>
                    </div>
                </div>

                <div v-if="product.manufacturer && product.manufacturer.logo" class="product-manufacturer">
                    <router-link v-if="product.manufacturer" :to="resolve(product.manufacturer.url)">
                        <img :src="product.manufacturer.logo.replace(
                            'http://127.0.0.1:8000',
                            'https://cliply-test-b2b.exis24.pl'
                        )" :alt="product.manufacturer.name" class="manufacturer-logo" />
                    </router-link>
                </div>
            </div>
        </div>

        <div class="product-details d-flex flex-column">
            <div class="product-details-wrapper" :class="{ expanded: showAllFeatures }">
                <div class="product-details d-flex flex-column">
                    <p v-if="product.uom">
                        {{ t('products.details.jednostka') }}:
                        <b>{{ product.uom }}</b>
                    </p>

                    <p v-if="product.manufacturer && !product.manufacturer.logo">
                        {{ t('products.details.marka') }}:
                        <b>{{ product.manufacturer.name }}</b>
                    </p>

                    <div v-for="feature in visibleFeatures" :key="feature.name">
                        <p>{{ feature.name }}: <b>{{ feature.value }}</b></p>
                    </div>
                </div>
            </div>

            <button v-if="hasHiddenFeatures" type="button" class="show-more-btn"
                @click="showAllFeatures = !showAllFeatures">
                {{ showAllFeatures ? t('common.show_less') : t('common.show_more') }}
            </button>
        </div>
        <ProductVariants v-if="product.variants.length" :variants="product.variants" />

    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FavouriteButton from '@shared/ui/FavouriteButton.vue'
import { useAuthStore } from '@/core/stores/authStore'
import ProductRating from './ProductRating.vue'
import ProductVariants from './ProductVariants.vue'
import { useUrlResolver } from '@/composables/useUrlResolver'

const props = defineProps<{
    product: any
}>()

const { resolve } = useUrlResolver()
const { t } = useI18n()
const auth = useAuthStore()

const showAllFeatures = ref(false)
const MAX_VISIBLE_FEATURES = 4

const visibleFeatures = computed(() => {
    const features = props.product.features ?? []

    return showAllFeatures.value
        ? features
        : features.slice(0, MAX_VISIBLE_FEATURES)
})

const hasHiddenFeatures = computed(() => {
    return (props.product.features?.length ?? 0) > MAX_VISIBLE_FEATURES
})
</script>

<style scoped>
@import './ProductInfo.css';
</style>
