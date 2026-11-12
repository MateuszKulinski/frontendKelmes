<template>
    <section v-if="
        categories.length > 0 ||
        manufacturers.length > 0 ||
        (props.shippingFilters?.length ?? 0) > 0 ||
        (props.additionalFilters?.length ?? 0) > 0 ||
        features.length > 0 ||
        (promotions?.length ?? 0) > 0 ||
        props.priceRange ||
        props.rating
    " class="filters-section">
        <div class="filters-header">
            <span class="filters-title">
                <BaseIcon name="filter" />
                {{ t('category.filters.all_filters') }}
            </span>

            <button v-if="hasActiveFilters" type="button" class="filters-reset-btn" @click="reset">
                {{ t('category.filters.reset') }}
            </button>
        </div>

        <div class="fliters-body">
            <div class="filters-search">
                <input v-model="searchQuery" type="text" class="filters-search-input"
                    :placeholder="t('category.filters.search')" />
            </div>

            <div v-if="additionalFilterOptions.length" class="filter-accordion">
                <div class="filter-accordion-body p-0">
                    <label v-for="filter in additionalFilterOptions" :key="filter.key"
                        class="filter-checkbox-label">
                        <input v-model="localActiveAdditional" type="checkbox" :value="filter.key"
                            @change="apply" />
                        <span class="option-label">
                            {{ t(`category.filters.additional_items.${filter.key}`) }}
                        </span>
                    </label>
                </div>
            </div>

            <!-- KATEGORIE -->
            <div v-if="visibleCategories.length > 0" class="filter-accordion">
                <button type="button" class="filter-accordion-header" :class="{
                    'is-active': localActiveCategories.length > 0,
                }" @click="toggleCategories">
                    <span>
                        {{ t('category.filters.category') }}
                    </span>

                    <BaseIcon :name="isCategoriesOpen ? 'chUp' : 'chDown'" />
                </button>

                <div v-if="isCategoriesOpen" class="filter-accordion-body">
                    <label v-for="category in visibleCategories" :key="category.id" class="filter-checkbox-label">
                        <input v-model="localActiveCategories" type="checkbox" :value="category.id" @change="apply" />

                        <span class="option-label">
                            {{ category.name }}
                        </span>

                        <span v-if="props.showCategoryCount ?? props.showCount" class="filter-count">
                            ({{ category.count }})
                        </span>
                    </label>
                </div>
            </div>

            <div v-if="props.rating" class="filter-accordion">
                <button type="button" class="filter-accordion-header" :class="{
                    'is-active': ratingMin !== null,
                }" @click="toggleRating">
                    <span>{{ t('category.filters.rating') }}</span>
                    <BaseIcon :name="isRatingOpen ? 'chUp' : 'chDown'" />
                </button>

                <div v-if="isRatingOpen" class="filter-accordion-body">
                    <label v-for="value in ratingValues" :key="value" class="filter-checkbox-label">
                        <input v-model="ratingMin" type="radio" name="search-rating" :value="value"
                            @change="apply" />
                        <span class="option-label">{{ value }}+</span>
                    </label>
                </div>
            </div>

            <!-- PRODUCENCI -->
            <div v-if="visibleManufacturers.length > 0" class="filter-accordion">
                <button type="button" class="filter-accordion-header" :class="{
                    'is-active': localActiveManufacturers.length > 0,
                }" @click="toggleManufacturer">
                    <span>
                        {{ t('category.filters.manufacturer') }}
                    </span>

                    <BaseIcon :name="isManufacturerOpen ? 'chUp' : 'chDown'" />
                </button>

                <div v-if="isManufacturerOpen" class="filter-accordion-body">
                    <label v-for="manufacturer in visibleManufacturers" :key="manufacturer.id"
                        class="filter-checkbox-label">
                        <input v-model="localActiveManufacturers" type="checkbox" :value="manufacturer.id"
                            @change="apply" />

                        <span class="option-label">
                            {{ manufacturer.name }}
                        </span>

                        <span v-if="props.showCount" class="filter-count">
                            ({{ manufacturer.count }})
                        </span>
                    </label>
                </div>
            </div>

            <!-- PROMOTIONS -->
            <div v-if="visiblePromotions.length > 0" class="filter-accordion">
                <button type="button" class="filter-accordion-header" :class="{
                    'is-active': localActivePromotions.length > 0,
                }" @click="togglePromotions">
                    <span>{{ t('promotions.promotion_filter') }}</span>

                    <BaseIcon :name="isPromotionsOpen ? 'chUp' : 'chDown'" />
                </button>

                <div v-if="isPromotionsOpen" class="filter-accordion-body">
                    <label v-for="promotion in visiblePromotions" :key="promotion.id"
                        class="filter-checkbox-label">
                        <input v-model="localActivePromotions" type="checkbox" :value="promotion.id"
                            @change="apply" />

                        <span class="option-label">
                            {{ promotion.name || `${t('promotions.id')} ${promotion.id}` }}
                        </span>

                        <span v-if="props.showCount" class="filter-count">
                            ({{ promotion.count }})
                        </span>
                    </label>
                </div>
            </div>

            <!-- CECHY -->
            <div v-for="group in visibleFeatureGroups" :key="group.category_id" class="search-feature-group">
                <div class="search-feature-category">
                    {{
                        group.category_name ||
                        categories.find(
                            category => category.id === group.category_id
                        )?.name ||
                        `Kategoria ${group.category_id}`
                    }}
                </div>


                <div v-for="feature in group.features" :key="`${group.category_id}:${feature.id}`"
                    class="filter-accordion">
                    <button type="button" class="filter-accordion-header" :class="{
                        'is-active': isFeatureActive(
                            group.category_id,
                            feature
                        ),
                    }" @click="
                        toggleFeature(
                            group.category_id,
                            feature.id
                        )
                        ">
                        <span>{{ feature.name || '-' }}</span>

                        <BaseIcon :name="isFeatureOpen(
                            group.category_id,
                            feature.id
                        )
                            ? 'chUp'
                            : 'chDown'
                            " />
                    </button>

                    <div v-if="
                        isFeatureOpen(
                            group.category_id,
                            feature.id
                        )
                    " class="filter-accordion-body">
                        <!-- SELECT / MULTISELECT / BOOLEAN -->
                        <template v-if="
                            feature.type === 'select' ||
                            feature.type === 'multiselect' ||
                            feature.type === 'boolean'
                        ">
                            <label v-for="option in feature.values ?? []" :key="String(option.id)"
                                class="filter-checkbox-label">
                                <input type="checkbox" :checked="(
                                    localActiveFeatures[
                                    group.category_id
                                    ]?.[feature.id] ?? []
                                ).includes(String(option.id))
                                    " :value="String(option.id)" :disabled="option.id === null" @change="
                                        onFeatureValueChange(
                                            group.category_id,
                                            feature.id,
                                            String(option.id),
                                            $event
                                        )
                                        " />

                                <span class="option-label">
                                    {{ option.name ?? '-' }}
                                </span>

                                <span v-if="props.showCount" class="filter-count">
                                    ({{ option.count }})
                                </span>
                            </label>
                        </template>

                        <!-- INT / DECIMAL -->
                        <template v-else-if="
                            feature.type === 'int' ||
                            feature.type === 'decimal'
                        ">
                            <div v-if="getRange(feature)" class="range_container">
                                <div class="sliders_control d-flex align-items-center">
                                    <input type="range" :min="getRange(feature)?.min" :max="getRange(feature)?.max"
                                        :step="feature.type === 'decimal'
                                            ? 0.01
                                            : 1
                                            " :value="getFeatureMin(
                                                group.category_id,
                                                feature
                                            )
                                                " @input="
                                                    setFeatureSlider(
                                                        group.category_id,
                                                        feature,
                                                        'min',
                                                        $event
                                                    )
                                                    " />

                                    <input type="range" :min="getRange(feature)?.min" :max="getRange(feature)?.max"
                                        :step="feature.type === 'decimal'
                                            ? 0.01
                                            : 1
                                            " :value="getFeatureMax(
                                                group.category_id,
                                                feature
                                            )
                                                " :style="getFeatureSliderStyle(
                                                    group.category_id,
                                                    feature
                                                )
                                                    " @input="
                                                        setFeatureSlider(
                                                            group.category_id,
                                                            feature,
                                                            'max',
                                                            $event
                                                        )
                                                        " />
                                </div>

                                <div class="form_control inputs_range_container">
                                    <div class="form_control_container">
                                        <input class="form_control_container__time__input" type="number"
                                            :min="getRange(feature)?.min" :max="getRange(feature)?.max" :step="feature.type === 'decimal'
                                                ? 0.01
                                                : 1
                                                " :value="getFeatureMin(
                                                    group.category_id,
                                                    feature
                                                )
                                                    " @input="
                                                        setFeatureBound(
                                                            group.category_id,
                                                            feature,
                                                            'min',
                                                            (
                                                                $event.target as HTMLInputElement
                                                            ).value
                                                        )
                                                        " />
                                    </div>

                                    <div class="form_control_container">
                                        <input class="form_control_container__time__input" type="number"
                                            :min="getRange(feature)?.min" :max="getRange(feature)?.max" :step="feature.type === 'decimal'
                                                ? 0.01
                                                : 1
                                                " :value="getFeatureMax(
                                                    group.category_id,
                                                    feature
                                                )
                                                    " @input="
                                                        setFeatureBound(
                                                            group.category_id,
                                                            feature,
                                                            'max',
                                                            (
                                                                $event.target as HTMLInputElement
                                                            ).value
                                                        )
                                                        " />
                                    </div>
                                </div>

                            </div>

                            <button type="button" class="btn-apply" @click="apply">
                                {{ t('category.filters.apply') }}
                            </button>
                        </template>
                    </div>
                </div>
            </div>

            <div v-if="props.priceRange" class="filter-accordion">
                <button type="button" class="filter-accordion-header" :class="{
                    'is-active': priceMin !== null || priceMax !== null,
                }" @click="togglePrice">
                    <span>{{ t('category.filters.price') }}</span>
                    <BaseIcon :name="isPriceOpen ? 'chUp' : 'chDown'" />
                </button>

                <div v-if="isPriceOpen" class="filter-accordion-body">
                    <div class="range_container">
                        <div class="sliders_control d-flex align-items-center">
                            <input type="range" :min="props.priceRange.min" :max="props.priceRange.max"
                                :value="localPriceMin" @input="setPriceSlider('min', $event)" />
                            <input type="range" :min="props.priceRange.min" :max="props.priceRange.max"
                                :value="localPriceMax" :style="priceSliderTrackStyle"
                                @input="setPriceSlider('max', $event)" />
                        </div>

                        <div class="form_control inputs_range_container">
                            <div class="form_control_container">
                                <input class="form_control_container__time__input" type="number"
                                    :min="props.priceRange.min" :max="props.priceRange.max"
                                    :value="localPriceMin" :aria-label="t('category.filters.from')"
                                    @input="setPriceBound('min', $event)" />
                            </div>
                            <div class="form_control_container">
                                <input class="form_control_container__time__input" type="number"
                                    :min="props.priceRange.min" :max="props.priceRange.max"
                                    :value="localPriceMax" :aria-label="t('category.filters.to')"
                                    @input="setPriceBound('max', $event)" />
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn-apply" @click="apply">
                        {{ t('category.filters.apply') }}
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, ref, watch, type CSSProperties } from 'vue'
import BaseIcon from '@shared/ui/BaseIcon.vue'
import { useI18n } from 'vue-i18n'

import {
    useSearchFilters,
    type SearchFiltersProps,
} from './SearchFilters'

const props = defineProps<SearchFiltersProps>()

const emit = defineEmits<{
    apply: []
    reset: []
    'update:activeCategories': [value: number[]]
    'update:activeManufacturers': [value: number[]]
    'update:activeFeatures': [
        value: Record<number, Record<number, string[]>>
    ]
    'update:activeRanges': [
        value: Record<string, number | null>
    ]
    'update:activeAdditional': [value: string[]]
    'update:activePromotions': [value: number[]]
}>()

const { t } = useI18n()

const localActiveCategories = ref<number[]>([
    ...props.activeCategories,
])

const localActiveManufacturers = ref<number[]>([
    ...props.activeManufacturers,
])

const localActivePromotions = ref<number[]>([
    ...(props.activePromotions ?? []),
])

const localActiveAdditional = ref<string[]>([
    ...(props.activeAdditional ?? []),
])
const priceMin = defineModel<number | null>('priceMin', { default: null })
const priceMax = defineModel<number | null>('priceMax', { default: null })
const ratingMin = defineModel<number | null>('ratingMin', { default: null })
const additionalFilterOptions = computed(() => [
    ...(props.shippingFilters ?? []),
    ...(props.additionalFilters ?? []),
])

function cloneFeatures(
    value: Record<number, Record<number, string[]>>,
): Record<number, Record<number, string[]>> {
    return Object.fromEntries(
        Object.entries(value).map(([categoryId, features]) => [
            categoryId,
            Object.fromEntries(
                Object.entries(features).map(([featureId, values]) => [
                    featureId,
                    [...values],
                ]),
            ),
        ]),
    )
}

const localActiveFeatures = ref(
    cloneFeatures(props.activeFeatures ?? {}),
)

const localActiveRanges = ref<Record<string, number | null>>({
    ...(props.activeRanges ?? {}),
})

watch(
    () => props.activeCategories,
    value => {
        localActiveCategories.value = [...value]
    },
    { deep: true },
)

watch(
    () => props.activeManufacturers,
    value => {
        localActiveManufacturers.value = [...value]
    },
    { deep: true },
)

watch(
    () => props.activePromotions,
    value => {
        localActivePromotions.value = [...(value ?? [])]
    },
    { deep: true },
)

watch(
    () => props.activeAdditional,
    value => {
        localActiveAdditional.value = [...(value ?? [])]
    },
    { deep: true },
)

watch(
    () => props.activeFeatures,
    value => {
        localActiveFeatures.value = cloneFeatures(value ?? {})
    },
    { deep: true },
)

watch(
    () => props.activeRanges,
    value => {
        localActiveRanges.value = { ...(value ?? {}) }
    },
    { deep: true },
)

const {
    searchQuery,

    isCategoriesOpen,
    isManufacturerOpen,
    isPromotionsOpen,
    isPriceOpen,
    isRatingOpen,

    toggleCategories,
    toggleManufacturer,
    togglePromotions,
    togglePrice,
    toggleRating,

    visibleCategories,
    visibleManufacturers,
    visiblePromotions,
    visibleFeatureGroups,

    toggleFeature,
    isFeatureOpen,
    isFeatureActive,
    toggleFeatureValue,

    getRange,
    getFeatureMin,
    getFeatureMax,
    getFeatureSliderStyle,
    setFeatureBound,
    setFeatureSlider,

    hasActiveFilters
} = useSearchFilters(
    props,
    localActiveCategories,
    localActiveManufacturers,
    localActiveFeatures,
    localActiveRanges,
)

const ratingValues = computed(() => {
    if (!props.rating) return []

    const min = Math.ceil(props.rating.min)
    const max = Math.floor(props.rating.max)

    return Array.from({ length: Math.max(0, max - min + 1) }, (_, index) =>
        max - index,
    )
})

const localPriceMin = computed(() => priceMin.value ?? props.priceRange?.min ?? 0)
const localPriceMax = computed(() => priceMax.value ?? props.priceRange?.max ?? 0)

const priceSliderTrackStyle = computed((): CSSProperties => {
    if (!props.priceRange) return {}

    const range = props.priceRange.max - props.priceRange.min
    if (range <= 0) return {}

    const left = ((localPriceMin.value - props.priceRange.min) / range) * 100
    const right = ((localPriceMax.value - props.priceRange.min) / range) * 100

    return {
        background: `linear-gradient(
            to right,
            #C6C6C6 ${left}%,
            var(--accent) ${left}%,
            var(--accent) ${right}%,
            #C6C6C6 ${right}%
        )`,
    }
})

function setPriceSlider(bound: 'min' | 'max', event: Event) {
    if (!props.priceRange) return

    const input = event.target as HTMLInputElement
    const value = Number(input.value)

    if (bound === 'min') {
        const clamped = Math.min(
            Math.max(value, props.priceRange.min),
            localPriceMax.value - 1,
        )
        priceMin.value = clamped
        input.value = String(clamped)
        return
    }

    const clamped = Math.max(
        Math.min(value, props.priceRange.max),
        localPriceMin.value + 1,
    )
    priceMax.value = clamped
    input.value = String(clamped)
}

function setPriceBound(bound: 'min' | 'max', event: Event) {
    const input = event.target as HTMLInputElement
    const value = input.value.trim()
    const range = props.priceRange
    const rawValue = value === '' ? null : Number(value)

    if (rawValue !== null && !Number.isFinite(rawValue)) return

    if (bound === 'min') {
        const max = priceMax.value ?? range?.max ?? rawValue
        priceMin.value = rawValue === null
            ? null
            : Math.min(Math.max(rawValue, range?.min ?? rawValue), max ?? rawValue)
    } else {
        const min = priceMin.value ?? range?.min ?? rawValue
        priceMax.value = rawValue === null
            ? null
            : Math.max(Math.min(rawValue, range?.max ?? rawValue), min ?? rawValue)
    }

}

function apply() {
    emit(
        'update:activeCategories',
        [...localActiveCategories.value],
    )

    emit(
        'update:activeManufacturers',
        [...localActiveManufacturers.value],
    )

    emit(
        'update:activeFeatures',
        cloneFeatures(localActiveFeatures.value),
    )

    emit(
        'update:activeRanges',
        { ...localActiveRanges.value },
    )

    emit('update:activePromotions', [...localActivePromotions.value])
    emit('update:activeAdditional', [...localActiveAdditional.value])
    emit('apply')
}

function onFeatureValueChange(
    categoryId: number,
    featureId: number,
    value: string,
    event: Event,
) {
    const checked = (event.target as HTMLInputElement).checked

    toggleFeatureValue(categoryId, featureId, value, checked)

    apply()
}

function reset() {
    localActiveCategories.value = []
    localActiveManufacturers.value = []
    localActivePromotions.value = []
    localActiveAdditional.value = []
    localActiveFeatures.value = {}
    localActiveRanges.value = {}
    priceMin.value = null
    priceMax.value = null
    ratingMin.value = null

    emit('update:activeCategories', [])
    emit('update:activeManufacturers', [])
    emit('update:activePromotions', [])
    emit('update:activeAdditional', [])
    emit('update:activeFeatures', {})
    emit('update:activeRanges', {})

    emit('reset')
}
</script>

<style scoped>
@import '../../filters.css';
</style>
