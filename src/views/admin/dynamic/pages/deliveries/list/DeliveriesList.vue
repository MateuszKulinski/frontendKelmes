<template>
    <div class="list-view deliveries-view">

        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

        <ActiveFilters :filters="activeFilters" @remove="clearSingleFilter" @removeAll="resetFilters" />

        <div class="table-wrapper">

            <div v-if="fetching && !loading" class="table-loading">
                {{ t("common.loading") }}
            </div>

            <BaseTable :columns="columns" :data="deliveries" :loading="loading" rowKey="id"
                :currentPage="pagination.page" :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir"
                @sort="handleSort" :draggable="true" @reorder="reorderDeliveries">

                <!-- NAME -->
                <template #header-name>

                    <div class="th-filter" @click.stop>

                        <div class="th-label">
                            {{ t("common.name") }}
                        </div>

                        <BaseInput v-model="filters.name" size="sm" />

                    </div>

                </template>

                <!-- CODE -->
                <template #header-code>

                    <div class="th-filter" @click.stop>

                        <div class="th-label">
                            {{ t("delivery.code") }}
                        </div>

                        <BaseInput v-model="filters.code" size="sm" />

                    </div>

                </template>

                <!-- STATUS -->
                <template #header-is_active>

                    <div class="th-filter" @click.stop>

                        <div class="th-label">
                            {{ t("delivery.is_active") }}
                        </div>

                        <BaseSelect v-model="filters.is_active" :options="statusOptions" labelKey="label"
                            valueKey="value" size="sm" />

                    </div>

                </template>

                <template #cell-is_active="{ row }">

                    {{
                        row.is_active
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

    </div>
</template>

<script setup lang="ts">

import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@shared/components/BasePagination/BasePagination.vue";
import ActiveFilters from "@shared/components/ActiveFilters/ActiveFilters.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";
import BaseButton from "@shared/ui/BaseButton.vue";

import { useLangStore } from "@/core/stores/langStore";

import { useDeliveryMethodsList } from "./DeliveriesList";

import type { DeliveryMethodItem } from "@/composables/types/delivery";

const router = useRouter();

const langStore = useLangStore();

const { t } = useI18n();

const {
    deliveries,
    loading,
    fetching,
    pagination,
    filters,
    goToPage,
    sortBy,
    sortDir,
    handleSort,
    resetFilters,
    activeFilters,
    clearSingleFilter,
    fetchDeliveries,
    reorderDeliveries
} = useDeliveryMethodsList();

watch(
    () => langStore.current,
    async () => {
        await fetchDeliveries();
    }
);

const statusOptions = computed(() => [
    {
        value: 1,
        label: t("common.active")
    },
    {
        value: 0,
        label: t("common.inactive")
    },
]);

const columns = computed(() => [
    {
        key: "sort_order",
        label: t("delivery.sort_order"),
        sortable: true
    },
    {
        key: "name",
        label: t("delivery.name"),
        sortable: true
    },
    {
        key: "code",
        label: t("delivery.code"),
        sortable: true
    },
    {
        key: "is_active",
        label: t("delivery.is_active"),
        sortable: true
    },
    {
        key: "created_at",
        label: t("common.created_at"),
        sortable: true
    },
    {
        key: "actions",
        label: ""
    },
]);

const goToEdit = (row: Record<string, any>) => {

    const delivery = row as DeliveryMethodItem;

    router.push({
        name: "admin.delivery.edit",
        params: {
            id: delivery.id
        },
    });
};

const goToView = (row: Record<string, any>) => {

    const delivery = row as DeliveryMethodItem;

    router.push({
        name: "admin.delivery",
        params: {
            id: delivery.id
        },
    });
};

</script>