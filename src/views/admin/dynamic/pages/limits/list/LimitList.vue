<template>
    <div class="list-view limits-list">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <h1 class="h3 mb-0">{{ t("limits.title") }}</h1>
            <BaseButton type="button" @click="goToCreate">
                <BaseIcon name="plus" />
                {{ t("limits.add") }}
            </BaseButton>
        </div>

        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

        <ActiveFilters :filters="activeFilters" @remove="clearSingleFilter" @removeAll="resetFilters" />

        <div class="table-wrapper">
            <div v-if="fetching && !loading" class="table-loading">
                {{ t("common.loading") }}
            </div>

            <BaseTable :columns="columns" :data="limits" :loading="loading" rowKey="id" :currentPage="pagination.page"
                :perPage="pagination.per_page" @row-click="goToEdit">
                <template #header-name>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("limits.name") }}</div>
                        <BaseInput v-model="search" size="sm" />
                    </div>
                </template>

                <template #cell-limit_type="{ row }">
                    {{ limitTypeLabel(row.limit_type) }}
                </template>

                <template #cell-time_limit="{ row }">
                    {{ timeLimitLabel(row.time_limit) }}
                </template>

                <template #cell-price="{ row }">
                    {{ row.price ?? "—" }}
                </template>

                <template #cell-quantity="{ row }">
                    {{ row.quantity ?? "—" }}
                </template>

                <template #cell-actions="{ row }">
                    <BaseButton type="button" @click.stop="goToEdit(row)">
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
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseIcon from "@shared/ui/BaseIcon.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@shared/components/BasePagination/BasePagination.vue";
import ActiveFilters from "@shared/components/ActiveFilters/ActiveFilters.vue";

import { useLimitList, type LimitListItem } from "./LimitList";

const router = useRouter();
const { t } = useI18n();

const {
    limits,
    loading,
    fetching,
    search,
    pagination,
    activeFilters,
    goToPage,
    clearSingleFilter,
    resetFilters,
} = useLimitList();

const columns = computed(() => [
    { key: "lp", label: t("common.no") },
    { key: "name", label: t("limits.name"), sortable: false },
    { key: "limit_type", label: t("limits.type") },
    { key: "time_limit", label: t("limits.period") },
    { key: "quantity", label: t("limits.quantity") },
    { key: "price", label: t("limits.amount") },
    { key: "required_approvals", label: t("limits.required_approvals") },
    { key: "units_count", label: t("limits.units_count") },
    { key: "items_count", label: t("limits.positions_count") },
    { key: "actions", label: "" },
]);

const limitTypeLabel = (type: number) => t(
    ({
        1: "limits.type_quantity",
        2: "limits.type_financial",
        3: "limits.type_both",
        4: "limits.type_either",
    } as Record<number, string>)[type] ?? "limits.none"
);

const timeLimitLabel = (type: number) => t(
    ["", "limits.week", "limits.month", "limits.quarter", "limits.year", "limits.custom_period"][type]
        ?? "limits.none"
);

const goToEdit = (row: Record<string, any> | LimitListItem) => {
    const limit = row as LimitListItem;

    router.push({
        name: "admin.limits.edit",
        params: { id: limit.id },
    });
};

const goToCreate = () => {
    router.push({ name: "admin.limits.create" });
};
</script>
