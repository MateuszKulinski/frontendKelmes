<template>
    <div class="compare-page content-container">
        <nav class="compare-breadcrumb" aria-label="Breadcrumb">
            <router-link :to="t('url.routes.dashboard')">{{ t('compare.home') }}</router-link>
            <span aria-hidden="true">/</span>
            <strong>{{ t('compare.title') }}</strong>
        </nav>

        <div class="compare-layout">
            <section class="compare-main" :aria-label="t('compare.heading')">
                <header class="compare-intro">
                    <h1>
                        <BaseIcon name="compare" /> {{ t('compare.heading') }}
                    </h1>
                    <p>{{ t('compare.intro') }}</p>
                </header>

                <div class="product-grid">
                    <router-link v-if="products.length < 4" :to="t('url.routes.dashboard')" class="add-product-card">
                        <span class="add-product-icon">
                            <BaseIcon name="plus" />
                        </span>
                        <strong>{{ t('compare.add_product') }}</strong>
                        <small>{{ t('compare.max_products_hint') }}</small>
                    </router-link>

                    <article v-for="product in products" :key="product.id" class="product-card"
                        :class="{ 'is-recommended-card': product.id === insights.recommended_product_id }">
                        <span v-if="product.id === insights.recommended_product_id" class="recommended-badge">
                            {{ t('compare.recommended') }}
                        </span>
                        <button type="button" class="remove-product" :aria-label="t('compare.remove_product')"
                            @click="compareStore.remove(product.id)">
                            <BaseIcon name="remove" />
                        </button>

                        <router-link :to="resolve(product.url)" class="product-card-image">
                            <img v-if="product.image" :src="product.image" :alt="product.name ?? ''">
                            <BaseIcon v-else name="image" />
                        </router-link>

                        <router-link :to="resolve(product.url)" class="product-card-name">
                            {{ product.name }}
                        </router-link>
                        <span class="product-card-brand">{{ product.manufacturer }}</span>

                        <div class="product-card-price">
                            <strong>{{ product.gross_price }}</strong>
                            <span>{{ t('products.details.gross') }}</span>
                            <small>{{ product.net_price }} {{ t('products.details.net') }}</small>
                        </div>

                        <router-link :to="resolve(product.url)" class="view-product-button">
                            <i class="fa-regular fa-eye" aria-hidden="true"></i>
                            {{ t('compare.view_product') }}
                        </router-link>
                    </article>
                </div>

                <p v-if="!products.length && !detailsLoading" class="compare-empty">{{ t('compare.empty') }}</p>

                <div v-if="products.length" class="compare-table-wrap">
                    <table class="compare-table">
                        <thead>
                            <tr>
                                <th scope="col">{{ t('compare.parameter') }}</th>
                                <th v-for="product in products" :key="product.id" scope="col">
                                    {{ product.name }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">
                                    <BaseIcon name="delivery" /> {{ t('compare.availability') }}
                                </th>
                                <td v-for="product in products" :key="product.id"
                                    :class="{ 'is-recommended': hasBetterAvailability(product) }">
                                    <span class="availability" :class="{ 'is-available': product.available }">
                                        {{ product.available ? t('products.details.available') :
                                        t('products.details.niedostepny') }}
                                        <span class="availability-dot" aria-hidden="true"></span>
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <BaseIcon name="star" /> {{ t('products.details.rating') }}
                                </th>
                                <td v-for="product in products" :key="product.id"
                                    :class="{ 'is-recommended': hasBetterRating(product) }">
                                    {{ product.rating !== null && product.rating !== undefined
                                        ? `${product.rating} (${product.rating_count})` : '–' }}
                                </td>
                            </tr>
                            <!-- <tr>
                                <th scope="row"><BaseIcon name="features" /> {{ t('products.details.indeks') }}</th>
                                <td v-for="product in products" :key="product.id">
                                    {{ product.indeks ?? '–' }}
                                </td>
                            </tr> -->
                            <tr>
                                <th scope="row">
                                    <BaseIcon name="features" /> {{ t('products.details.nr_katalogowy') }}
                                </th>
                                <td v-for="product in products" :key="product.id">
                                    {{ product.catalog_number ?? '–' }}
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <BaseIcon name="box" /> {{ t('products.details.packages') }}
                                </th>
                                <td v-for="product in products" :key="product.id">
                                    <template v-if="product.packagings?.length">
                                        <span v-for="uom in product.packagings" :key="`${uom.quantity}-${uom.name}`"
                                            class="package-value">
                                            {{ uom.quantity }} × {{ uom.name }}
                                        </span>
                                    </template>
                                    <span v-else>–</span>
                                </td>
                            </tr>
                            <tr v-for="feature in features" :key="feature.id"
                                :class="{ 'difference-row': differenceKeys.has(`feature_${feature.id}`) }">
                                <th scope="row">
                                    <BaseIcon name="features" /> {{ feature.name }}
                                </th>
                                <td v-for="product in products" :key="product.id">
                                    {{ feature.values[product.id] ?? '–' }}
                                </td>
                            </tr>
                            <tr class="price-row">
                                <th scope="row"><i class="fa-solid fa-tag" aria-hidden="true"></i> {{ t('compare.price')
                                    }}</th>
                                <td v-for="product in products" :key="product.id"
                                    :class="{ 'is-recommended': hasBetterPrice(product) }">
                                    <strong>{{ product.gross_price }}</strong>
                                    <small>{{ product.net_price }} {{ t('products.details.net') }}</small>
                                </td>
                            </tr>
                            <tr class="cart-row">
                                <th scope="row">
                                    <BaseIcon name="cart" /> {{ t('cart.add_to_cart') }}
                                </th>
                                <td v-for="product in products" :key="product.id">
                                    <AddToCart :product-id="product.id" :show-quantity-control="false"
                                        :disabled="!product.available" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <aside v-if="products.length" class="compare-sidebar">
                <section class="insight-card">
                    <h2>{{ t('compare.biggest_differences') }}</h2>
                    <ul v-if="insights.biggest_differences.length" class="differences-list">
                        <li v-for="difference in insights.biggest_differences" :key="difference.key">
                            <span class="insight-icon">
                                <BaseIcon :name="differenceIcon(difference.key)" />
                            </span>
                            <div>
                                <strong>{{ differenceName(difference.key) }}</strong>
                                <span v-for="product in products" :key="product.id" class="difference-value">
                                    {{ product.name }}: {{ differenceValue(difference.key, product) }}
                                </span>
                            </div>
                        </li>
                    </ul>
                    <p v-else class="insight-muted">{{ t('compare.no_differences') }}</p>
                </section>

                <section class="insight-card">
                    <h2>{{ t('compare.recommended_product') }}</h2>
                    <div v-if="recommendedProduct" class="recommended-summary">
                        <router-link :to="resolve(recommendedProduct.url)" class="summary-image">
                            <img v-if="recommendedProduct.image" :src="recommendedProduct.image"
                                :alt="recommendedProduct.name ?? ''">
                            <BaseIcon v-else name="image" />
                        </router-link>
                        <div>
                            <strong>{{ recommendedProduct.name }}</strong>
                            <p>{{ t('compare.recommendation_reason') }}</p>
                            <router-link :to="resolve(recommendedProduct.url)" class="summary-link">
                                {{ t('compare.view_product') }}
                                <BaseIcon name="arrowRight" />
                            </router-link>
                        </div>
                    </div>
                    <p v-else class="insight-muted">{{ t('compare.no_recommendation') }}</p>
                </section>

                <section class="insight-card">
                    <h2>{{ t('compare.lowest_price') }}</h2>
                    <div class="lowest-summary">
                        <span class="insight-icon lowest-icon"><i class="fa-solid fa-tag" aria-hidden="true"></i></span>
                        <div>
                            <p v-if="insights.lowest_price.same_for_all">{{ t('compare.same_price') }}</p>
                            <template v-else-if="lowestPriceProduct">
                                <strong>{{ lowestPriceProduct.gross_price }}</strong>
                                <span class="price-kind">{{ t('products.details.gross') }}</span>
                                <p>{{ lowestPriceProduct.name }}</p>
                            </template>
                            <p v-else>{{ t('compare.no_price') }}</p>
                        </div>
                    </div>
                </section>

                <section class="insight-card product-details-info">
                    <div v-if="freeDeliveryText" class="details-item">
                        <span class="custom-icon icon-package"></span>
                        <div class="delivery-text">
                            <span class="bold">{{ t('products.free_delivery_from') }}:</span>
                            <span>{{ freeDeliveryText }}</span>
                        </div>
                    </div>

                    <div class="details-item">
                        <span class="custom-icon icon-return"></span>
                        <div class="delivery-text">
                            <span class="bold">{{ t('products.return') }}:</span>
                            <span>14 {{ t('products.days') }}</span>
                        </div>
                    </div>

                    <div class="details-item">
                        <span class="custom-icon icon-documents"></span>
                        <div class="delivery-text">
                            <span class="bold">{{ t('products.vat_invoice') }}</span>
                        </div>
                    </div>

                    <div class="details-item last">
                        <span class="custom-icon icon-wallet"></span>
                        <div class="delivery-text">
                            <span class="bold">{{ t('products.secure_payments') }}</span>
                        </div>
                    </div>

                    <div class="details-img-container">
                        <img :src="fastPayments" alt="">
                    </div>
                </section>

                <section class="insight-card">
                    <h2 class="help-title">{{ t('panelDashboard.sidebar_help') }}</h2>
                    <router-link :to="{ name: 'panel.inquiryCreate' }" class="help-item">
                        <BaseIcon name="users" />
                        <span>{{ t('panelDashboard.contact_sales') }}</span>
                    </router-link>
                </section>
            </aside>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCompareStore } from '@/core/stores/compareStore'
import type { CompareProduct } from '@/core/stores/compareStore'
import { useAuthStore } from '@/core/stores/authStore'
import { useCartStore } from '@/core/stores/cartStore'
import { useUrlResolver } from '@/composables/useUrlResolver'
import AddToCart from '@/views/shared/ui/AddToCart.vue'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import fastPayments from '/img/custom-images/fast-payments.png'

const { t, locale } = useI18n()
const { resolve } = useUrlResolver()
const compareStore = useCompareStore()
const { products, features, insights, detailsLoading } = storeToRefs(compareStore)
const authStore = useAuthStore()
const cartStore = useCartStore()

const freeDeliveryText = computed(() => {
    const policy = cartStore.cart?.free_delivery ?? authStore.unit?.free_delivery

    if (policy?.always_free) {
        return t('products.free_delivery_always')
    }

    if (!policy?.threshold || policy.threshold <= 0) {
        return ''
    }

    const amount = new Intl.NumberFormat(locale.value, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(policy.threshold)

    return t('products.free_delivery_amount', { amount })
})

const recommendedProduct = computed(() =>
    products.value.find(product => product.id === insights.value.recommended_product_id)
)
const lowestPriceProduct = computed(() =>
    products.value.find(product => product.id === insights.value.lowest_price.product_id)
)
const differenceKeys = computed(() =>
    new Set(insights.value.biggest_differences.map(difference => difference.key))
)

function isRecommendedWithComparison(product: CompareProduct): boolean {
    return products.value.length > 1 && product.id === insights.value.recommended_product_id
}

function hasBetterAvailability(product: CompareProduct): boolean {
    return isRecommendedWithComparison(product)
        && product.available
        && products.value.every(other => other.id === product.id || !other.available)
}

function hasBetterRating(product: CompareProduct): boolean {
    const rating = product.rating
    return isRecommendedWithComparison(product)
        && (product.rating_count ?? 0) > 0
        && typeof rating === 'number'
        && products.value.every(other =>
            other.id === product.id
            || ((other.rating_count ?? 0) > 0
                && typeof other.rating === 'number'
                && rating > other.rating)
        )
}

function hasBetterPrice(product: CompareProduct): boolean {
    return isRecommendedWithComparison(product)
        && product.gross_price_raw > 0
        && products.value.every(other =>
            other.id === product.id
            || (other.gross_price_raw > 0 && product.gross_price_raw < other.gross_price_raw)
        )
}

function differenceIcon(key: string): string {
    if (key === 'availability') return 'delivery'
    if (key === 'price') return 'priceDiscount'
    return 'features'
}

function differenceName(key: string): string {
    if (key === 'price') return t('compare.price')
    if (key === 'availability') return t('compare.availability')
    return features.value.find(feature => `feature_${feature.id}` === key)?.name ?? key
}

function differenceValue(key: string, product: CompareProduct): string | number {
    if (key === 'price') return product.gross_price
    if (key === 'availability') {
        return product.available ? t('products.details.available') : t('products.details.niedostepny')
    }
    const feature = features.value.find(item => `feature_${item.id}` === key)
    return feature?.values[product.id] ?? '–'
}

onMounted(() => {
    compareStore.fetchDetails()
})
</script>

<style scoped src="./ProductCompare.css"></style>
