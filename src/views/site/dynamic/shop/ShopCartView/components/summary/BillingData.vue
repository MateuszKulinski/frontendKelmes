<template>
    <div class="summary-container">
        <div class="summary-title">
            <BaseIcon name="doc" class="summary-icon" />
            <h6>{{ t('cart.checkout_summary.billing_address') }}</h6>
        </div>

        <div v-if="cartStore.checkoutDataLoading" class="summary-content">
            {{ t('cart.loading') }}
        </div>

        <div v-else-if="cartStore.unit || cartStore.billingAddress" class="summary-content">
            <div class="address-data">
                <template v-if="unitName">
                    <div class="data-name">{{ t('cart.checkout_summary.unit_name') }}:</div>
                    <div class="data-value">{{ unitName }}</div>
                </template>

                <div class="data-name">{{ t('cart.address_step.fields.vat_number') }}:</div>
                <div class="data-value">{{ cartStore.billingAddress?.vat_number || '—' }}</div>

                <template v-if="streetAddress">
                    <div class="data-name">{{ t('cart.address_step.fields.street') }}:</div>
                    <div class="data-value">{{ streetAddress }}</div>
                </template>

                <template v-if="locality">
                    <div class="data-name">{{ t('cart.address_step.fields.postcode') }} / {{ t('cart.address_step.fields.city') }}:</div>
                    <div class="data-value">{{ locality }}</div>
                </template>

                <template v-if="cartStore.billingAddress?.country">
                    <div class="data-name">{{ t('cart.address_step.fields.country') }}:</div>
                    <div class="data-value">{{ cartStore.billingAddress.country }}</div>
                </template>
            </div>
        </div>

        <div v-else class="summary-content text-muted">
            {{ t('cart.checkout_summary.not_selected') }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/core/stores/cartStore'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'

const { t } = useI18n()
const cartStore = useCartStore()

const unitName = computed(() =>
    cartStore.unit?.name || cartStore.billingAddress?.company || ''
)

const streetAddress = computed(() => {
    const address = cartStore.billingAddress
    if (!address) return ''

    const street = [address.street, address.house_number].filter(Boolean).join(' ')
    return address.apartment
        ? `${street}${street ? '/' : ''}${address.apartment}`
        : street
})

const locality = computed(() =>
    [cartStore.billingAddress?.postcode, cartStore.billingAddress?.city]
        .filter(Boolean)
        .join(' ')
)
</script>

<style scoped>
.address-data {
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: var(--gap-lg);
    row-gap: var(--gap-ex-sm);
    align-items: baseline;
    font-size: var(--font-size-md-minus);
}

.data-name {
    color: var(--text-muted);
    white-space: nowrap;
}

.data-value {
    min-width: 0;
}
</style>
