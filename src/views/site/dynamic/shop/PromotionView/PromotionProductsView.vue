<template>
  <Breadcrumbs :items="[
    { name: t('compare.home'), url: '/' },
    { name: t('promotions.products_title') },
  ]" />

  <div class="content-container search-view promotions-products-view">
    <h1 class="category-title">{{ t('promotions.products_title') }}</h1>

    <div class="search-layout d-flex">
      <div class="left-site col-md-3">
        <div v-if="filtersOpen" class="filters-backdrop" @click="filtersOpen = false" />

        <aside
          class="search-filters-panel"
          :class="{ 'is-open': filtersOpen }"
          :aria-hidden="isMobile && !filtersOpen"
          :role="isMobile ? 'dialog' : undefined"
          :aria-modal="isMobile && filtersOpen"
          :aria-label="t('category.filters.all_filters')"
        >
          <div class="search-filters-mobile-header">
            <strong>{{ t('category.filters.all_filters') }}</strong>
            <button
              ref="filtersCloseButton"
              type="button"
              :aria-label="t('category.filters.close_filters')"
              @click="filtersOpen = false"
            >
              ×
            </button>
          </div>

          <SearchFilters
            :show-count="true"
            :categories="categories"
            :manufacturers="[]"
            :features="[]"
            :promotions="promotions"
            v-model:active-categories="activeCategories"
            v-model:active-manufacturers="noManufacturers"
            v-model:active-features="noFeatures"
            v-model:active-ranges="noRanges"
            v-model:active-promotions="activePromotions"
            @apply="applyFilters"
            @reset="resetFilters"
          />
        </aside>
      </div>

      <div class="right-site col-md-9">
        <ProductsListHeader
          ref="productsListHeader"
          :active-filter-chips="activeFilterChips"
          :filters-open="filtersOpen"
          :per-page="perPage"
          :total="pagination.total"
          :per-page-options="[10, 20, 30, 50]"
          @open-filters="filtersOpen = true"
          @reset-filters="resetFilters"
          @per-page-change="changePerPage"
        />

        <div class="products-area">
          <div v-if="loading" class="text-muted py-5 text-center">
            {{ t('category.filters.loading_products') }}
          </div>

          <div v-else-if="error" class="text-danger py-5 text-center" role="alert">
            {{ error }}
          </div>

          <template v-else>
            <ProductsList v-if="products.length" :products="products" />
            <div v-else class="text-muted py-5 text-center">
              {{ hasActiveFilters ? t('category.filters.no_products_filtered') : t('promotions.products_empty') }}
            </div>

            <CategoryPagination
              v-if="pagination.total > 0"
              :page="pagination.current_page"
              :per-page="pagination.per_page"
              :total="pagination.total"
              :last-page="pagination.last_page"
              :disabled="loading"
              @change="changePage"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/core/api/axios'
import Breadcrumbs from '@/views/site/components/breadcrumbs/Breadcrumbs.vue'
import CategoryPagination from '@/views/site/components/category/CategoryPagination/CategoryPagination.vue'
import ProductsList from '@/views/site/components/products/productsList/ProductsList.vue'
import ProductsListHeader from '@/views/site/components/products/productsList/ProductsListHeader.vue'
import SearchFilters from '@/views/site/dynamic/shop/SearchView/SearchFilters/SearchFilters.vue'
import type { SearchCategory } from '@/views/site/dynamic/shop/SearchView/SearchFilters/SearchFilters'
import './PromotionProductsView.css'

interface PromotionFilter {
  id: number
  name: string | null
  count: number
}

interface ProductsResponse {
  products: any[]
  categories: SearchCategory[]
  promotions: PromotionFilter[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface FilterChip {
  id: string
  label: string
  remove: () => void
}

const { t } = useI18n()
const categories = ref<SearchCategory[]>([])
const promotions = ref<PromotionFilter[]>([])
const products = ref<any[]>([])
const activeCategories = ref<number[]>([])
const activePromotions = ref<number[]>([])
const noManufacturers = ref<number[]>([])
const noFeatures = ref<Record<number, Record<number, string[]>>>({})
const noRanges = ref<Record<string, number | null>>({})
const loading = ref(true)
const error = ref('')
const page = ref(1)
const perPage = ref(20)
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
})
let requestVersion = 0

const hasActiveFilters = computed(
  () => activeCategories.value.length > 0 || activePromotions.value.length > 0,
)

const activeFilterChips = computed<FilterChip[]>(() => [
  ...activePromotions.value.map((id) => {
    const promotion = promotions.value.find((item) => item.id === id)
    return {
      id: `promotion-${id}`,
      label: `${t('promotions.promotion_filter')}: ${promotion?.name || id}`,
      remove: () => {
        activePromotions.value = activePromotions.value.filter((item) => item !== id)
        applyFilters()
      },
    }
  }),
  ...activeCategories.value.map((id) => {
    const category = categories.value.find((item) => item.id === id)
    return {
      id: `category-${id}`,
      label: `${t('category.filters.category')}: ${category?.name || id}`,
      remove: () => {
        activeCategories.value = activeCategories.value.filter((item) => item !== id)
        applyFilters()
      },
    }
  }),
])

const filtersOpen = ref(false)
const isMobile = ref(false)
const filtersCloseButton = ref<HTMLButtonElement | null>(null)
const productsListHeader = ref<{ focusFilterButton: () => void } | null>(null)
let mobileQuery: MediaQueryList | null = null

function updateMobile() {
  isMobile.value = mobileQuery?.matches ?? false
}

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') filtersOpen.value = false
}

async function fetchProducts() {
  const version = ++requestVersion
  loading.value = true
  error.value = ''

  try {
    const { data } = await api.get<ProductsResponse>('/promotions/products', {
      params: {
        page: page.value,
        per_page: perPage.value,
        category: activeCategories.value,
        promtow: activePromotions.value,
      },
      paramsSerializer: { indexes: true },
    })

    if (version !== requestVersion) return

    products.value = data.products
    categories.value = data.categories
    promotions.value = data.promotions
    pagination.value = data.pagination
  } catch (cause) {
    if (version !== requestVersion) return
    console.error('Fetch promotional products failed', cause)
    error.value = t('promotions.products_load_error')
    products.value = []
  } finally {
    if (version === requestVersion) loading.value = false
  }
}

function applyFilters() {
  page.value = 1
  void fetchProducts()
}

function resetFilters() {
  activeCategories.value = []
  activePromotions.value = []
  page.value = 1
  void fetchProducts()
}

function changePage(newPage: number) {
  if (newPage < 1 || newPage > pagination.value.last_page) return
  page.value = newPage
  void fetchProducts()
}

function changePerPage(value: number) {
  if (![10, 20, 30, 50].includes(value)) return
  perPage.value = value
  page.value = 1
  void fetchProducts()
}

onMounted(() => {
  mobileQuery = window.matchMedia('(max-width: 991px)')
  updateMobile()
  mobileQuery.addEventListener('change', updateMobile)
  window.addEventListener('keydown', closeOnEscape)
  void fetchProducts()
})

onBeforeUnmount(() => {
  requestVersion++
  mobileQuery?.removeEventListener('change', updateMobile)
  window.removeEventListener('keydown', closeOnEscape)
  document.body.style.overflow = ''
})

watch(filtersOpen, async (open) => {
  document.body.style.overflow = open && isMobile.value ? 'hidden' : ''
  await nextTick()
  if (open) filtersCloseButton.value?.focus()
  else if (isMobile.value) productsListHeader.value?.focusFilterButton()
})

watch(isMobile, (mobile) => {
  if (!mobile) filtersOpen.value = false
})
</script>
