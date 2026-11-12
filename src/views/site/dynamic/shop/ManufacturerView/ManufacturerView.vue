<template>
    <Breadcrumbs :items="[
        {
            name: t('brands.breadcrumb'),
            url: directoryPath,
        },
        {
            name: data.name || t('brands.unnamed'),
        },
    ]" />

    <div class="content-container manufacturer-view">

        <h1 class="manufacturer-title">
            {{ data.name }}
        </h1>

        <div v-if="!ready" class="text-muted py-5 text-center">
            {{ t('category.filters.loading_products') }}
        </div>

        <div v-else class="manufacturer-layout d-flex">

            <!-- LEFT -->
            <div class="left-site col-md-3">

                <div v-if="filtersOpen" class="filters-backdrop" @click="filtersOpen = false"></div>

                <aside class="manufacturer-filters-panel" :class="{ 'is-open': filtersOpen }"
                    :aria-hidden="isMobile && !filtersOpen" :role="isMobile ? 'dialog' : undefined"
                    :aria-modal="isMobile && filtersOpen" :aria-label="t('category.filters.all_filters')">

                    <div class="category-filters-mobile-header">

                        <strong>
                            {{ t('category.filters.all_filters') }}
                        </strong>

                        <button ref="filtersCloseButton" type="button" :aria-label="t('category.filters.close_filters')"
                            @click="filtersOpen = false">
                            ×
                        </button>

                    </div>

                    <SearchFilters :show-count="true" :categories="categoriesData" :manufacturers="[]"
                        :shipping-filters="shippingFilters" :additional-filters="additionalFilters"
                        :active-additional="activeAdditional"
                        @update:active-additional="activeAdditional = $event"
                        :features="featuresData" v-model:active-categories="activeCategories" :active-manufacturers="[]"
                        v-model:active-features="activeFeatures" v-model:active-ranges="activeRanges"
                        @apply="applyFilters" @reset="resetFilters" />
                </aside>

            </div>

            <!-- RIGHT -->
            <div class="right-site col-md-9">

                <BannerBlock type="manufacturer" :context-id="data.id" />

                <ProductsListHeader ref="productsListHeader" :active-filter-chips="activeFilterChips"
                    :filters-open="filtersOpen" :per-page="perPage" :sort="sort"
                    @open-filters="filtersOpen = true" @reset-filters="resetFilters"
                    @per-page-change="changePerPage" @sort-change="changeSort" />

                <div class="products-area">

                    <div v-if="loading" class="text-muted py-5 text-center">
                        {{ t('category.filters.loading_products') }}
                    </div>

                    <template v-else>

                        <ProductsList v-if="displayProducts.length > 0" :products="displayProducts" />

                        <div v-else class="text-muted py-5 text-center">
                            {{
                                t(
                                    hasActiveFilters
                                        ? 'category.filters.no_products_filtered'
                                        : 'category.no_products'
                                )
                            }}
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
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from 'vue'

import { useI18n } from 'vue-i18n'

import CategoryPagination from '@/views/site/components/category/CategoryPagination/CategoryPagination.vue'

import ProductsList from '@/views/site/components/products/productsList/ProductsList.vue'
import ProductsListHeader from '@/views/site/components/products/productsList/ProductsListHeader.vue'

import BannerBlock from '@/views/shared/components/BannerBlock.vue'
import Breadcrumbs from '@/views/site/components/breadcrumbs/Breadcrumbs.vue'

import SearchFilters from './../SearchView/SearchFilters/SearchFilters.vue'

import { useManufacturerView } from './ManufacturerView'

const props = defineProps<{
    data: any
}>()

const { t, locale } = useI18n()
const directoryPath = computed(() => ({
    pl: '/producenci',
    en: '/brands',
    de: '/hersteller',
}[locale.value] ?? '/brands'))

const filtersOpen = ref(false)
const isMobile = ref(false)

const filtersCloseButton =
    ref<HTMLButtonElement | null>(null)

const productsListHeader =
    ref<{ focusFilterButton: () => void } | null>(null)

let mobileQuery: MediaQueryList | null = null

const updateMobile = () => {
    isMobile.value = mobileQuery?.matches ?? false
}

const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        filtersOpen.value = false
    }
}

onMounted(() => {
    mobileQuery = window.matchMedia(
        '(max-width: 991px)'
    )

    updateMobile()

    mobileQuery.addEventListener(
        'change',
        updateMobile
    )

    window.addEventListener(
        'keydown',
        closeOnEscape
    )
})

onBeforeUnmount(() => {
    mobileQuery?.removeEventListener(
        'change',
        updateMobile
    )

    window.removeEventListener(
        'keydown',
        closeOnEscape
    )

    document.body.style.overflow = ''
})

watch(
    filtersOpen,
    async open => {
        document.body.style.overflow =
            open && isMobile.value
                ? 'hidden'
                : ''

        await nextTick()

        if (open) {
            filtersCloseButton.value?.focus()
        } else if (isMobile.value) {
            productsListHeader.value?.focusFilterButton()
        }
    }
)

watch(
    isMobile,
    mobile => {
        if (!mobile) {
            filtersOpen.value = false
        }
    }
)

watch(
    () => props.data.id,
    () => {
        filtersOpen.value = false
    }
)

const {
    categoriesData,
    featuresData,
    shippingFilters,
    additionalFilters,
    activeCategories,
    activeFeatures,
    activeRanges,
    activeAdditional,

    loading,
    ready,

    displayProducts,
    hasActiveFilters,

    applyFilters,
    resetFilters,

    pagination,
    changePage,
    changePerPage,
    sort,
    changeSort,
    perPage,
} = useManufacturerView(props)

/**
 * --------------------------------------------------------------------------
 * ACTIVE FILTER CHIPS
 * --------------------------------------------------------------------------
 */

const activeFilterChips = computed(() => {
    const chips: {
        id: string
        label: string
        remove: () => void
    }[] = []

    for (const key of activeAdditional.value) {
        chips.push({
            id: `additional-${key}`,
            label: t(`category.filters.additional_items.${key}`),
            remove: () => {
                activeAdditional.value = activeAdditional.value.filter(item => item !== key)
                applyFilters()
            },
        })
    }

    for (const categoryId of activeCategories.value) {
        const category = categoriesData.value.find(
            (item: any) =>
                Number(item.id) === Number(categoryId)
        )

        chips.push({
            id: `category_${categoryId}`,

            label: `${t(
                'category.filters.category'
            )}: ${category?.name ?? categoryId}`,

            remove: () => {
                activeCategories.value =
                    activeCategories.value.filter(
                        id => id !== categoryId
                    )

                applyFilters()
            },
        })
    }

    return chips
})
</script>

<style scoped>
@import './ManufacturerView.css';
@import '../CategoryView/CategoryView.css';
</style>