<template>
    <div class="col-md-1 flex-column availability-section">
        <!-- <div class="availability">
            <div v-if="item.is_made_to_order" class="circle yellow"></div>

            <div v-else-if="item.stock_quantity > 0 && !item.isInsufficient" class="circle green">
            </div>

            <div v-else-if="item.stock_quantity < 1" class="circle red"></div>

            <div v-else-if="item.isInsufficient" class="circle yellow"></div>
        </div> -->

        <!-- Na zamówienie -->

        <!-- Brak braków -->
        <div v-if="item.stock_quantity >= item.quantity">
            <span class="stock-badge stock-badge--available">
                <span>{{ $t(`products.delivery_details.${item.delivery_text}`) }}</span>
            </span>
        </div>

        <!-- Część niedostępna -->
        <div v-else-if="item.stock_quantity > 0 && item.isInsufficient" class="availability-partial">
            <span class="availability-delivery">
                <template v-if="item.is_made_to_order">
                    {{ t('products.details.availability_again') }}: {{ t('cart.made_to_order') }}
                </template>
                <template v-else-if="item.stock_status">
                    {{ t('cart.availability_delivery_short') }}
                </template>
                <template v-else>
                    {{ t('cart.always_unavailable') }}
                </template>
            </span>
        </div>

        <!-- Brak towaru -->
        <div v-else-if="item.stock_quantity < 1">
            <span v-if="item.delivery_date" class="stock-badge">
                {{ t('products.details.availability_again') }}: {{ item.delivery_date }}
            </span>
            <span v-else class="stock-badge">
                {{ $t(`products.delivery_details.${item.delivery_text}`) }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { CartProduct } from '@/core/stores/cartStore'

const { t } = useI18n()
defineProps<{
    item: CartProduct
}>()
</script>

<style scoped>
@import './../CartStep1Style.css';
</style>