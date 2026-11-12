<template>
    <div class="content-container cart-view py-4">

        <h1 class="cart-title mb-4">
            {{ t('cart.title') }}
        </h1>

        <!-- Ładowanie -->
        <div v-if="cartStore.loading" class="text-center text-muted py-5">
            {{ t('cart.loading') }}
        </div>

        <!-- Błąd -->
        <div v-else-if="cartStore.error" class="alert alert-danger">
            {{ cartStore.error }}
        </div>

        <!-- Pusty koszyk -->
        <div v-else-if="cartStore.isEmpty && !cartStore.orderNumber" class="cart-empty">
            <div class="text-muted py-5 text-center">
                <p>{{ t('cart.empty') }}</p>
                <router-link to="/" class="btn btn-primary mt-3">
                    {{ t('cart.continue_shopping') }}
                </router-link>
            </div>
            <CartFileTools />
        </div>

        <!-- Koszyk -->
        <template v-else>

            <div class="row g-4">

                <!-- LEWA KOLUMNA -->
                <div class="col-lg-8">

                    <!-- Kroki -->
                    <div class="cart-steps-nav d-flex">

                        <div v-for="step in steps" :key="step.num" class="cart-step d-flex align-items-center col"
                            :class="{
                                active: cartStore.currentStep === step.num,
                                done: isStepDone(step.num),
                                upcoming: cartStore.currentStep < step.num,
                                'justify-content-center':
                                    step.num > 1 &&
                                    step.num < steps.length,
                                'justify-content-start':
                                    step.num === 1,
                            }" @click="navigateToStep(step.num)">

                            <div :class="{
                                'blue-border': cartStore.currentStep === step.num,
                                'white-border': cartStore.currentStep !== step.num
                            }">
                                <div class="white-border">
                                    <div class="step-icon pointer">

                                        <BaseIcon :name="step.icon" />
                                    </div>
                                </div>
                            </div>

                            <div class="step-content pointer">

                                <p class="step-title">
                                    {{ step.label }}
                                </p>

                                <!-- <p v-if="step.meta" class="step-meta" :class="{
                                    step1: step.num === 1
                                }">
                                    {{ step.meta }}
                                </p> -->

                            </div>

                            <div v-if="step.num < steps.length" class="cart-separator flex-grow-1"
                                :class="{ 'is-complete': step.num < cartStore.currentStep }" />

                        </div>

                    </div>

                    <!-- Zawartość kroku -->
                    <div class="cart-step-content">

                        <CartStep1Products v-if="cartStore.currentStep === 1" @next="goToStep(2)" />

                        <CartStep2Address v-else-if="cartStore.currentStep === 2" @next="goToStep(3)"
                            @prev="goToStep(1)" />

                        <CartStep3Delivery v-else-if="cartStore.currentStep === 3" @next="goToStep(4)"
                            @prev="goToStep(2)" />

                        <CartStep4Payment v-else-if="cartStore.currentStep === 4" @next="goToStep(5)"
                            @prev="goToStep(3)" />

                        <CartStep5Summary v-else-if="cartStore.currentStep === 5" :accepted-terms="acceptedTerms"
                            :show-terms-error="showTermsError" @update-accepted-terms="onAcceptedTermsChange"
                            @prev="goToStep(4)" @go-to-step="goToStep" />

                    </div>

                </div>

                <!-- PRAWA KOLUMNA -->
                <div class="col-lg-4">

                    <CartSummaryPanel :accepted-terms="acceptedTerms" @ordered="onOrdered"
                        @terms-required="onTermsRequired" />

                </div>

            </div>

        </template>

    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useCartStore } from '@/core/stores/cartStore'

import CartStep1Products from './CartStep1Products.vue'
import CartStep2Address from './CartStep2Address.vue'
import CartStep3Delivery from './CartStep3Delivery.vue'
import CartStep4Payment from './CartStep4Payment.vue'
import CartStep5Summary from './CartStep5Summary.vue'
import CartSummaryPanel from './CartSummaryPanel.vue'
import CartFileTools from './CartFileTools.vue'

import BaseIcon from '@/views/shared/ui/BaseIcon.vue'

const { t } = useI18n()

const cartStore = useCartStore()
const router = useRouter()
const acceptedTerms = ref(false)
const showTermsError = ref(false)

function onAcceptedTermsChange(accepted: boolean) {
    acceptedTerms.value = accepted
    if (accepted) {
        showTermsError.value = false
    }
}

async function onTermsRequired() {
    showTermsError.value = true
    await nextTick()
    document.getElementById('accept-platform-terms-field')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
    })
}

/*
|--------------------------------------------------------------------------
| STEPS
|--------------------------------------------------------------------------
*/

const steps = computed(() => [
    {
        num: 1,
        label: t('cart.steps.cart'),
        icon: 'order',

        meta: t(
            'cart.column.product_count',
            {
                count: cartStore.items.length,
            },
            cartStore.items.length
        ),
    },

    {
        num: 2,
        label: t('cart.steps.address'),
        icon: 'doc',

        meta: cartStore.selectedAddress
            ? [
                // cartStore.selectedAddress.street,
                // cartStore.selectedAddress.house_number,
                cartStore.selectedAddress.city,
            ]
                .filter(Boolean)
                .join(' ')
            : t('cart.steps.complete_data'),
    },

    {
        num: 3,
        label: t('cart.steps.delivery'),
        icon: 'delivery',

        meta:
            cartStore.selectedDelivery?.name
            ?? t('cart.steps.select_option'),
    },

    {
        num: 4,
        label: t('cart.steps.payment'),
        icon: 'payment',

        meta:
            cartStore.selectedPayment?.name
            ?? t('cart.steps.select_method'),
    },

    {
        num: 5,
        label: t('cart.steps.summary'),
        icon: 'check',

        meta: t('cart.steps.check_and_order'),
    },
])

/*
|--------------------------------------------------------------------------
| LOAD ACTIVE CART
|--------------------------------------------------------------------------
*/

onMounted(async () => {
    await cartStore.loadActiveCart()
})

/*
|--------------------------------------------------------------------------
| STEP STATE
|--------------------------------------------------------------------------
*/

function isStepDone(stepNum: number): boolean {

    if (stepNum === 1) {
        return cartStore.items.length > 0
    }

    if (stepNum === 2) {
        return !!cartStore.selectedAddressId
    }

    if (stepNum === 3) {
        return !!cartStore.selectedTransportMethodId
    }

    if (stepNum === 4) {
        return !!cartStore.selectedPaymentMethodId
    }

    if (stepNum === 5) {
        return cartStore.isReadyToOrder
    }

    return false
}

function canAccessStep(stepNum: number): boolean {

    if (stepNum === 1) {
        return true
    }

    if (stepNum === 2) {
        return !!cartStore.cartId
    }

    if (stepNum === 3) {
        return !!cartStore.selectedAddressId
    }

    if (stepNum === 4) {
        return !!cartStore.selectedTransportMethodId
    }

    if (stepNum === 5) {
        return !!cartStore.selectedPaymentMethodId
    }

    return false
}

function navigateToStep(stepNum: number) {

    if (
        canAccessStep(stepNum) ||
        stepNum <= cartStore.currentStep
    ) {
        goToStep(stepNum)
    }
}

function goToStep(stepNum: number) {
    cartStore.goToStep(stepNum)
}

async function onOrdered(orderId: number) {
    await router.push({
        name: 'panel.order',
        params: { id: orderId },
        query: { placed: '1' },
    })

    void cartStore.loadActiveCart()
    void cartStore.fetchCarts()
}
</script>

<style scoped>
@import './ShopCartStyle.css';
</style>
