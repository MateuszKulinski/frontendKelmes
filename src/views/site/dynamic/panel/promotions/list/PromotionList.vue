<template>
    <div class="list-view promotions-view">
        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

        <ActiveFilters :filters="activeFilters" @remove="clearSingleFilter" @removeAll="resetFilters" />

        <div class="table-wrapper">
            <div v-if="fetching && !loading" class="table-loading">
                {{ t("common.loading") }}
            </div>

            <BaseTable :columns="columns" :data="promotions" :loading="loading" rowKey="id"
                :currentPage="pagination.page" :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir"
                @sort="handleSort" @row-click="goToView">
                <!-- ID -->
                <template #header-id>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">ID</div>
                        <BaseInput v-model="filters.id" size="sm" />
                    </div>
                </template>

                <!-- OPIS -->
                <template #header-description>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("common.description") }}</div>
                        <BaseInput v-model="search" size="sm" />
                    </div>
                </template>

                <!-- TYP -->
                <template #header-type>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("promotions.type") }}</div>
                        <BaseInput v-model="filters.type" size="sm" />
                    </div>
                </template>

                <!-- TYP WARTOŚCI -->
                <template #header-value_type>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("promotions.value_type") }}</div>
                        <BaseInput v-model="filters.value_type" size="sm" />
                    </div>
                </template>

                <!-- PROCENT -->
                <template #header-percentage>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("promotions.percentage") }}</div>

                        <div class="range">
                            <BaseInput v-model="filters.percentage_from" type="number" size="sm" />

                            <BaseInput v-model="filters.percentage_to" type="number" size="sm" />
                        </div>
                    </div>
                </template>

                <!-- ILOŚĆ OD -->
                <template #header-quantity_from>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("promotions.quantity_from") }}</div>
                        <BaseInput v-model="filters.quantity_from" type="number" size="sm" />
                    </div>
                </template>

                <!-- WARTOŚĆ OD -->
                <template #header-value_from>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("promotions.value_from") }}</div>
                        <BaseInput v-model="filters.value_from" size="sm" />
                    </div>
                </template>

                <!-- AKTYWNA -->
                <template #header-active>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("promotions.active") }}</div>

                        <BaseSelect v-model="filters.active" :options="activeOptions" labelKey="label" valueKey="value"
                            size="sm" />
                    </div>
                </template>
            </BaseTable>
        </div>

        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />
    </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@shared/components/BasePagination/BasePagination.vue";
import ActiveFilters from "@shared/components/ActiveFilters/ActiveFilters.vue";

import { usePromotionList } from "./PromotionList";
import { useLangStore } from "@/core/stores/langStore";

import type { PromotionListItem } from "@/composables/types/promotion";

const { t } = useI18n();
const router = useRouter();
const langStore = useLangStore();

const {
    promotions,
    loading,
    fetching,
    pagination,
    search,
    filters,
    activeOptions,
    activeFilters,
    sortBy,
    sortDir,
    goToPage,
    handleSort,
    resetFilters,
    clearSingleFilter,
    fetchPromotions,
} = usePromotionList();

watch(
    () => langStore.current,
    async () => {
        await fetchPromotions();
    }
);

const goToView = (row: PromotionListItem) => {
    router.push({
        name: "panel.promotion",
        params: {
            id: row.id,
        },
    });
};

const columns = computed(() => [
    {
        key: "description",
        label: t("common.description"),
        sortable: true,
    },
    {
        key: "type",
        label: t("promotions.type"),
        sortable: true,
    },
    {
        key: "value_type",
        label: t("promotions.value_type"),
        sortable: true,
        formatter: (row: PromotionListItem) =>
            row.value_type === "percentage"
                ? t("promotions.percentage")
                : row.value_type,
    },
    {
        key: "percentage",
        label: t("promotions.percentage"),
        sortable: true,
        formatter: (row: PromotionListItem) =>
            `${row.percentage ?? 0}%`,
    },
    {
        key: "quantity_from",
        label: t("promotions.quantity_from"),
        sortable: true,
    },
    {
        key: "value_from",
        label: t("promotions.value_from"),
        sortable: true,
    },
    {
        key: "active",
        label: t("promotions.active"),
        sortable: true,
        formatter: (row: PromotionListItem) =>
            row.active
                ? t("common._yes")
                : t("common._no"),
    },
]);
</script>