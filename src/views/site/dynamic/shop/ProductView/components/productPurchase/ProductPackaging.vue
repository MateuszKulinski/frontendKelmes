<template>
    <div class="product-packaging">
        <div class="packaging-title">
            {{ t('products.purchase_options') }}
        </div>

        <label v-for="uom in uoms" :key="uom.id" class="packaging-option"
            :class="{ active: selectedUom?.id === uom.id }">
            <div class="packaging-left">
                <input type="radio" name="product-uom" :value="uom" v-model="selectedUom" />
                {{ uom.name }}
                <!-- {{ uom.name }} x{{ uom.quantity }} -->
            </div>

            <div class="packaging-right">
                <strong>
                    {{ priceTypeStore.isGross
                        ? (uom.gross_price_formatted ?? uom.net_price_formatted)
                        : (uom.net_price_formatted ?? uom.gross_price_formatted) }}
                </strong>
            </div>
        </label>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { usePriceTypeStore } from '@/core/stores/priceTypeStore'

const { t } = useI18n()
const priceTypeStore = usePriceTypeStore()
const selectedUom = defineModel<any>()

defineProps<{
    uoms: any[]
}>()
</script>
<style scoped>
@import './ProductPackaging.css';
</style>