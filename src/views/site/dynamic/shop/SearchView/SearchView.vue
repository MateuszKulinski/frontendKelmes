<template>
    <Breadcrumbs :items="[
        { name: t('compare.home'), url: '/' },
        { name: t('category.search.breadcrumb') },
    ]" />

    <div class="content-container search-view">
        <h1 class="category-title">
            {{
                query
                    ? t('category.search.title', { query })
                    : activePromtow
                        ? t('category.search.promotion_title', { id: activePromtow })
                        : t('category.search.breadcrumb')
            }}
        </h1>

        <div v-if="!ready" class="text-muted py-5 text-center">
            {{ t('category.filters.loading_products') }}
        </div>

        <div v-else class="search-layout d-flex">
            <!-- LEWA KOLUMNA -->
            <div class="left-site col-md-3">
                <div v-if="filtersOpen" class="filters-backdrop" @click="filtersOpen = false" />

                <aside class="search-filters-panel" :class="{ 'is-open': filtersOpen }"
                    :aria-hidden="isMobile && !filtersOpen" :role="isMobile ? 'dialog' : undefined"
                    :aria-modal="isMobile && filtersOpen" :aria-label="t('category.filters.all_filters')">
                    <div class="search-filters-mobile-header">
                        <strong>
                            {{ t('category.filters.all_filters') }}
                        </strong>

                        <button ref="filtersCloseButton" type="button" :aria-label="t('category.filters.close_filters')"
                            @click="filtersOpen = false">
                            ×
                        </button>
                    </div>

                    <!-- <div class="promotion-filter">
                        <label for="search-promotion-id">
                            {{ t('category.search.promotion') }}
                        </label>
                        <input
                            id="search-promotion-id"
                            v-model="activePromtow"
                            type="number"
                            min="1"
                            inputmode="numeric"
                            :placeholder="t('category.search.promotion_placeholder')"
                            @change="applyFilters"
                        />
                    </div> -->

                    <SearchFilters :showCount="false" :show-category-count="true" :categories="categories" :manufacturers="manufacturers"
                        :features="features" :shipping-filters="shippingFilters"
                        :additional-filters="additionalFilters" :price-range="priceRange" :rating="ratingRange"
                        v-model:active-additional="activeAdditional" v-model:price-min="activePriceMin"
                        v-model:price-max="activePriceMax" v-model:rating-min="activeRatingMin"
                        v-model:active-categories="activeCategories"
                        v-model:active-manufacturers="activeManufacturers" v-model:active-features="activeFeatures"
                        v-model:active-ranges="activeRanges" @apply="applyFilters" @reset="resetFilters" />
                </aside>
            </div>

            <!-- PRAWA KOLUMNA -->
            <div class="right-site col-md-9">
                <ProductsListHeader ref="productsListHeader" :active-filter-chips="activeFilterChips"
                    :filters-open="filtersOpen" :per-page="perPage" :per-page-options="[10, 20, 24, 30, 50]"
                    :sort="sort" @open-filters="filtersOpen = true" @reset-filters="resetFilters"
                    @per-page-change="changePerPage" @sort-change="changeSort" />

                <!-- PRODUKTY -->
                <div class="products-area">
                    <div v-if="loading" class="text-muted py-5 text-center">
                        {{ t('category.filters.loading_products') }}
                    </div>

                    <template v-else>
                        <ProductsList v-if="products.length > 0" :products="products" />

                        <div v-else class="text-muted py-5 text-center">
                            {{ t('category.filters.no_products_filtered') }}
                        </div>

                        <CategoryPagination v-if="pagination && pagination.total > 0" :page="pagination.current_page"
                            :per-page="pagination.per_page" :total="pagination.total" :last-page="pagination.last_page"
                            :disabled="loading" @change="changePage" />
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from 'vue'
import { useI18n } from 'vue-i18n'

import Breadcrumbs from '@/views/site/components/breadcrumbs/Breadcrumbs.vue'
import ProductsList from '@/views/site/components/products/productsList/ProductsList.vue'
import ProductsListHeader from '@/views/site/components/products/productsList/ProductsListHeader.vue'
import CategoryPagination from '@/views/site/components/category/CategoryPagination/CategoryPagination.vue'

import SearchFilters from './SearchFilters/SearchFilters.vue'
import { useSearchView } from './useSearchView'

import './SearchView.css'

const {
    query,
    activePromtow,
    activeAdditional,
    activePriceMin,
    activePriceMax,
    activeRatingMin,
    categories,
    manufacturers,
    features,
    shippingFilters,
    additionalFilters,
    priceRange,
    ratingRange,
    products,

    activeCategories,
    activeManufacturers,
    activeFeatures,
    activeRanges,

    loading,
    ready,

    pagination,
    perPage,
    sort,

    activeFilterChips,

    applyFilters,
    resetFilters,

    changePage,
    changePerPage,
    changeSort,
    loadProducts,
} = useSearchView()

const { t } = useI18n()

const filtersOpen = ref(false)
const isMobile = ref(false)

const filtersCloseButton = ref<HTMLButtonElement | null>(null)

const productsListHeader = ref<{
    focusFilterButton: () => void
} | null>(null)

let mobileQuery: MediaQueryList | null = null

function updateMobile() {
    isMobile.value = mobileQuery?.matches ?? false
}

function closeOnEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        filtersOpen.value = false
    }
}

onMounted(() => {
    mobileQuery = window.matchMedia('(max-width: 991px)')

    updateMobile()

    mobileQuery.addEventListener('change', updateMobile)
    window.addEventListener('keydown', closeOnEscape)

    loadProducts()
})

onBeforeUnmount(() => {
    mobileQuery?.removeEventListener('change', updateMobile)
    window.removeEventListener('keydown', closeOnEscape)

    document.body.style.overflow = ''
})

watch(filtersOpen, async (open) => {
    document.body.style.overflow =
        open && isMobile.value ? 'hidden' : ''

    await nextTick()

    if (open) {
        filtersCloseButton.value?.focus()
    } else if (isMobile.value) {
        productsListHeader.value?.focusFilterButton()
    }
})

watch(isMobile, (mobile) => {
    if (!mobile) {
        filtersOpen.value = false
    }
})
</script>

<style scoped>
.search-view {
    width: 100%;
}
</style>