<template>
    <div class="list-view offer-companies-view">

        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

        <ActiveFilters :filters="activeFilters" @remove="clearSingleFilter" @removeAll="resetFilters" />

        <div class="table-wrapper">

            <div v-if="fetching && !loading" class="table-loading">
                {{ t("common.loading") }}
            </div>

            <BaseTable :columns="columns" :data="companies" :loading="loading" rowKey="id"
                :currentPage="pagination.page" :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir"
                @sort="handleSort">

                <!-- NAME -->
                <template #header-name>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("offer.company_name") }}
                        </div>

                        <BaseInput v-model="search" size="sm" />
                    </div>
                </template>

                <!-- CITY -->
                <template #header-city>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("offer.city") }}
                        </div>

                        <BaseInput v-model="filters.city" size="sm" />
                    </div>
                </template>

                <!-- AUTHORIZED PERSON -->
                <template #header-authorized_person>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("offer.authorized_person") }}
                        </div>

                        <BaseInput v-model="filters.authorized_person" size="sm" />
                    </div>
                </template>

                <!-- CREATED BY -->
                <template #header-created_by>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("common.created_by") }}
                        </div>

                        <BaseInput v-model="filters.created_by" size="sm" />
                    </div>
                </template>

                <!-- CREATED BY -->
                <template #cell-created_by="{ row }">
                    {{ row.created_by?.fullname ?? "-" }}
                </template>

                <!-- ACTIONS -->
                <template #cell-actions="{ row }">
                    <div class="actions-td">

                        <BaseButton type="submit" @click.stop="goToEdit(row)">
                            {{ t("common.edit") }}
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
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@shared/components/BasePagination/BasePagination.vue";
import ActiveFilters from "@shared/components/ActiveFilters/ActiveFilters.vue";

import { useNavigation } from "@/composables/useNavigation";
import { useLangStore } from "@/core/stores/langStore";

import { useOfferCompaniesList } from "./OfferCompaniesList";

const { t } = useI18n();

const { goTo } = useNavigation();

const langStore = useLangStore();

const {
    companies,

    loading,
    fetching,

    pagination,

    search,
    filters,

    sortBy,
    sortDir,

    activeFilters,

    goToPage,
    handleSort,

    clearSingleFilter,
    resetFilters,

    fetchCompanies,
} = useOfferCompaniesList();

watch(
    () => langStore.current,
    async () => {
        await fetchCompanies();
    }
);

const goToEdit = (row: Record<string, any>) => {
    goTo("offerCompanyEdit", {
        id: row.id,
    });
};

const goToView = (row: Record<string, any>) => {
    console.log(row.id);
    goTo('offerCompany', { id: row.id });
};

const columns = computed(() => [
    {
        key: "lp",
        label: t("common.no"),
    },
    {
        key: "name",
        label: t("offer.company_name"),
        sortable: true,
    },
    {
        key: "city",
        label: t("offer.city"),
        sortable: true,
    },
    {
        key: "address",
        label: t("offer.address"),
    },
    {
        key: "authorized_person",
        label: t("offer.authorized_person"),
        sortable: true,
    },
    {
        key: "created_by",
        label: t("common.created_by"),
    },
    {
        key: "actions",
        label: "",
    },
]);
</script>