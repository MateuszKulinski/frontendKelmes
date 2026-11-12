<template>
    <div class="list-view units-view">
        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

        <ActiveFilters :filters="activeFilters" @remove="clearSingleFilter" @removeAll="resetFilters" />

        <div class="table-wrapper">
            <div v-if="fetching && !loading" class="table-loading">
                {{ t("common.loading") }}
            </div>

            <BaseTable :columns="columns" :data="units" :loading="loading" rowKey="id" :currentPage="pagination.page"
                :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir" @sort="handleSort"
                @row-click="goToView">
                <!-- NUMBER -->
                <template #header-number>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("unit.number") }}</div>
                        <BaseInput v-model="filters.number" size="sm" />
                    </div>
                </template>

                <!-- NAME -->
                <template #header-name>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("unit.name") }}</div>
                        <BaseInput v-model="search" size="sm" />
                    </div>
                </template>

                <!-- STATUS -->
                <template #header-status>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("common.status") }}</div>

                        <BaseSelect v-model="filters.is_active" :options="[
                            { label: t('common.active'), value: 1 },
                            { label: t('common.inactive'), value: 0 }
                        ]" size="sm" />
                    </div>
                </template>

                <template #cell-status="{ row }">
                    {{ row.is_active ? t("common.active") : t("common.inactive") }}
                </template>

                <template #cell-actions="{ row }">
                    <BaseButton type="submit" class="submit-btn" @click.stop="goToEdit(row)">
                        {{ t("common.edit") }}
                    </BaseButton>
                </template>
            </BaseTable>
        </div>

        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />
    </div>
</template>

<script setup lang="ts">
// import "./UnitList.css";

import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@shared/components/BasePagination/BasePagination.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import ActiveFilters from "@shared/components/ActiveFilters/ActiveFilters.vue";

import { useLangStore } from "@/core/stores/langStore";
import { useUnitView } from "./UnitList";

import type { UnitListItem } from "@entities/unit";

const router = useRouter();

const { t } = useI18n();
const langStore = useLangStore();

const {
    units,
    loading,
    fetching,
    pagination,
    search,
    filters,
    sortBy,
    sortDir,
    goToPage,
    handleSort,
    activeFilters,
    clearSingleFilter,
    resetFilters,
    fetchUnits,
} = useUnitView();

watch(
    () => langStore.current,
    async () => {
        await fetchUnits();
    }
);

const goToEdit = (row: Record<string, any>) => {
    const unit = row as UnitListItem;

    router.push({
        name: "admin.units.edit",
        params: {
            id: unit.id,
        },
    });
};

const goToView = (row: UnitListItem) => {
    router.push({
        name: "admin.unit",
        params: {
            id: row.id,
        },
    });
};

const columns = computed(() => [
    {
        key: "lp",
        label: t("common.no"),
    },
    {
        key: "number",
        label: t("unit.number"),
        sortable: true,
    },
    {
        key: "name",
        label: t("unit.name"),
        sortable: true,
    },
    {
        key: "logistics_min",
        label: t("unit.logisticsMin"),
        sortable: true,
    },
    {
        key: "merchant_limit",
        label: t("unit.merchantLimit"),
        sortable: true,
    },
    {
        key: "receivables",
        label: t("unit.receivables"),
        sortable: true,
    },
    {
        key: "overdue_receivables",
        label: t("unit.overdueReceivables"),
        sortable: true,
    },
    {
        key: "status",
        label: t("common.status"),
    },
    {
        key: "actions",
        label: "",
    },
]);
</script>
