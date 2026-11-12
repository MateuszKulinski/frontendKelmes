<template>
    <div class="list-view payments-view">
        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

        <ActiveFilters :filters="activeFilters" @remove="clearSingleFilter" @removeAll="resetFilters" />

        <div class="table-wrapper">
            <div v-if="fetching && !loading" class="table-loading">
                {{ t("common.loading") }}
            </div>

            <BaseTable :columns="columns" :data="payments" :loading="loading" rowKey="id" :currentPage="pagination.page"
                :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir" @sort="handleSort" :draggable="true"
                @reorder="reorderPayments">
                <!-- NAME -->
                <template #header-name>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("common.name") }}</div>
                        <BaseInput v-model="filters.name" size="sm" />
                    </div>
                </template>

                <!-- CODE -->
                <template #header-code>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("payment.code") }}</div>
                        <BaseInput v-model="filters.code" size="sm" />
                    </div>
                </template>

                <!-- STATUS -->
                <template #header-is_active>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("payment.is_active") }}</div>
                        <BaseSelect v-model="filters.is_active" :options="statusOptions" labelKey="label"
                            valueKey="value" size="sm" />
                    </div>
                </template>

                <template #cell-is_active="{ row }">
                    {{ row.is_active ? t("common.active") : t("common.inactive") }}
                </template>

                <template #cell-actions="{ row }">

                    <div class="actions-td">
                        <BaseButton type="submit" class="submit-btn" @click.stop="goToEdit(row)">
                            {{ t('common.edit') }}
                        </BaseButton>
                        <BaseButton type="submit" variant="secondary" @click.stop="goToView(row)">
                            {{ t('common.preview') }}
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
import BaseInput from "@shared/ui/BaseInput.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@shared/components/BasePagination/BasePagination.vue";
import ActiveFilters from "@shared/components/ActiveFilters/ActiveFilters.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";
import BaseButton from "@shared/ui/BaseButton.vue";

import { useLangStore } from "@/core/stores/langStore";
import { useRouter } from "vue-router";

import { usePaymentMethodsList } from "./PaymentsList";
import { watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { PaymentMethodItem } from "@/composables/types/payment";
const langStore = useLangStore();
const router = useRouter();


watch(
    () => langStore.current,
    async () => {
        await fetchPayments();
    }
);


const { t } = useI18n();

const {
    payments,
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
    fetchPayments,
    reorderPayments
} = usePaymentMethodsList();

const statusOptions = computed(() => [
    { value: 1, label: t("common.active") },
    { value: 0, label: t("common.inactive") },
]);

const columns = computed(() => [
    { key: "sort_order", label: t("common.sort_order"), sortable: true },
    { key: "name", label: t("payment.name"), sortable: true },
    { key: "code", label: t("payment.code"), sortable: true },
    { key: "is_active", label: t("payment.is_active"), sortable: true },
    { key: "created_at", label: t("common.created_at"), sortable: true },
    { key: "commission_percent", label: t("common.commission"), sortable: true },
    { key: "actions", label: "" },
]);


const goToEdit = (row: Record<string, any>) => {
    const user = row as PaymentMethodItem;

    router.push({
        name: "admin.payment.edit",
        params: { id: user.id },
    });
};

const goToView = (row: Record<string, any>) => {
    const payment = row as PaymentMethodItem;

    router.push({
        name: "admin.payment",
        params: { id: payment.id },
    });
};
</script>