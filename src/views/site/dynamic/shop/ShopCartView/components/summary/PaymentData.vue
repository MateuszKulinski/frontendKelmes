<template>
    <div class="summary-container">
        <div class="summary-title">
            <BaseIcon name="payment" class="summary-icon"></BaseIcon>
            <h6>{{ t('cart.checkout_summary.selected_payment') }}</h6>
        </div>
        <div class="summary-content">
            <div v-if="cartStore.selectedPayment" class="fw-semibold">
                <img v-if="cartStore.selectedPayment.icon_url" :src="cartStore.selectedPayment.icon_url" alt="" class="summary-method-icon" />
                {{ cartStore.selectedPayment.name }}
            </div>
            <span v-else class="text-danger small">{{ t('cart.checkout_summary.not_selected') }}</span>
            <BaseButton variant="secondary" size="sm" class="mt-3" @click="emit('goToStep', 4)">
                <BaseIcon name="chLeft" />
                {{ t('cart.steps.comeback_to_payment') }}
            </BaseButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import BaseIcon from '@/views/shared/ui/BaseIcon.vue';
import { useCartStore } from '@/core/stores/cartStore'
const cartStore = useCartStore()
import { useI18n } from 'vue-i18n';
import BaseButton from '@/views/shared/ui/BaseButton.vue';
const { t } = useI18n()


const emit = defineEmits<{
    prev: []
    goToStep: [step: number]
}>()

</script>

<style scoped>
.summary-method-icon {
    width: 28px;
    height: 28px;
    object-fit: contain;
    vertical-align: middle;
    margin-right: var(--gap-sm);
}
</style>