<template>
  <Breadcrumbs v-if="!embedded && data.breadcrumbs?.length > 0" :items="data.breadcrumbs.map((crumb: any) => ({
    name: crumb.name,
    url: crumb.url ? resolve(crumb.url) : undefined,
  }))
    " />

  <div class="category-view" :class="{ 'content-container': !embedded }">

    <h1 v-if="!embedded" class="category-title">
      {{ data.name }}
    </h1>

    <div v-if="!ready" class="text-muted py-5 text-center">
      {{ t('category.filters.loading_products') }}
    </div>

    <div v-else class="category-layout d-flex">

      <div class="left-site col-md-3">

        <CategoryTree v-if="!outletMode && data.tree?.children?.length" :tree="data.tree" :active-id="data.id"
          :limit-items="isMobile" />

        <div v-if="filtersOpen" class="filters-backdrop" @click="filtersOpen = false"></div>

        <aside class="category-filters-panel" :class="{ 'is-open': filtersOpen }"
          :aria-hidden="isMobile && !filtersOpen" :role="isMobile ? 'dialog' : undefined"
          :aria-modal="isMobile && filtersOpen" :aria-label="t('category.filters.all_filters')
            ">
          <div class="category-filters-mobile-header">

            <strong>
              {{ t('category.filters.all_filters') }}
            </strong>

            <button ref="filtersCloseButton" type="button" :aria-label="t('category.filters.close_filters')
              " @click="filtersOpen = false">
              ×
            </button>

          </div>

          <CategoryFilters :filters="filtersData" :categories="outletMode ? outletCategories : []"
            :manufacturers="manufacturersData" :shipping-filters="shippingFilters"
            :additional-filters="additionalFilters" :price-range="priceRange"
            v-model:active-additional="activeAdditional" v-model:active-categories="activeOutletCategories"
            :rating="ratingRange" :active-features="activeFeatures" :active-ranges="activeRanges"
            :has-active-filters="hasActiveFilters" v-model:price-min="activePriceMin" v-model:price-max="activePriceMax"
            v-model:active-manufacturers="activeManufacturers" v-model:rating-min="activeRatingMin"
            @apply="applyFilters" @reset="resetFilters" />

        </aside>

      </div>

      <div class="right-site col-md-9">

        <!-- Banery kategorii -->
        <BannerBlock v-if="!embedded" type="category" :context-id="data.id" />

        <section v-if="!embedded && (categoryDescriptionHtml || data.description)" class="category-description">
          <div v-if="categoryDescriptionHtml" v-html="categoryDescriptionHtml"></div>
          <p v-else>{{ data.description }}</p>
        </section>

        <ProductsListHeader ref="productsListHeader" :active-filter-chips="activeFilterChips"
          :filters-open="filtersOpen" :per-page="perPage" :total="pagination?.total ?? 0" v-model:view-type="viewType"
          :sort="sort" @open-filters="filtersOpen = true" @reset-filters="resetFilters" @per-page-change="changePerPage"
          @sort-change="changeSort" />

        <div class="products-area">

          <div v-if="loading" class="text-muted py-5 text-center">
            {{ t('category.filters.loading_products') }}
          </div>

          <template v-else>

            <ProductsList v-if="displayProducts.length > 0" :products="displayProducts" :view-type="viewType" />

            <div v-else class="text-muted py-5 text-center">
              {{ t(hasActiveFilters ? 'category.filters.no_products_filtered' : 'category.no_products') }}
            </div>

            <div v-if="pagination && pagination.total > 0" class="category-products-footer">
              <p class="category-products-summary">
                {{ t('category.pagination.displayed_products', {
                  from: (pagination.current_page - 1) * pagination.per_page + 1,
                  to: Math.min(pagination.current_page * pagination.per_page, pagination.total),
                  total: pagination.total,
                }) }}
              </p>
              <CategoryPagination :page="pagination.current_page" :per-page="pagination.per_page"
                :total="pagination.total" :last-page="pagination.last_page" :disabled="loading" @change="changePage" />
            </div>

          </template>

        </div>

      </div>

    </div>

    <section v-if="!embedded && (categoryShortDescriptionHtml || data.description_short)"
      class="category-short-description">
      <div v-if="categoryShortDescriptionHtml" v-html="categoryShortDescriptionHtml"></div>
      <p v-else>{{ data.description_short }}</p>
    </section>

    <RelatedNews v-if="showRelatedNews" :items="data.articles || []" />

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

import CategoryFilters from './CategoryFilters/CategoryFilters.vue'
import CategoryTree from './CategoryTree/CategoryTree.vue'
import { useCategoryView } from './useCategoryView'

import ProductsList from '@/views/site/components/products/productsList/ProductsList.vue'
import ProductsListHeader from '@/views/site/components/products/productsList/ProductsListHeader.vue'
import { useProductsView } from '@/views/site/components/products/productsList/useProductsView'

import { useUrlResolver } from '@/composables/useUrlResolver'

import BannerBlock from '@/views/shared/components/BannerBlock.vue'
import RelatedNews from '@/views/site/components/news/RelatedNews.vue'
import Breadcrumbs from '@/views/site/components/breadcrumbs/Breadcrumbs.vue'

const props = defineProps<{
  data: any
  embedded?: boolean
  outletMode?: boolean
  showRelatedNews?: boolean
}>()
const showRelatedNews = computed(() => props.showRelatedNews ?? true)

const { resolve } = useUrlResolver()

const { t } = useI18n()
const { viewType } = useProductsView()
const categoryDescriptionHtml = computed(
  () => props.data.description_html?.trim() || null,
)
const categoryShortDescriptionHtml = computed(
  () => props.data.description_short_html?.trim() || null,
)

const filtersOpen = ref(false)
const isMobile = ref(false)

const filtersCloseButton =
  ref<HTMLButtonElement | null>(null)

const productsListHeader = ref<{ focusFilterButton: () => void } | null>(null)

let mobileQuery: MediaQueryList | null = null

const updateMobile = () => {
  isMobile.value =
    mobileQuery?.matches ?? false
}

const closeOnEscape = (
  event: KeyboardEvent
) => {
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
  filtersData,
  manufacturersData,
  outletCategories,
  shippingFilters,
  additionalFilters,
  priceRange,
  ratingRange,

  activeFeatures,
  activeRanges,
  activeManufacturers,
  activeOutletCategories,
  activeAdditional,

  activePriceMin,
  activePriceMax,

  activeRatingMin,

  loading,
  ready,

  displayProducts,
  hasActiveFilters,

  applyFilters,
  resetFilters,

  removeFeatureValue,
  removeRangeFilter,
  removeManufacturer,
  removePriceFilter,
  removeRatingFilter,

  pagination,
  changePage,
  changePerPage,
  perPage,
  sort,
  changeSort,
} = useCategoryView(props)

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

  for (const categoryId of activeOutletCategories.value) {
    const category = outletCategories.value.find(item => item.id === categoryId)
    if (category) {
      chips.push({
        id: `category-${categoryId}`,
        label: category.name,
        remove: () => {
          activeOutletCategories.value = activeOutletCategories.value.filter(id => id !== categoryId)
          applyFilters()
        },
      })
    }
  }

  /**
   * FEATURES
   */
  for (const filter of filtersData.value) {
    if (
      filter.type === 'select' ||
      filter.type === 'multiselect' ||
      filter.type === 'boolean'
    ) {
      for (
        const valueId of activeFeatures[filter.id] ?? []
      ) {
        const option = filter.values?.find(
          (item: any) =>
            String(item.id) === String(valueId)
        )

        chips.push({
          id: `feature_${filter.id}_${valueId}`,

          label: `${filter.name}: ${option?.name ?? valueId
            }`,

          remove: () =>
            removeFeatureValue(
              filter.id,
              valueId
            ),
        })
      }
    }

    /**
     * NUMERIC FEATURES
     */
    if (
      filter.type === 'int' ||
      filter.type === 'decimal'
    ) {
      const min =
        activeRanges[
        `${filter.id}_min`
        ]

      const max =
        activeRanges[
        `${filter.id}_max`
        ]

      if (
        (min !== null && min !== undefined) ||
        (max !== null && max !== undefined)
      ) {
        chips.push({
          id: `feature_${filter.id}_range`,

          label: `${filter.name}: ${min ?? 'od'
            } – ${max ?? 'do'
            }`,

          remove: () =>
            removeRangeFilter(filter.id),
        })
      }
    }
  }

  /**
   * MANUFACTURERS
   */
  for (
    const manufacturerId of activeManufacturers.value
  ) {
    const manufacturer =
      manufacturersData.value.find(
        (item: any) =>
          Number(item.id) ===
          Number(manufacturerId)
      )

    chips.push({
      id: `manufacturer_${manufacturerId}`,

      label: `${t(
        'category.filters.manufacturer'
      )}: ${manufacturer?.name ??
      manufacturerId
        }`,

      remove: () =>
        removeManufacturer(
          Number(manufacturerId)
        ),
    })
  }

  /**
   * PRICE
   */
  if (
    activePriceMin.value !== null ||
    activePriceMax.value !== null
  ) {
    const min =
      activePriceMin.value ??
      priceRange.value?.min ??
      0

    const max =
      activePriceMax.value ??
      priceRange.value?.max ??
      ''

    chips.push({
      id: 'price',

      label: `${t(
        'category.filters.price'
      )}: ${min} – ${max}`,

      remove: removePriceFilter,
    })
  }

  /**
   * RATING
   */
  if (
    activeRatingMin.value !== null
  ) {
    chips.push({
      id: 'rating',

      label: `${t(
        'category.filters.rating'
      )}: ${activeRatingMin.value}+`,

      remove: removeRatingFilter,
    })
  }

  return chips
})

</script>

<style scoped>
@import './CategoryView.css';
</style>
