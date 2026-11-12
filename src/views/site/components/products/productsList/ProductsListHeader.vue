<template>
    <div class="products-list-header">
        <div class="products-toolbar">
            <div class="products-toolbar__summary">
                <p v-if="total !== undefined" class="products-total">
                    <i18n-t keypath="category.product_count" tag="span" scope="global">
                        <template #count><strong>{{ total }}</strong></template>
                    </i18n-t>
                </p>
                <ProductsViewToggle v-if="viewType !== undefined" :model-value="viewType"
                    @update:model-value="emit('update:viewType', $event)" />
                <button
                    ref="filterButton"
                    type="button"
                    class="mobile-filters-button"
                    :aria-expanded="filtersOpen"
                    @click="emit('openFilters')"
                >
                    <BaseIcon name="filter" />
                    {{ t('category.filters.show_filters') }}
                </button>
            </div>

            <div class="products-toolbar__settings">
              <div class="products-per-page">
                <label :for="perPageId" class="products-per-page-label">
                    {{ t('category.pagination.items_per_page') }}
                </label>

                <BaseSelect
                    :id="perPageId"
                    :model-value="perPage"
                    :options="perPageSelectOptions"
                    class="products-per-page-select"
                    :searchable="false"
                    @update:model-value="onPerPageChange"
                />
              </div>
              <div v-if="sort !== undefined" class="products-sort">
                <label :for="sortId" class="products-sort-label">{{ t('category.sort.label') }}</label>
                <BaseSelect
                    :id="sortId"
                    :model-value="sort"
                    :options="sortSelectOptions"
                    class="products-sort-select"
                    :searchable="false"
                    @update:model-value="onSortChange"
                />
              </div>
            </div>
        </div>

        <div v-if="activeFilterChips.length" class="active-filters-bar d-flex align-items-center">
            <span class="active-filters-label">
                {{ t('category.filters.active_filters') }}:
            </span>

            <div class="active-filters-chips d-flex align-items-center">
                <span v-for="chip in activeFilterChips" :key="chip.id" class="active-filter-chip">
                    {{ chip.label }}

                    <button
                        type="button"
                        class="active-filter-chip-remove"
                        :aria-label="t('category.filters.remove_filter', { filter: chip.label })"
                        @click="chip.remove()"
                    >
                        ×
                    </button>
                </span>
            </div>

            <button type="button" class="active-filters-remove-all" @click="emit('resetFilters')">
                {{ t('category.filters.remove_filters') }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import BaseSelect from '@/views/shared/ui/BaseSelect.vue'
import ProductsViewToggle from './ProductsViewToggle.vue'
import { productSortOptions, normalizeProductSort } from './productListOptions'
import type { ProductsViewType, ProductSort } from './productListOptions'
import './ProductsListHeader.css'

interface ActiveFilterChip {
    id: string
    label: string
    remove: () => void
}

const props = withDefaults(defineProps<{
    activeFilterChips: ActiveFilterChip[]
    filtersOpen: boolean
    perPage: number
    total?: number
    viewType?: ProductsViewType
    sort?: ProductSort
    perPageOptions?: number[]
}>(), {
    perPageOptions: () => [10, 20, 30, 50],
})

const emit = defineEmits<{
    openFilters: []
    resetFilters: []
    perPageChange: [value: number]
    'update:viewType': [value: ProductsViewType]
    sortChange: [value: ProductSort]
}>()

const { t } = useI18n()
const perPageId = useId()
const sortId = useId()
const filterButton = ref<HTMLButtonElement | null>(null)

const perPageSelectOptions = computed(() =>
    props.perPageOptions.map(value => ({ value, label: String(value) })),
)

const sortSelectOptions = computed(() =>
    productSortOptions.map(value => ({
        value,
        label: t(`category.sort.${value}`),
    })),
)

function focusFilterButton() {
    filterButton.value?.focus()
}

function onPerPageChange(value: string | number | null) {
    if (value !== null) {
        emit('perPageChange', Number(value))
    }
}

function onSortChange(value: string | number | null) {
    if (value !== null) {
        emit('sortChange', normalizeProductSort(value))
    }
}

defineExpose({ focusFilterButton })
</script>
