<template>
    <h1>{{ t('features.title') }}</h1>

    <div class="list-view features-view">
        <div class="mb-3 features-view__search">
            <BaseInput v-model="search" :placeholder="t('features.search')" />
        </div>

        <div class="table-wrapper">
            <div v-if="fetching && !loading" class="table-loading">
                {{ t('common.loading') }}
            </div>

            <BaseTable :columns="columns" :data="features" :loading="loading" rowKey="id" :draggable="true"
                @reorder="reorderFeatures">
                <!-- TYPE -->
                <template #cell-type="{ row }">
                    <BaseSelect :model-value="row.type" :options="featureTypeOptions" labelKey="label" valueKey="value"
                        size="sm" :disabled="row.updating"
                        @update:model-value="value => handleFeatureTypeUpdate(row, value)" />
                </template>

                <!-- FILTERABLE -->
                <template #cell-is_filterable="{ row }">
                    <BaseCheckbox :model-value="row.is_filterable" :disabled="row.updating"
                        @update:model-value="value => updateFeatureBoolean(row, 'is_filterable', value)" />
                </template>

                <!-- VISIBLE -->
                <template #cell-is_visible="{ row }">
                    <BaseCheckbox :model-value="row.is_visible" :disabled="row.updating"
                        @update:model-value="value => updateFeatureBoolean(row, 'is_visible', value)" />
                </template>

                <template #cell-is_exact_filter="{ row }">
                    <BaseCheckbox :model-value="row.is_exact_filter"
                        :disabled="row.updating || (row.type === 'range' && !row.is_exact_filter)"
                        @update:model-value="value => updateFeatureBoolean(row, 'is_exact_filter', value)" />
                </template>
            </BaseTable>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import BaseTable from '@shared/components/BaseTable/BaseTable.vue';
import BaseSelect from '@shared/ui/BaseSelect.vue';
import BaseInput from '@shared/ui/BaseInput.vue';
import BaseCheckbox from '@/views/shared/components/BaseCheckbox/BaseCheckbox.vue';

import {
    useFeaturesList,
    type FeatureItem,
} from './FeaturesList';

const { t } = useI18n();

const {
    features,
    search,
    loading,
    fetching,
    updateSetting,
    reorderFeatures,
} = useFeaturesList();

type FeatureType = FeatureItem['type'];

const featureTypeOptions = computed<
    { value: FeatureType; label: string }[]
>(() => [
    {
        value: 'select',
        label: t('features.types.select'),
    },
    {
        value: 'multiselect',
        label: t('features.types.multiselect'),
    },
    {
        value: 'range',
        label: t('features.types.range'),
    },
]);

const isFeatureType = (
    value: string | number | null
): value is FeatureType => {
    return (
        value === 'select' ||
        value === 'multiselect' ||
        value === 'range'
    );
};

const updateFeatureType = (
    row: Record<string, any>,
    value: FeatureType
) => {
    updateSetting(
        row as FeatureItem,
        'type',
        value
    );
};

const handleFeatureTypeUpdate = (
    row: Record<string, any>,
    value: string | number | null
) => {
    if (!isFeatureType(value)) {
        return;
    }

    updateFeatureType(row, value);
};

const updateFeatureBoolean = (
    row: Record<string, any>,
    field: 'is_visible' | 'is_filterable' | 'is_exact_filter',
    value: boolean
) => {
    updateSetting(
        row as FeatureItem,
        field,
        value
    );
};

const columns = computed(() => [
    {
        key: 'order',
        label: t('features.sort_order'),
        sortable: false,
    },
    {
        key: 'name',
        label: t('features.name'),
        sortable: false,
    },
    {
        key: 'type',
        label: t('features.type'),
        sortable: false,
    },
    {
        key: 'is_filterable',
        label: t('features.is_filterable'),
        sortable: false,
    },
    {
        key: 'is_visible',
        label: t('features.is_visible'),
        sortable: false,
    },
    {
        key: 'is_exact_filter',
        label: t('features.is_exact_filter'),
        sortable: false,
    },
]);
</script>

<style scoped>
.features-view__search {
    max-width: 420px;
}
</style>