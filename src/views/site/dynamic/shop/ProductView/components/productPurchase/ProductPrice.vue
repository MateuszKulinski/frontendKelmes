<template>
    <div v-if="grossPrice" class="product-price d-flex flex-column">
        <div class="gross-price" :class="{ 'is-primary-price': priceTypeStore.isGross }">
            {{ grossPrice }}

            <span class="gross-label">
                {{ t('products.details.gross') }}
            </span>
        </div>

        <div v-if="netPrice" class="net-price" :class="{ 'is-primary-price': priceTypeStore.isNet }">
            {{ netPrice }}

            <span class="net-label">
                {{ t('products.details.net') }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePriceTypeStore } from '@/core/stores/priceTypeStore'

const { t } = useI18n()
const priceTypeStore = usePriceTypeStore()

const props = defineProps<{
    product: any
    selectedUom: any
}>()

const grossPrice = computed(() => {
    return props.selectedUom?.gross_price_formatted ?? props.product.gross_price
})

const netPrice = computed(() => {
    return props.selectedUom?.net_price_formatted ?? props.product.net_price
})

</script>

<style scoped>
@import './ProductPrice.css';
</style>