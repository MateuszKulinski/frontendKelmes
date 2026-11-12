<template>
    <div class="product-card list-view">
        <!-- <div class="product-card-badges d-flex gap-1 flex-column">
            <span v-if="product.is_new" class="product-card-badge product-card-badge-new">{{ t('products.badge.new') }}</span>
            <span v-if="product.is_sale" class="product-card-badge product-card-badge-sale">{{ t('products.badge.sale') }}</span>
            <span v-if="product.is_bestseller" class="product-card-badge product-card-badge-bestseller">{{ t('products.badge.bestseller') }}</span>
        </div> -->
        <div class="product-card-badges d-flex gap-1 flex-column">

            <ProductBadges :product="product" />
        </div>
        <router-link :to="resolve(product.url)" class="product-card-image" tabindex="-1">
            <ProductImage :src="product.image" :alt="product.name ?? ''" />
        </router-link>

        <div class="product-card-content">
            <div class="product-card-details">
                <router-link :to="resolve(product.url)" class="product-card-name-link">
                    <h3 class="product-card-name">{{ product.name }}</h3>
                </router-link>

                <ProductRating :rating="product.rating ?? { average: 0, count: 0 }" class="product-card-rating" />

                <div v-if="product.catalog_number" class="product-card-meta">
                    <span v-if="product.catalog_number">{{ t('products.details.nr_katalogowy') }}: {{
                        product.catalog_number }}</span>
                </div>

                <div class="product-card-availability">
                    <span class="availability-status" :class="{ 'availability-status--unavailable': !canOrder }">
                        {{ canOrder ? t('products.details.available') : t('products.out_of_stock') }}
                    </span>
                    <span v-if="product.stock <= 0 && product.delivery_date" class="shipment-text">
                        {{ t('products.shipment') }}: {{ t('products.delivery_after') }} {{ product.delivery_date }}
                    </span>
                    <span v-else-if="canOrder && product.delivery_text" class="shipment-text"
                        :class="{ 'shipment-text--immediate': product.delivery_text === '24h' }">
                        {{ t('products.shipment') }}:
                        {{ t(`products.delivery_details.${product.delivery_text}`) }}
                    </span>
                </div>
            </div>

            <div class="product-card-side">
                <div class="product-card-brand">
                    <router-link v-if="product.manufacturer" :to="resolve(product.manufacturer.url)">
                        <img v-if="product.manufacturer.logo_url" :src="product.manufacturer.logo_url.replace(
                            'http://127.0.0.1:8000',
                            'https://cliply-test-b2b.exis24.pl'
                        )" :alt="product.manufacturer.name ?? ''" />
                        <span v-else-if="product.manufacturer.name">{{ product.manufacturer.name }}</span>
                    </router-link>
                </div>

                <div class="product-card-action-block">
                    <div class="product-card-actions">
                        <ProductCompareButton :product-id="product.id" type="normal" />
                        <FavouriteButton v-if="auth.isLogged" :product-id="product.id"
                            :label="t('favourite.add_to_favourites')" class="product-card-favourite" />
                    </div>

                    <div class="product-card-purchase">
                        <div class="product-card-price-container">
                            <p v-if="isNet && product.net_price" class="product-card-price">
                                <strong>{{ product.net_price }}</strong> <span>{{ t('products.details.net') }}</span>
                            </p>
                            <p v-if="isGross && product.gross_price" class="product-card-price">
                                <strong>{{ product.gross_price }}</strong> <span>{{ t('products.details.gross')
                                    }}</span>
                            </p>
                        </div>
                        <div class="product-buy">
                            <AddToCart v-if="canOrder" :product-id="product.id" :show-quantity-control="true"
                                :max="product.stock_status === 0 ? product.stock : undefined" />
                            <BaseButton v-else class="on_the_way" disabled>
                                <BaseIcon name="block" />
                                {{ t('products.out_of_stock') }}
                            </BaseButton>
                        </div>
                    </div>
                </div>
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
import ProductCompareButton from '@/views/site/components/productCompareButton/ProductCompareButton.vue'
import ProductRating from '@/views/site/dynamic/shop/ProductView/components/ProductRating.vue'
import { useUrlResolver } from '@/composables/useUrlResolver'
import BaseButton from '@shared/ui/BaseButton.vue'
import BaseIcon from '@shared/ui/BaseIcon.vue'
import { storeToRefs } from 'pinia'
import { usePriceTypeStore } from '@/core/stores/priceTypeStore'
import { useAuthStore } from '@/core/stores/authStore'
import ProductImage from '@/views/site/components/products/ProductImage.vue'
import ProductBadges from '@/views/site/dynamic/shop/ProductView/components/ProductBadges.vue'

const { t } = useI18n()
const { resolve } = useUrlResolver()
const { isNet, isGross } = storeToRefs(usePriceTypeStore())
const auth = useAuthStore()

const props = defineProps<{
    product: ProductItem
}>()

const canOrder = computed(() =>
    props.product.stock_status === 1 ||
    (props.product.stock_status === 0 && props.product.stock > 0)
)
</script>

<style scoped>
@import './List.css';
</style>
