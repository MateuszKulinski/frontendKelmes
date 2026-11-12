<template>
    <div class="add-to-cart d-flex align-items-center justify-content-center">
        <QuantityControl v-if="props.showQuantityControl" v-model="qty" :max="props.max ?? undefined" />

        <button class="add-to-cart-btn" @click="add" type="button" :disabled="props.disabled">
            <span class="custom-icon icon-cart"></span>
            <span>{{ t('cart.add_to_cart') }}</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import QuantityControl from './QuantityControl.vue'
import { useCartStore } from '@/core/stores/cartStore'

const props = withDefaults(defineProps<{
    productId: number
    disabled?: boolean
    max?: number
    showQuantityControl?: boolean
}>(), {
    showQuantityControl: true,
})

const { t } = useI18n()
const cartStore = useCartStore()

const qty = ref(1)
const added = ref(false)

function add() {
    const quantity = props.showQuantityControl ? qty.value : 1

    cartStore.addItem(props.productId, quantity)

    added.value = true
    setTimeout(() => {
        added.value = false
    }, 2000)
}
</script>

<style scoped>
.qty-control {
    width: 33.33%;
    justify-content: center;
}

.add-to-cart {
    gap: var(--gap-sm);
}

.add-to-cart-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-ex-sm);
    padding: var(--padding-sm) var(--padding-lg);
    height: 34px;
    border: none;
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: var(--bg-surface);
    font-size: var(--font-size-md-minus);
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: var(--transition-default);
    flex-shrink: 0;
    width: 66.66%;
    justify-content: center;
}

.add-to-cart-btn:hover {
    background: var(--accent-hover);
}

.add-to-cart-btn .custom-icon {
    width: 18px;
    height: 18px;
    background-color: var(--bg-surface);
}
</style>
