<template>

    <div class="cart-step-payment">

        <div v-if="cartStore.paymentLoading" class="text-center text-muted py-4">
            {{ t('cart.loading') }}
        </div>

        <div v-else-if="cartStore.paymentMethods.length === 0" class="text-muted">
            {{ t('cart.payment_step.no_methods') }}
        </div>

        <div v-else class="payment-data d-flex flex-column">

            <h5>{{ t('cart.payment_step.select') }}</h5>

            <div v-for="method in cartStore.paymentMethods" :key="method.id" class="col-md-12">

                <div class="method-card" :class="{
                    'selected-card':
                        cartStore.selectedPaymentMethodId === method.id
                }" @click="select(method.id)" role="button">

                    <div class="method-card-inner">

                        <div class="method-left d-flex">

                            <BaseRadio :model-value="cartStore.selectedPaymentMethodId === method.id
                                " :name="'payment-method'" @click.stop @update:model-value="
                                    select(method.id)
                                    " />

                            <img v-if="method.icon_url" :src="method.icon_url" :alt="''" class="method-icon" />

                            <div class="method-info d-flex flex-column">
                                <span class="name">{{ method.name }}</span>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

        <div class="cart-actions col-md-12 d-flex justify-content-between">

            <div class="col-md-3">

                <BaseButton variant="secondary" size="lg" class="shop" @click="emit('prev')">
                    <BaseIcon name="chLeft" />

                    {{ t('cart.steps.comeback_to_delivery_method') }}
                </BaseButton>

            </div>

            <div class="col-md-3">

                <BaseButton variant="primary" size="lg" class="shop" :disabled="!cartStore.selectedPaymentMethodId"
                    @click="emit('next')">
                    {{ t('cart.steps.next') }}:
                    {{ t('cart.steps.summary') }}
                </BaseButton>

            </div>

        </div>

    </div>

</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/core/stores/cartStore'

import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import BaseButton from '@/views/shared/ui/BaseButton.vue'
import BaseRadio from '@/views/shared/ui/BaseRadio.vue'

const emit = defineEmits<{
    next: []
    prev: []
}>()

const { t } = useI18n()
const cartStore = useCartStore()

const saving = ref(false)

onMounted(() => {

    if (cartStore.paymentMethods.length === 0) {
        cartStore.fetchPaymentMethods()
    }

})

async function select(methodId: number) {

    saving.value = true

    try {
        await cartStore.selectPayment(methodId)
    } finally {
        saving.value = false
    }

}

</script>

<style scoped>
@import './CartStep4Style.css';
</style>