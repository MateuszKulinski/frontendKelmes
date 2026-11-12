<template>
    <div class="product-variants-container">
        <p>
            {{ t('products.variants') }}
        </p>
        <div class="product-variants">
            <router-link v-for="variant in variants" :key="variant.id" :to="resolve(variant.url)" :title="variant.name"
                class="product-variant">
                <ProductImage :src="variant.image" :alt="variant.name ?? ''" />

            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useUrlResolver } from '@/composables/useUrlResolver'
import { useI18n } from 'vue-i18n'
import ProductImage from '@/views/site/components/products/ProductImage.vue';

const { resolve } = useUrlResolver()
const { t } = useI18n()


defineProps<{
    variants: {
        id: number
        name: string
        image: string
        url: any
    }[]
}>()
</script>

<style scoped>
@import './ProductVariants.css';
</style>
