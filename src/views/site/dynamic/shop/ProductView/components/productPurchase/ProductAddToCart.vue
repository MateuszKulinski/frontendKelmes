<template>
    <div class="product-cart">
        <template v-if="canOrder">
            <ProductPackaging v-if="product.uoms?.length > 1" v-model="selectedUom" :uoms="product.uoms" />

            <div class="purchase-actions">
                <QuantityControl v-model="qty"
                    :max="props.product.stock_status === 0 ? props.product.stock : undefined" />
                <button class="add-to-cart-btn" type="button" @click="addToCart">
                    <span class="custom-icon icon-cart"></span>

                    <span>
                        {{ t('cart.add_to_cart') }}
                    </span>
                </button>
            </div>
            <div v-if="product.stock <= 0 && product.delivery_date" class="availability">
                <span class="availability-text red">
                    {{ t('products.details.availability_again') }}: {{ product.delivery_date }}
                </span>
            </div>
            <ProductCompareButton :product-id="product.id" type="normal" class="purchase-compare" />
        </template>

        <template v-else>
            <ProductPackaging v-if="product.uoms?.length > 1" v-model="selectedUom" :uoms="product.uoms" />
            <div class="purchase-actions">
                <QuantityControl v-model="qty" />
                <button class="add-to-cart-btn" disabled type="button">
                    <span class="custom-icon icon-cart"></span>

                    <span>
                        {{ t('cart.add_to_cart') }}
                    </span>
                </button>
            </div>
            <div class="availability">
                <span class="availability-text brak">{{ t('products.details.niedostepny') }}</span>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import QuantityControl from '@/views/shared/ui/QuantityControl.vue'
import ProductPackaging from './ProductPackaging.vue'
import { useCartStore } from '@/core/stores/cartStore'
import ProductCompareButton from '@/views/site/components/productCompareButton/ProductCompareButton.vue'

const props = defineProps<{
    product: any
}>()

const selectedUom = defineModel<any>('selectedUom')

const { t } = useI18n()
const cartStore = useCartStore()

const qty = ref(1)

/**
 * Faktyczna liczba sztuk zamawianych.
 * Jeżeli wybrano opakowanie x1000 i qty = 2,
 * to requestedQuantity = 2000.
 */
// const requestedQuantity = computed(() => {
//     return qty.value * (selectedUom.value?.quantity ?? 1)
// })

const canOrder = computed(() => {
    return (
        props.product.stock_status === 1 ||
        (props.product.stock_status === 0 &&
            props.product.stock > 0)
    )
})

// const availability = computed(() => {
//     if (props.product.stock === 'on_order') {
//         return {
//             color: 'red',
//             text: t('products.delivery_details.on_order')
//         }
//     }

//     if (typeof props.product.stock === 'number') {
//         if (requestedQuantity.value <= props.product.stock) {
//             return {
//                 color: 'green',
//                 text: t('products.details.available')
//             }
//         }

//         return {
//             color: 'yellow',
//             text: `${t('cart.column.availability')}: ${props.product.stock_text}`
//         }
//     }

//     return {
//         color: 'red',
//         text: t('products.details.niedostepny')
//     }
// })

const addToCart = () => {
    const unitMultiplier = selectedUom?.value?.quantity ?? 1;

    cartStore.addItem(
        props.product.id,
        qty.value * unitMultiplier,
        selectedUom.value?.id
    );
};
</script>

<style scoped>
@import './ProductAddToCart.css';
</style>
