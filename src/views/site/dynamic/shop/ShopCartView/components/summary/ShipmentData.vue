<template>
    <div class="summary-container">
        <div class="summary-title">
            <BaseIcon name="delivery" class="summary-icon"></BaseIcon>
            <h6>{{ t('cart.checkout_summary.selected_delivery') }}</h6>
        </div>
        <div class="summary-content">
            <div v-if="cartStore.selectedDelivery" class="fw-semibold">
                <img v-if="cartStore.selectedDelivery.icon_url" :src="cartStore.selectedDelivery.icon_url" alt="" class="summary-method-icon" />
                {{ cartStore.selectedDelivery.name }}
            </div>
            <div v-else class="small text-danger">
                {{ t('cart.checkout_summary.not_selected') }}
            </div>
            <div v-if="cartStore.selectedDelivery?.description" class="small text-muted mt-1">
                {{ cartStore.selectedDelivery.description }}
            </div>
            <div v-if="cartStore.selectedDelivery?.instructions" class="small text-muted">
                {{ cartStore.selectedDelivery.instructions }}
            </div>
            <BaseButton variant="secondary" size="sm" class="mt-3" @click="emit('goToStep', 3)">
                <BaseIcon name="chLeft" />
                {{ t('cart.steps.comeback_to_delivery_method') }}
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