<template>
    <div class="cart-step-delivery">
        <div v-if="cartStore.deliveryLoading" class="text-center">
            {{ t('cart.loading') }}
        </div>

        <div v-else-if="cartStore.deliveryMethods.length === 0" class="text-muted">
            {{ t('cart.delivery_step.no_methods') }}
        </div>

        <div v-else class="delivery-data d-flex flex-column">
            <h5>{{ t('cart.delivery_step.select') }}</h5>

            <div v-for="method in cartStore.deliveryMethods" :key="method.id" class="col-md-12">
                <div class="method-card" :class="{
                    'selected-card':
                        cartStore.selectedTransportMethodId === method.id,
                }" @click="select(method.id)" role="button">
                    <div class="method-card-inner">
                        <div class="method-left d-flex">
                            <input type="radio" :value="method.id" :checked="cartStore.selectedTransportMethodId ===
                                method.id
                                " class="delivery-radio" @change="select(method.id)" @click.stop />

                            <img v-if="method.icon_url" :src="method.icon_url" :alt="''" class="method-icon" />

                            <div class="method-info d-flex flex-column">
                                <span class="name">{{ method.name }}</span>
                                <span>{{ method.description }}</span>
                                <span>{{ method.instructions }}</span>
                            </div>
                        </div>

                        <div class="method-card-right">
                            <span class="method-price">
                                {{ t('cart.delivery_step.price_from') }}
                                {{ formatPrice(method.price) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="cart-actions col-md-12 d-flex justify-content-between">
            <div class="col-md-3">
                <BaseButton variant="secondary" size="lg" class="shop" @click="emit('prev')">
                    <BaseIcon name="chLeft" />
                    {{ t('cart.steps.comeback_to_address') }}
                </BaseButton>
            </div>

            <div class="col-md-3">
                <BaseButton variant="primary" size="lg" class="shop" :disabled="!cartStore.selectedTransportMethodId"
                    @click="emit('next')">
                    {{ t('cart.steps.next') }}:
                    {{ t('cart.steps.payment') }}
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

const emit = defineEmits<{ next: []; prev: [] }>()

const { t } = useI18n()
const cartStore = useCartStore()

const saving = ref(false)

onMounted(() => {
    if (cartStore.deliveryMethods.length === 0) {
        cartStore.fetchDeliveryMethods()
    }
})

async function select(methodId: number) {
    saving.value = true

    try {
        await cartStore.selectDelivery(methodId)
    } finally {
        saving.value = false
    }
}

function formatPrice(value: number): string {
    return new Intl.NumberFormat('pl-PL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}
</script>

<style scoped>
@import './CartStep3Style.css';
</style>