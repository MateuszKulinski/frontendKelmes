<template>
    <div class="product-card grid-view bzz">
        <!-- <div class="product-card-badges d-flex gap-1 flex-column">
            <div class="product-card-badge product-card-badge-new" v-if="product.is_new">{{ t('products.badge.new') }}
            </div>
            <div class="product-card-badge product-card-badge-sale" v-if="product.is_sale">{{ t('products.badge.sale')
            }}</div>
            <div class="product-card-badge product-card-badge-bestseller" v-if="product.is_bestseller">
                {{ t('products.badge.bestseller') }}</div>
        </div> -->
        <div class="product-card-badges d-flex gap-1 flex-column">

            <ProductBadges :product="product" />
        </div>
        <FavouriteButton v-if="auth.isLogged" :product-id="product.id" class="product-card-favourite" />
        <ProductCompareButton :product-id="product.id" type="mini" class="product-card-compare" />

        <!-- Zdjęcie – link do produktu -->
        <router-link :to="resolve(product.url)"
            class="product-card-image d-flex align-items-center justify-content-center" tabindex="-1">
            <ProductImage :src="product.image" :alt="product.name ?? ''" />
        </router-link>

        <div class="product-card-body d-flex flex-column">
            <div class="product-info">
                <!-- Nazwa – link do produktu z podkreśleniem tylko na hover -->
                <div v-if="product.catalog_number" class="product-code">{{ product.catalog_number }}</div>
                <router-link :to="resolve(product.url)" class="product-card-name-link">
                    <p class="product-card-name">{{ product.name }}</p>
                </router-link>
                <div v-if="product.stock <= 0 && product.delivery_date" class="product-delivery">
                    {{ t('products.shipment') }}: {{ t('products.delivery_after') }} {{ product.delivery_date }}
                </div>
                <div v-else-if="canOrder && product.delivery_text" class="product-delivery"
                    :class="{ 'product-delivery--immediate': product.delivery_text === '24h' }">
                    {{ t('products.shipment') }}: {{ t(`products.delivery_details.${product.delivery_text}`) }}
                </div>
                <p class="product-card-manufacturer">
                    <router-link v-if="product.manufacturer" :to="resolve(product.manufacturer.url)">
                        <img v-if="product.manufacturer.logo_url" :src="product.manufacturer.logo_url.replace(
                            'http://127.0.0.1:8000',
                            'https://cliply-test-b2b.exis24.pl'
                        )" :alt="product.manufacturer.name ?? ''" class="product-card-manufacturer-logo" />
                        <span v-else-if="product.manufacturer.name" class="product-card-manufacturer-text">{{
                            product.manufacturer.name }}</span>
                    </router-link>

                </p>
            </div>
            <div class="product-card-price-container">
                <div v-if="isNet && product.net_price" class="product-card-price">
                    <span class="price">{{ product.net_price }} </span>
                    <span class="price-name">{{ t('products.details.net') }}</span>
                </div>
                <div v-if="isGross && product.gross_price" class="product-card-price">
                    <span class="price">{{ product.gross_price }} </span>
                    <span class="price-name">{{ t('products.details.gross') }}</span>
                </div>
            </div>
            <div class="product-buy">
                <template v-if="canOrder">
                    <AddToCart :product-id="product.id"
                        :max="props.product.stock_status == 0 ? product.stock : undefined" />
                </template>
                <template v-else>
                    <BaseButton class="on_the_way" disabled>
                        <BaseIcon name="block" />
                        {{ t('products.out_of_stock') }}
                    </BaseButton>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProductItem } from '@/composables/indexStore'
import { useI18n } from 'vue-i18n'
import AddToCart from '@shared/ui/AddToCart.vue'
import FavouriteButton from '@shared/ui/FavouriteButton.vue'
import { useUrlResolver } from '@/composables/useUrlResolver'
import BaseButton from '@shared/ui/BaseButton.vue'
import BaseIcon from '@shared/ui/BaseIcon.vue'
import { storeToRefs } from 'pinia'
import { usePriceTypeStore } from '@/core/stores/priceTypeStore'
import { useAuthStore } from '@/core/stores/authStore'
import ProductImage from '@/views/site/components/products/ProductImage.vue'
import ProductBadges from '@/views/site/dynamic/shop/ProductView/components/ProductBadges.vue'
import ProductCompareButton from '@/views/site/components/productCompareButton/ProductCompareButton.vue'

const { t } = useI18n()
const { resolve } = useUrlResolver()
const priceTypeStore = usePriceTypeStore()
const { isNet, isGross } = storeToRefs(priceTypeStore)
const auth = useAuthStore()

const props = defineProps<{
    product: ProductItem
}>()


const canOrder = computed(() => {
    return (
        props.product.stock_status === 1 ||
        (props.product.stock_status === 0 &&
            props.product.stock > 0)
    )
})
</script>

<style scoped>
@import './Tile.css';
</style>
