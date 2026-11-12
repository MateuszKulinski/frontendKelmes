<template>
    <div class="product-badges d-flex flex-column">
        <span v-if="product.is_new" class="badge bg-primary">
            {{ t('products.badge.new') }}
        </span>

        <span v-if="product.is_sale" class="badge sale">
            {{ t('products.badge.sale') }}
        </span>

        <span v-if="product.is_bestseller" class="badge bg-warning">
            {{ t('products.badge.bestseller') }}
        </span>

        <span v-if="product.is_special_offer" class="badge bg-success">
            {{ t('products.badge.special_offer') }}
        </span>

        <!-- <span v-if="product.is_recommended" class="badge bg-info">
            {{ t('products.badge.recommended') }}
        </span> -->

        <span v-if="product.is_made_to_order" class="badge bg-info made-to-order">
            {{ t('products.badge.made_to_order') }}
        </span>

        <span v-if="product.stock_status == 0 && product.stock > 0" class="badge stock-limited">
            {{ t('products.badge.stock_limited') }}
        </span>

        <span v-if="product.is_agreement" class="badge agreement">
            {{ t('products.badge.is_agreement') }}
        </span>

        <!-- <span v-if="product.stock_status == 0 && product.stock <= 0" class="badge bg-info">
            {{ t('products.badge.out_of_stock_permanently') }}
        </span> -->
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps<{
    product: any
}>()
</script>

<style scoped>
.product-badges .badge {
    font-weight: 400;
    line-height: 16px;
    font-size: 11px;
}

.made-to-order {
    background-color: #7756B0 !important;
}

.stock-limited {
    background-color: #ff7700 !important;
}

.sale {
    background-color: #ff00bf !important;
}

.agreement {
    background-color: var(--light_blue);
    color: var(--accent)
}
</style>