<template>
    <div class="list-view carts-view">
        <!-- PAGINATION TOP -->
        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

        <!-- ACTIVE FILTERS -->
        <ActiveFilters :filters="activeFilters" @remove="clearSingleFilter" @removeAll="resetFilters" />

        <div class="table-wrapper">
            <!-- LOADING OVERLAY -->
            <div v-if="fetching && !loading" class="table-loading">
                {{ t('common.loading') }}
            </div>

            <BaseTable :columns="columns" :data="carts" :loading="loading" rowKey="id" :currentPage="pagination.page"
                :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir" @sort="handleSort"
                @row-click="goToView">
                <!-- SEARCH / ID -->
                <template #header-id>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">ID</div>
                        <BaseInput v-model="search" size="sm" />
                    </div>
                </template>

                <!-- UNIT -->
                <template #header-unit>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t('common.contractor') }}</div>
                        <BaseInput v-model="filters.unit" size="sm" />
                    </div>
                </template>

                <!-- USER -->
                <template #header-user>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t('user.user') }}</div>
                        <BaseInput v-model="filters.user" size="sm" />
                    </div>
                </template>

                <!-- PAYMENT -->
                <template #header-payment_method>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t('cart.payment') }}</div>
                        <BaseSelect v-model="filters.payment_method_id" :options="paymentMethods" labelKey="name"
                            valueKey="id" size="sm" />
                    </div>
                </template>

                <!-- TRANSPORT -->
                <template #header-transport_method>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t('cart.transport') }}</div>
                        <BaseSelect v-model="filters.transport_method_id" :options="transportMethods" labelKey="name"
                            valueKey="id" size="sm" />
                    </div>
                </template>

                <!-- DATE -->
                <template #header-created_at>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t('common.created_at') }}</div>
                        <div class="range">
                            <BaseInput v-model="filters.date_from" type="date" size="sm" />
                            <BaseInput v-model="filters.date_to" type="date" size="sm" />
                        </div>
                    </div>
                </template>
            </BaseTable>
        </div>

        <!-- PAGINATION BOTTOM -->
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
import { useCartList } from "./CartsList";
import { watch, computed } from "vue";

import type { CartListItem } from "@entities/cart";
import { useRouter } from "vue-router";
import { useNavigation } from "@/composables/useNavigation";
const { goTo } = useNavigation();
const router = useRouter();
import { useI18n } from "vue-i18n";

const { t } = useI18n();


const props = withDefaults(defineProps<{
    isAdmin?: boolean
}>(), {
    isAdmin: true
});

const {
    carts,
    loading,
    fetching,
    pagination,
    search,
    filters,
    paymentMethods,
    transportMethods,
    goToPage,
    sortBy,
    sortDir,
    handleSort,
    activeFilters,
    clearSingleFilter,
    resetFilters,
    fetchCarts
} = useCartList();


import { useLangStore } from "@/core/stores/langStore";
const langStore = useLangStore();
watch(
    () => langStore.current,
    async () => {
        await fetchCarts();
    }
);


const columns = computed(() => [
    {
        key: "unit",
        label: t('common.contractor'),
        sortable: true,
    },
    {
        key: "user",
        label: t('user.user'),
        sortable: true,
    },
    {
        key: "payment_method",
        label: t('cart.payment'),
        formatter: (row: CartListItem) =>
            row.payment_method || "-"
    },
    {
        key: "transport_method",
        label: t('cart.transport'),
        formatter: (row: CartListItem) =>
            row.transport_method || "-"
    },
    {
        key: "created_at",
        label: t('common.created_at'),
        sortable: true
    }
]);



// const goToView = (row: CartListItem) => {
//     router.push({
//         name: "admin.cart",
//         params: { id: row.id },
//     });
// };

const goToView = (row: CartListItem) => {
    if (props.isAdmin) {
        router.push({ name: 'admin.cart', params: { id: row.id } });
    } else {
        goTo('cart', { id: row.id });
    }
};
</script>