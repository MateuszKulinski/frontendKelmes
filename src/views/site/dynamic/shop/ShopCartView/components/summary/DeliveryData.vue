<template>
    <div class="summary-container">
        <div class="summary-title">
            <BaseIcon name="doc" class="summary-icon" />

            <h6>
                {{ t('cart.checkout_summary.selected_address') }} - {{ cartStore.selectedAddress?.alias }}
            </h6>
        </div>

        <div class="summary-content">
            <!-- <span class="summary-content-dot"></span> -->
            <div class="address-data">
                <div class="data-name">{{ t('cart.address_step.fields.country') }}:</div>
                <div class="data-value">{{ cartStore.selectedAddress?.country }}</div>


                <div class="data-name">{{ t('cart.address_step.fields.postcode') }}:</div>
                <div class="data-value">{{ cartStore.selectedAddress?.postcode }}</div>


                <div class="data-name">{{ t('cart.address_step.fields.city') }}:</div>
                <div class="data-value">{{ cartStore.selectedAddress?.city }}</div>

                <div class="data-name">{{ t('cart.address_step.fields.street') }}:</div>
                <div class="data-value">{{ cartStore.selectedAddress?.street }}</div>

                <div class="data-name">{{ t('cart.address_step.fields.house_number') }}:</div>
                <div class="data-value">{{ formatStreetAddress() }}</div>

                <div class="data-name">{{ t('cart.address_step.fields.company') }}:</div>
                <div class="data-value">{{ cartStore.selectedAddress?.company }}</div>

                <div class="data-name">{{ t('cart.address_step.fields.firstname') }}:</div>
                <div class="data-value">{{ cartStore.selectedAddress?.firstname }}</div>

                <div class="data-name">{{ t('cart.address_step.fields.lastname') }}:</div>
                <div class="data-value">{{ cartStore.selectedAddress?.lastname }}</div>

                <div class="data-name">{{ t('cart.address_step.fields.email') }}:</div>
                <div class="data-value">{{ cartStore.selectedAddress?.email }}</div>

                <div class="data-name">{{ t('cart.address_step.fields.phone') }}:</div>
                <div class="data-value">{{ cartStore.selectedAddress?.phone }}</div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import { useCartStore } from '@/core/stores/cartStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const cartStore = useCartStore()

function formatStreetAddress(): string {
    const address = cartStore.selectedAddress

    if (!address) {
        return ''
    }

    const street = [
        address.house_number,
    ]
        .filter(Boolean)
        .join(' ')

    return address.apartment
        ? `${street}/${address.apartment}`
        : street

}
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

@media (max-width: 992px) {
    .summary-content-dot {
        display: none;
    }
}
</style>