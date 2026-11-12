<template>
    <div class="cart-summary-panel p-3 border rounded bg-white">

        <h6 class="fw-bold mb-3">
            {{ t('cart.summary_panel.title') }}
        </h6>

        <!-- Wartości koszyka -->
        <div class="summary-row d-flex justify-content-between mb-1">
            <span class="text-muted small">
                {{ t('cart.summary_panel.total_netto') }}
            </span>
            <span class="small">
                {{ cartStore.summary?.products_net_total }}
            </span>
        </div>

        <div class="summary-row d-flex justify-content-between mb-2">
            <span class="text-muted small">
                {{ t('cart.summary_panel.total_brutto') }}
            </span>
            <span class="small">
                {{ cartStore.summary?.products_gross_total }}
            </span>
        </div>

        <hr class="my-2" />

        <!-- Dostawa -->
        <div class="summary-row d-flex justify-content-between mb-1">
            <span class="text-muted small">
                {{ t('cart.summary_panel.delivery_method') }}
            </span>

            <span class="small text-end">
                {{
                    cartStore.selectedDelivery?.name ??
                    t('cart.summary_panel.no_delivery')
                }}
            </span>
        </div>

        <div class="summary-row d-flex justify-content-between mb-2">
            <span class="text-muted small">
                {{ t('cart.summary_panel.delivery_price') }}
            </span>

            <span class="small">
                {{ deliveryPriceLabel }}
            </span>
        </div>

        <!-- Darmowa dostawa -->
        <div v-if="freeDeliveryMessage" class="summary-row d-flex justify-content-between align-items-start mb-2">
            <span class="text-muted small d-flex align-items-center gap-1">
                {{ t('cart.summary_panel.free_delivery_remaining') }}
            </span>

            <span class="small text-end">
                {{ freeDeliveryMessage }}
            </span>
        </div>
        <hr class="my-2" />

        <!-- Kod rabatowy -->
        <div class="mb-3">
            <label class="form-label small text-muted mb-1">
                {{ t('cart.summary_panel.discount_code') }}
            </label>

            <div class="input-group input-group-sm">
                <input v-model.trim="discountCode" type="text" class="form-control"
                    :placeholder="t('cart.summary_panel.discount_placeholder')" />

                <BaseButton variant="secondary" size="sm" type="button" disabled>
                    OK
                </BaseButton>
            </div>
        </div>

        <hr class="my-2" />

        <!-- Sumy końcowe -->
        <div class="summary-row d-flex justify-content-between mb-1">
            <span class="small fw-semibold">
                {{ t('cart.summary_panel.grand_total_netto') }}
            </span>

            <span class="small fw-semibold">
                {{ cartStore.summary?.net_total }}
            </span>
        </div>

        <div class="summary-row d-flex justify-content-between mb-3">
            <span class="fw-bold">
                {{ t('cart.summary_panel.grand_total_brutto') }}
            </span>

            <span class="fw-bold text-primary">
                {{ cartStore.summary?.gross_total }}
            </span>
        </div>

        <div v-if="cartStore.checkoutError" class="alert alert-danger py-2 small mb-2">
            {{ cartStore.checkoutError }}
        </div>

        <div v-if="cartStore.cart?.can_checkout === false" class="alert alert-danger py-2 small mb-2">
            {{ t('cart.limits.checkout_blocked', {
                limits: (cartStore.cart?.blocking_limits ?? []).map(limit => limit.name).join(', ')
            }) }}
        </div>

        <div v-if="showTermsError && cartStore.currentStep === 5" class="text-danger small mt-2" role="alert">
            {{ t('cart.summary_panel.accept_terms_error') }}
        </div>

        <BaseButton v-if="cartStore.currentStep === 5" class="w-100 mt-2"
            :disabled="!cartStore.isReadyToOrder || cartStore.cart?.can_checkout === false"
            :loading="cartStore.checkoutLoading"
            @click="placeOrder">
            <span v-if="cartStore.checkoutLoading" class="spinner-border spinner-border-sm me-2"></span>

            {{ t('cart.summary_panel.order_button') }}
        </BaseButton>

        <div v-if="!cartStore.isReadyToOrder" class="text-muted text-center small mt-2">
            Uzupełnij kroki 2–4 aby złożyć zamówienie
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/core/stores/cartStore'
import BaseButton from '@/views/shared/ui/BaseButton.vue'

const emit = defineEmits<{
    ordered: [orderId: number]
    termsRequired: []
}>()

const props = defineProps<{
    acceptedTerms: boolean
}>()

const { t } = useI18n()
const cartStore = useCartStore()

const discountCode = ref('')
const showTermsError = ref(false)

const deliveryPriceLabel = computed<string>(() => {
    if (!cartStore.selectedDelivery) {
        return t('cart.summary_panel.no_delivery')
    }
    return String(cartStore.cart?.transport_price ?? t('cart.summary_panel.no_delivery'))
})

async function placeOrder() {
    if (!props.acceptedTerms) {
        showTermsError.value = true
        emit('termsRequired')
        return
    }

    if (
        !cartStore.isReadyToOrder ||
        cartStore.checkoutLoading
    ) {
        return
    }

    const result = await cartStore.placeOrder()

    if (result && !cartStore.checkoutError) {
        emit('ordered', result.orderId)
    }
}

watch(
    () => props.acceptedTerms,
    accepted => {
        if (accepted) {
            showTermsError.value = false
        }
    }
)


const freeDeliveryMessage = computed(() => {
    const freeDelivery = cartStore.cart?.free_delivery;

    if (!freeDelivery) {
        return false;
    }

    if (freeDelivery.always_free || freeDelivery.achieved) {
        return t('cart.free_delivery_achieved');
    }

    if (!freeDelivery.threshold || freeDelivery.remaining === null) return false;

    return freeDelivery.remaining_formatted;
});



</script>

<style scoped>
.cart-summary-panel {
    position: sticky;
    top: 80px;
}

.summary-row {
    gap: 0.5rem;
}
</style>