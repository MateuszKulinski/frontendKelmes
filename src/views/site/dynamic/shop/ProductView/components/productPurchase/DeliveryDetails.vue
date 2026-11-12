<template>
    <div class="product-details-info">
        <div v-if="product.stock <= 0 && product.delivery_date" class="details-item">
            <span class="custom-icon icon-truck"></span>
            <div class="delivery-text">
                <span class="bold">{{ t('products.shipment') }}:</span>
                <span>{{ t('products.delivery_after') }} {{ product.delivery_date }}</span>
            </div>
        </div>

        <div v-else-if="product.delivery_text" class="details-item"
            :class="{ 'details-item--immediate': product.delivery_text === '24h' }">
            <span class="custom-icon icon-truck"></span>
            <div class="delivery-text">
                <span class="bold">{{ t('products.shipment') }}:</span>
                <span>{{ $t(`products.delivery_details.${product.delivery_text}`) }}</span>
            </div>
        </div>
        <div v-if="freeDeliveryText" class="details-item">
            <span class="custom-icon icon-package"></span>
            <div class="delivery-text">
                <span class="bold">{{ t('products.free_delivery_from') }}:</span>
                <span>{{ freeDeliveryText }}</span>
            </div>
        </div>

        <div class="details-item">
            <span class="custom-icon icon-return"></span>
            <div class="delivery-text">
                <span class="bold">{{ t('products.return') }}:</span>
                <span>14 {{ t('products.days') }}</span>
            </div>
        </div>

        <div class="details-item">
            <span class="custom-icon icon-documents"></span>
            <div class="delivery-text">
                <span class="bold">{{ t('products.vat_invoice') }}</span>
            </div>
        </div>

        <div class="details-item last">
            <span class="custom-icon icon-wallet"></span>
            <div class="delivery-text">
                <span class="bold">{{ t('products.secure_payments') }}</span>
            </div>
        </div>

        <div class="details-img-container">
            <img :src="fastPayments" alt="">
        </div>
    </div>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/core/stores/authStore'
import { useCartStore } from '@/core/stores/cartStore'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const cartStore = useCartStore()
import fastPayments from '/img/custom-images/fast-payments.png'
const props = defineProps<{
    product: any
}>()

const freeDeliveryText = computed(() => {
    const policy = cartStore.cart?.free_delivery ?? authStore.unit?.free_delivery

    if (policy?.always_free) {
        return t('products.free_delivery_always')
    }

    if (!policy?.threshold || policy.threshold <= 0) {
        return ''
    }

    const amount = new Intl.NumberFormat(locale.value, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(policy.threshold)

    return t('products.free_delivery_amount', { amount })
})
</script>

<style scoped>
@import './DeliveryDetails.css';
</style>