<template>
    <div class="list-view orders-view">
        <div class="d-flex justify-content-end mb-3">
            <BaseButton v-if="props.isAdmin" @click="router.push({ name: 'admin.order-statuses' })">
                {{ t("order.edit_statuses") }}
            </BaseButton>
        </div>

        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

        <!-- aktywne filtry -->
        <ActiveFilters :filters="activeFilters" @remove="clearSingleFilter" @removeAll="resetFilters" />

        <div class="table-wrapper">
            <div v-if="fetching && !loading" class="table-loading">
                {{ t("common.loading") }}
            </div>

            <BaseTable :columns="columns" :data="orders" :loading="loading" rowKey="id" :currentPage="pagination.page"
                :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir" @sort="handleSort"
                @row-click="goToView">

                <!-- UNIT -->
                <template #header-unit>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("common.name") }}</div>
                        <BaseInput v-model="filters.unit" size="sm" />
                    </div>
                </template>

                <!-- USER -->
                <template #header-user>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("user.user") }}</div>
                        <BaseInput v-model="filters.user" size="sm" />
                    </div>
                </template>

                <!-- STATUS -->
                <template #header-status>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("user.status") }}</div>
                        <BaseSelect v-model="filters.status_id" :options="orderStatuses" labelKey="name" valueKey="id"
                            size="sm" />
                    </div>
                </template>

                <!-- PAYMENT -->
                <template #header-payment_method>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("cart.payment") }}</div>
                        <BaseSelect v-model="filters.payment_method_id" :options="paymentMethods" labelKey="name"
                            valueKey="id" size="sm" />
                    </div>
                </template>

                <!-- TRANSPORT -->
                <template #header-transport_method>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("cart.transport") }}</div>
                        <BaseSelect v-model="filters.transport_method_id" :options="transportMethods" labelKey="name"
                            valueKey="id" size="sm" />
                    </div>
                </template>

                <!-- NETTO -->
                <template #header-price>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("common.total_net") }}</div>
                        <div class="range">
                            <BaseInput v-model="filters.price_from" size="sm" />
                            <BaseInput v-model="filters.price_to" size="sm" />
                        </div>
                    </div>
                </template>

                <!-- BRUTTO -->
                <template #header-price_tax>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("common.total_gross") }}</div>
                        <div class="range">
                            <BaseInput v-model="filters.price_tax_from" size="sm" />
                            <BaseInput v-model="filters.price_tax_to" size="sm" />
                        </div>
                    </div>
                </template>

                <!-- DATE -->
                <template #header-created_at>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t("common.date_add") }}</div>
                        <div class="range">
                            <BaseInput v-model="filters.date_from" type="date" size="sm" />
                            <BaseInput v-model="filters.date_to" type="date" size="sm" />
                        </div>
                    </div>
                </template>

            </BaseTable>
        </div>

        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />
    </div>
</template>

<script setup lang="ts">
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@shared/components/BasePagination/BasePagination.vue";
import ActiveFilters from "@shared/components/ActiveFilters/ActiveFilters.vue";
import BaseInput from "@shared/ui/BaseInput.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import { useOrderList } from "./OrdersList";
import { watch, computed } from "vue";
import type { OrderListItem } from "@entities/order";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { useNavigation } from "@/composables/useNavigation";
import { useLangStore } from "@/core/stores/langStore";
const { goTo } = useNavigation();
const langStore = useLangStore();

const router = useRouter();

const {
    orders,
    loading,
    fetching,
    pagination,
    // search,
    filters,
    paymentMethods,
    transportMethods,
    orderStatuses,
    goToPage,
    sortBy,
    sortDir,
    handleSort,
    activeFilters,
    clearSingleFilter,
    resetFilters,
    fetchOrders
} = useOrderList();


watch(
    () => langStore.current,
    async () => {
        await fetchOrders();
    }
);

const fallback = (v?: string) => v || "-";


const props = withDefaults(defineProps<{
    isAdmin?: boolean
}>(), {
    isAdmin: true
});

const columns = computed(() => [
    { key: "unit", label: t('cart.unit'), sortable: true },
    { key: "user", label: t('cart.user'), sortable: true },
    {
        key: "status",
        label: t("user.status"),
        formatter: (row: OrderListItem) => fallback(row.status)
    },
    { key: "price", label: t("docs.total_net"), sortable: true },
    { key: "price_tax", label: t("docs.total_gross"), sortable: true },
    {
        key: "payment_method",
        label: t("cart.payment"),
        formatter: (row: OrderListItem) => fallback(row.payment_method)
    },
    {
        key: "transport_method",
        label: t("cart.transport"),
        formatter: (row: OrderListItem) => fallback(row.transport_method)
    },
    { key: "created_at", label: t("docs.date"), sortable: true },
]);


const goToView = (row: OrderListItem) => {
    if (props.isAdmin) {
        router.push({ name: 'admin.order', params: { id: row.id } });
    } else {
        goTo('order', { id: row.id });
    }
};

</script>