<template>
    <button class="add-to-compare-btn" :class="[
        `compare-btn--${type}`,
        { 'compare-btn--active': isCompared }
    ]" type="button" :disabled="pending || compareStore.loading" :aria-pressed="isCompared"
        :aria-label="isCompared ? t('products.remove_from_compare') : t('products.add_to_compare')"
        :title="isCompared ? t('products.remove_from_compare') : t('products.add_to_compare')"
        @click.stop.prevent="toggle">
        <span class="custom-icon icon-compare"></span>

        <span v-if="type === 'normal'">
            {{ isCompared ? t('products.remove_from_compare') : t('products.add_to_compare') }}
        </span>
    </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCompareStore } from '@/core/stores/compareStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = withDefaults(defineProps<{
    productId: number
    type?: 'normal' | 'mini'
}>(), {
    type: 'normal',
})

const compareStore = useCompareStore()

const isCompared = computed(() =>
    compareStore.has(props.productId),
)
const pending = ref(false)

const toggle = async () => {
    if (pending.value) return
    pending.value = true
    try {
        if (isCompared.value) {
            await compareStore.remove(props.productId)
        } else {
            await compareStore.add(props.productId)
        }
    } finally {
        pending.value = false
    }
}
</script>

<style scoped>
@import './../../dynamic/shop/ProductView/components/productPurchase/ProductAddToCart.css';
</style>
