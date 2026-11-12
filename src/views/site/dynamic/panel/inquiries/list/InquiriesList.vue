<template>
    <div class="list-view inquiries-view">

        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

        <ActiveFilters :filters="activeFilters" @remove="clearSingleFilter" @removeAll="resetFilters" />

        <div class="table-wrapper">

            <div v-if="fetching && !loading" class="table-loading">
                {{ t("common.loading") }}
            </div>

            <BaseTable :columns="columns" :data="inquiries" :loading="loading" rowKey="id"
                :currentPage="pagination.page" :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir"
                @sort="handleSort">

                <!-- NAME -->
                <template #header-name>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("inquiry.name") }}
                        </div>

                        <BaseInput v-model="search" size="sm" />
                    </div>
                </template>

                <!-- UNIT -->
                <template #header-unit>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("common.contractor") }}
                        </div>

                        <BaseInput v-model="filters.unit" size="sm" />
                    </div>
                </template>

                <!-- USER -->
                <template #header-user>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("common.created_at") }}
                        </div>

                        <BaseInput v-model="filters.user" size="sm" />
                    </div>
                </template>

                <!-- STATUS -->
                <template #header-status>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("common.status") }}
                        </div>

                        <BaseSelect v-model="filters.status_id" :options="statuses" labelKey="name" valueKey="id"
                            size="sm" />
                    </div>
                </template>

                <!-- UNIT -->
                <template #cell-unit="{ row }">
                    {{ row.unit?.name }}
                </template>

                <!-- USER -->
                <template #cell-user="{ row }">
                    {{ row.user?.name }}
                </template>

                <!-- STATUS -->
                <template #cell-status="{ row }">
                    {{ row.status?.name }}
                </template>

                <!-- ACTIONS -->
                <template #cell-actions="{ row }">

                    <div class="actions-td">
                        <BaseButton type="submit" v-if="row.status?.is_edit" class="submit-btn"
                            @click.stop="goToEdit(row)">
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
import BaseSelect from "@shared/ui/BaseSelect.vue";
import ActiveFilters from "@shared/components/ActiveFilters/ActiveFilters.vue";
import BaseButton from "@shared/ui/BaseButton.vue";

import { useInquiryView } from "./InquiriesList";

import { useNavigation } from "@/composables/useNavigation";
import { useLangStore } from "@/core/stores/langStore";

import { watch, computed } from "vue";
import { useI18n } from "vue-i18n";

const { goTo } = useNavigation();

const { t } = useI18n();

const langStore = useLangStore();

watch(
    () => langStore.current,
    async () => {
        await fetchInquiries();
    }
);

const goToEdit = (row: Record<string, any>) => {
    goTo('inquiryEdit', { id: row.id });
};

const goToView = (row: Record<string, any>) => {
    goTo('inquiry', { id: row.id });
};

const {
    inquiries,
    statuses,

    loading,
    fetching,

    pagination,

    search,
    filters,

    goToPage,

    sortBy,
    sortDir,

    handleSort,

    activeFilters,

    clearSingleFilter,
    resetFilters,

    fetchInquiries
} = useInquiryView();

const columns = computed(() => [
    {
        key: "lp",
        label: t("common.no")
    },

    {
        key: "name",
        label: t("inquiry.name"),
        sortable: true
    },

    {
        key: "unit",
        label: t("common.contractor")
    },

    {
        key: "items_count",
        label: t("inquiry.products"),
        sortable: true
    },

    {
        key: "price",
        label: t("common.total_net"),
        sortable: true
    },

    {
        key: "price_tax",
        label: t("common.total_gross"),
        sortable: true
    },

    {
        key: "user",
        label: t("common.created_by")
    },

    {
        key: "status",
        label: t("common.status")
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
</script>