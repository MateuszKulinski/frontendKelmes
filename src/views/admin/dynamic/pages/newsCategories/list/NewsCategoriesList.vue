<template>
    <ActiveFilters :filters="activeFilters" @remove="clearSingleFilter" @removeAll="resetFilters" />

    <div class="table-wrapper">
        <div v-if="fetching && !loading" class="table-loading">
            {{ t("common.loading") }}
        </div>
        <BaseTable :columns="columns" :data="categories" :loading="loading" rowKey="id" :currentPage="pagination.page"
            :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir" @sort="handleSort">
            <template #header-title>
                <div class="th-filter" @click.stop>
                    <div class="th-label">
                        {{ t("common.name") }}
                    </div>

                    <BaseInput v-model="search" size="sm" />
                </div>
            </template>

            <template #header-status>
                <div class="th-filter" @click.stop>
                    <div class="th-label">{{ t('common.status') }}</div>
                    <BaseSelect v-model="filters.is_active" :options="statusOptions" labelKey="label" valueKey="value"
                        size="sm" />
                </div>
            </template>

            <template #cell-status="{ row }">
                {{ row.is_active
                    ? t("common.active")
                    : t("common.inactive")
                }}
            </template>
            <template #cell-actions="{ row }">

                <div class="actions-td">

                    <BaseButton type="submit" class="submit-btn" @click.stop="goToEdit(row)">
                        {{ t("common.edit") }}
                    </BaseButton>

                    <BaseButton type="submit" variant="secondary" @click.stop="goToView(row)">
                        {{ t("common.preview") }}
                    </BaseButton>

                </div>

            </template>
        </BaseTable>
    </div>

    <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
        :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";

import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@shared/components/BasePagination/BasePagination.vue";
import ActiveFilters from "@shared/components/ActiveFilters/ActiveFilters.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";

import BaseInput from '@shared/ui/BaseInput.vue';
import BaseButton from "@shared/ui/BaseButton.vue";


import { useNewsCategoriesView } from "./NewsCategoriesList";

const { t } = useI18n();

const statusOptions = [
    { label: t('common.all'), value: '' },
    { label: t('common.active'), value: '1' },
    { label: t('common.inactive'), value: '0' },
];


const columns = computed(() => [
    {
        key: "title",
        label: t("common.name"),
        sortable: true,
    },
    {
        key: "slug",
        label: t("news.slug"),
        sortable: true,
    },
    {
        key: "status",
        label: t("common.status"),
        sortable: true,
    },
    {
        key: "actions",
        label: "",
    },
]);

const {
    categories,
    loading,
    fetching,
    pagination,
    search,
    filters,
    sortBy,
    sortDir,
    handleSort,
    goToPage,
    activeFilters,
    clearSingleFilter,
    resetFilters,
    goToEdit,
    goToView
} = useNewsCategoriesView();
</script>

<style scoped></style>