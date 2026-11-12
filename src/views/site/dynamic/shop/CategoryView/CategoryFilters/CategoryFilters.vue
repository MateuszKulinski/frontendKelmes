<template>
  <section v-if="
    filters.length > 0 ||
    categories?.length ||
    priceRange ||
    manufacturers?.length ||
    shippingFilters?.length ||
    additionalFilters?.length ||
    rating
  " class="filters-section">
    <!-- HEADER -->
    <div class="filters-header">
      <span class="filters-title">
        <BaseIcon name="filter" />

        {{ t('category.filters.all_filters') }}
      </span>

      <button v-if="hasActiveFilters" type="button" class="filters-reset-btn" @click="emit('reset')">
        {{ t('category.filters.reset') }}
      </button>
    </div>

    <div class="fliters-body">
      <!-- SEARCH -->
      <div class="filters-search">
        <input v-model="searchQuery" type="text" :placeholder="t('category.filters.search')
          " class="filters-search-input" />
      </div>

      <div v-if="additionalFilterOptions.length" class="filter-accordion">
        <div class="filter-accordion-body p-0">
          <label v-for="filter in additionalFilterOptions" :key="filter.key" class="filter-checkbox-label">
            <input v-model="activeAdditional" type="checkbox" :value="filter.key" @change="emit('apply')" />
            <span class="option-label">
              {{ t(`category.filters.additional_items.${filter.key}`) }}
            </span>
          </label>
        </div>
      </div>


      <div v-if="visibleCategories.length > 0" class="filter-accordion">
        <button type="button" class="filter-accordion-header" :class="{
          'is-active': activeCategories.length > 0,
        }" @click="isCategoriesOpen = !isCategoriesOpen">
          <span>{{ t('category.filters.category') }}</span>
          <BaseIcon :name="isCategoriesOpen ? 'chUp' : 'chDown'" />
        </button>

        <div v-if="isCategoriesOpen" class="filter-accordion-body">
          <label v-for="category in visibleCategories" :key="category.id" class="filter-checkbox-label">
            <input v-model="activeCategories" type="checkbox" :value="category.id" @change="emit('apply')" />
            <span class="option-label">{{ category.name }}</span>
            <span class="filter-count">({{ category.count }})</span>
          </label>
        </div>
      </div>


      <!-- ================================================= -->
      <!-- MANUFACTURERS -->
      <!-- ================================================= -->

      <div v-if="rating" class="filter-accordion">
        <button type="button" class="filter-accordion-header" :class="{
          'is-active':
            ratingMin !== null ||
            ratingMax !== null,
        }" @click="
          toggleRating()
          ">
          <span>
            {{
              t(
                'category.filters.rating'
              )
            }}
          </span>

          <BaseIcon :name="isRatingOpen
            ? 'chUp'
            : 'chDown'
            " />
        </button>

        <div v-if="isRatingOpen" class="filter-accordion-body">
          <label v-for="value in ratingValues" :key="value" class="filter-checkbox-label">
            <input v-model="selectedRating
              " type="radio" name="category-rating" :value="value" @change="
                emit('apply')
                " />

            <span class="option-label">
              {{ value }}+
            </span>
          </label>
        </div>
      </div>

      <div v-if="
        manufacturers &&
        manufacturers.length > 0
      " class="filter-accordion">
        <button type="button" class="filter-accordion-header" :class="{
          'is-active':
            activeManufacturers.length > 0,
        }" @click="
          toggleManufacturer()
          ">
          <span>
            {{
              t(
                'category.filters.manufacturer'
              )
            }}
          </span>

          <BaseIcon :name="isManufacturerOpen
            ? 'chUp'
            : 'chDown'
            " />
        </button>

        <div v-if="isManufacturerOpen" class="filter-accordion-body">
          <label v-for="manufacturer in manufacturers" :key="manufacturer.id" class="filter-checkbox-label">
            <input v-model="activeManufacturers
              " type="checkbox" :value="manufacturer.id
                " @change="
                  emit('apply')
                  " />

            <span class="option-label">
              {{
                manufacturer.name
              }}
            </span>

            <span class="filter-count">
              ({{ manufacturer.count }})
            </span>
          </label>
        </div>
      </div>



      <!-- ================================================= -->
      <!-- FEATURES -->
      <!-- ================================================= -->

      <div v-for="
filter in visibleFilters
                " :key="filter.id" class="filter-accordion">
        <button type="button" class="filter-accordion-header" :class="{
          'is-active':
            isFeatureActive(
              filter
            ),
        }" @click="
          toggleFilter(
            filter.id
          )
          ">
          <span>
            {{ filter.name }}
          </span>

          <BaseIcon :name="isFilterOpen(
            filter.id
          )
            ? 'chUp'
            : 'chDown'
            " />
        </button>

        <div v-if="
          isFilterOpen(
            filter.id
          )
        " class="filter-accordion-body">

          <!-- SELECT / MULTISELECT / BOOLEAN -->

          <template v-if="
            filter.type ===
            'select' ||
            filter.type ===
            'multiselect' ||
            filter.type ===
            'boolean'
          ">
            <label v-for="
option in filter.values
                            " :key="String(
                              option.id
                            )
                              " class="filter-checkbox-label">
              <input v-model="activeFeatures[
                filter.id
              ]
                " type="checkbox" :value="String(
                  option.id
                )
                  " :disabled="option.id ===
                    null
                    " @change="
                      emit(
                        'apply'
                      )
                      " />

              <span class="option-label">
                {{
                  option.name ??
                  '-'
                }}
              </span>

              <span class="filter-count">
                ({{ option.count }})
              </span>
            </label>
          </template>

          <!-- INT / DECIMAL -->

          <template v-else-if="
            filter.type ===
            'int' ||
            filter.type ===
            'decimal'
          ">
            <div v-if="
              getFeatureRange(
                filter
              )
            " class="range_container">
              <div class="
                                    sliders_control
                                    d-flex
                                    align-items-center
                                ">
                <input type="range" :min="getFeatureRange(
                  filter
                )?.min
                  " :max="getFeatureRange(
                    filter
                  )?.max
                    " :step="filter.type ===
                      'decimal'
                      ? 0.01
                      : 1
                      " :value="getFeatureMin(
                        filter
                      )
                        " @input="
                          (e) =>
                            onFeatureMinSlider(
                              e,
                              filter
                            )
                        " />

                <input type="range" :min="getFeatureRange(
                  filter
                )?.min
                  " :max="getFeatureRange(
                    filter
                  )?.max
                    " :step="filter.type ===
                      'decimal'
                      ? 0.01
                      : 1
                      " :value="getFeatureMax(
                        filter
                      )
                        " :style="getFeatureSliderStyle(
                          filter
                        )
                          " @input="
                            (e) =>
                              onFeatureMaxSlider(
                                e,
                                filter
                              )
                          " />
              </div>

              <div class="
                                    form_control
                                    inputs_range_container
                                ">
                <div class="
                                        form_control_container
                                    ">
                  <input class="
                                            form_control_container__time__input
                                        " type="number" :min="getFeatureRange(
                                          filter
                                        )?.min
                                          " :max="getFeatureRange(
                                            filter
                                          )?.max
                                            " :step="filter.type ===
                                              'decimal'
                                              ? 0.01
                                              : 1
                                              " :value="getFeatureMin(
                                                filter
                                              )
                                                " @input="
                                                  (e) =>
                                                    onFeatureMinNumber(
                                                      (
                                                        e.target as HTMLInputElement
                                                      ).value,
                                                      filter
                                                    )
                                                " />
                </div>

                <div class="
                                        form_control_container
                                    ">
                  <input class="
                                            form_control_container__time__input
                                        " type="number" :min="getFeatureRange(
                                          filter
                                        )?.min
                                          " :max="getFeatureRange(
                                            filter
                                          )?.max
                                            " :step="filter.type ===
                                              'decimal'
                                              ? 0.01
                                              : 1
                                              " :value="getFeatureMax(
                                                filter
                                              )
                                                " @input="
                                                  (e) =>
                                                    onFeatureMaxNumber(
                                                      (
                                                        e.target as HTMLInputElement
                                                      ).value,
                                                      filter
                                                    )
                                                " />
                </div>
              </div>
            </div>

            <button type="button" class="btn-apply" @click="
              emit('apply')
              ">
              {{
                t(
                  'category.filters.apply'
                )
              }}
            </button>
          </template>
        </div>
      </div>

      <!-- ================================================= -->
      <!-- PRICE -->
      <!-- ================================================= -->

      <div v-if="priceRange" class="filter-accordion">
        <button type="button" class="filter-accordion-header" :class="{
          'is-active': isPriceActive,
        }" @click="togglePrice">
          <span>{{ t('category.filters.price') }}</span>
          <BaseIcon :name="isPriceOpen ? 'chUp' : 'chDown'" />
        </button>

        <div v-if="isPriceOpen" class="filter-accordion-body">
          <div class="range_container">
            <div class="sliders_control d-flex align-items-center">
              <input type="range" :min="priceRange.min" :max="priceRange.max" :value="localPriceMin"
                @input="onMinSliderInput" />
              <input type="range" :min="priceRange.min" :max="priceRange.max" :value="localPriceMax"
                :style="sliderTrackStyle" @input="onMaxSliderInput" />
            </div>

            <div class="form_control inputs_range_container">
              <div class="form_control_container">
                <input class="form_control_container__time__input" type="number" :min="priceRange.min"
                  :max="priceRange.max" :value="localPriceMin" :aria-label="t('category.filters.from')"
                  @input="onMinNumberInput(($event.target as HTMLInputElement).value)" />
              </div>
              <div class="form_control_container">
                <input class="form_control_container__time__input" type="number" :min="priceRange.min"
                  :max="priceRange.max" :value="localPriceMax" :aria-label="t('category.filters.to')"
                  @input="onMaxNumberInput(($event.target as HTMLInputElement).value)" />
              </div>
            </div>
          </div>

          <button type="button" class="btn-apply" @click="emit('apply')">
            {{ t('category.filters.apply') }}
          </button>
        </div>
      </div>

      <!-- ================================================= -->
      <!-- RATING -->
      <!-- ================================================= -->



    </div>
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
} from 'vue'

import {
  useCategoryFilters,
  type CategoryFiltersProps,
} from './CategoryFilers'

import BaseIcon from '@shared/ui/BaseIcon.vue'

import { useI18n } from 'vue-i18n'

const props =
  defineProps<CategoryFiltersProps>()

const emit = defineEmits<{
  apply: []
  reset: []
}>()

const priceMin =
  defineModel<number | null>(
    'priceMin',
    {
      default: null,
    }
  )

const priceMax =
  defineModel<number | null>(
    'priceMax',
    {
      default: null,
    }
  )

const activeManufacturers =
  defineModel<number[]>(
    'activeManufacturers',
    {
      default: () => [],
    }
  )

const activeCategories =
  defineModel<number[]>(
    'activeCategories',
    {
      default: () => [],
    }
  )

const activeAdditional = defineModel<string[]>(
  'activeAdditional',
  { default: () => [] },
)

const ratingMin =
  defineModel<number | null>(
    'ratingMin',
    {
      default: null,
    }
  )

const ratingMax =
  defineModel<number | null>(
    'ratingMax',
    {
      default: null,
    }
  )

const {
  t,
} = useI18n()

const searchQuery =
  ref('')

const isCategoriesOpen = ref(true)

const visibleCategories = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase()

  if (!query) {
    return props.categories ?? []
  }

  return (props.categories ?? []).filter(category =>
    category.name.toLocaleLowerCase().includes(query)
  )
})

const additionalFilterOptions = computed(() => [
  ...(props.shippingFilters ?? []),
  ...(props.additionalFilters ?? []),
])

const {
  isPriceOpen,
  isManufacturerOpen,
  isRatingOpen,

  toggleFilter,
  togglePrice,
  toggleManufacturer,
  toggleRating,

  isFilterOpen,
  isFeatureActive,

  localPriceMin,
  localPriceMax,
  sliderTrackStyle,

  onMinSliderInput,
  onMaxSliderInput,
  onMinNumberInput,
  onMaxNumberInput,

  getFeatureRange,
  getFeatureMin,
  getFeatureMax,
  getFeatureSliderStyle,

  onFeatureMinSlider,
  onFeatureMaxSlider,
  onFeatureMinNumber,
  onFeatureMaxNumber,
} = useCategoryFilters(
  props,
  priceMin,
  priceMax
)

/*
|--------------------------------------------------------------------------
| SEARCH FILTERS
|--------------------------------------------------------------------------
*/

const visibleFilters = computed(() => {
  const query =
    searchQuery.value
      .trim()
      .toLocaleLowerCase()

  if (!query) {
    return props.filters
  }

  return props.filters.filter(
    (filter) =>
      filter.name
        .toLocaleLowerCase()
        .includes(query)
  )
})

/*
|--------------------------------------------------------------------------
| PRICE ACTIVE
|--------------------------------------------------------------------------
*/

const isPriceActive =
  computed(() => {
    return (
      priceMin.value !== null ||
      priceMax.value !== null
    )
  })

/*
|--------------------------------------------------------------------------
| RATING
|--------------------------------------------------------------------------
*/

const ratingValues = computed(() => {
  if (!props.rating) {
    return []
  }

  const min =
    Math.ceil(
      props.rating.min
    )

  const max =
    Math.floor(
      props.rating.max
    )

  const values: number[] = []

  for (
    let value = max;
    value >= min;
    value--
  ) {
    values.push(value)
  }

  return values
})

const selectedRating =
  computed({
    get() {
      return (
        ratingMin.value
      )
    },

    set(value) {
      ratingMin.value =
        Number(value)
    },
  })
</script>

<style scoped>
@import '../../filters.css';
</style>