<template>
    <div class="list-view claims-documents-view">

        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div class="btn-group" role="group" :aria-label="t('claims.title')">
                <button type="button" class="btn" :class="claimType === 1 ? 'btn-primary' : 'btn-outline-primary'"
                    @click="setClaimType(1)">{{ t("claims.claims_tab") }}</button>
                <button type="button" class="btn" :class="claimType === 2 ? 'btn-primary' : 'btn-outline-primary'"
                    @click="setClaimType(2)">{{ t("claims.returns_tab") }}</button>
            </div>
            <!-- </div>

        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3"> -->
            <div class="btn-group" role="group" :aria-label="t('claims.title')">
                <button type="button" class="btn" :class="!isCreating ? 'btn-secondary' : 'btn-outline-secondary'"
                    @click="setMode('list')">{{ t("claims.my_cases") }}</button>
                <button type="button" class="btn" :class="isCreating ? 'btn-secondary' : 'btn-outline-secondary'"
                    @click="setMode('new')">{{ t("claims.new_case") }}</button>
            </div>
            <!-- <h4 v-if="isCreating" class="mb-0">{{ t(titleKey) }}</h4> -->
        </div>

        <template v-if="!isCreating">
            <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
                :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

            <div class="table-wrapper">

                <div v-if="fetching && !loading" class="table-loading">
                    {{ t("claims.loading") }}
                </div>

                <BaseTable :columns="claimColumns" :data="claims" :loading="loading" rowKey="id">
                    <template #cell-claim_status="{ row }">
                        {{ row.claim_status?.langs?.[0]?.pivot?.name ?? row.claim_status?.code }}
                    </template>
                    <template #cell-action="{ row }">
                        <button type="button" class="btn btn-outline-primary btn-sm"
                            @click.stop="openClaim(row as ClaimSummary)">{{ t("claims.open_case") }}</button>
                    </template>
                </BaseTable>
            </div>
            <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
                :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />
        </template>

        <template v-else>
            <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
                :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

            <div class="table-wrapper">
                <div v-if="fetching && !loading" class="table-loading">
                    {{ t("claims.loading") }}
                </div>
                <BaseTable :columns="columns" :data="documents" :loading="loading" rowKey="id">

                    <template #header-name>
                        <div class="th-filter" @click.stop>
                            <div class="th-label">
                                {{ t("claims.document") }}
                            </div>

                            <BaseInput v-model="search" size="sm" :placeholder="t('claims.search_document')" />
                        </div>
                    </template>

                    <template #cell-action="{ row }">
                        <button type="button" class="btn btn-primary btn-sm"
                            @click.stop="openDocument(row as ClaimDocumentListItem)">
                            {{ t(actionKey) }}
                        </button>
                    </template>

                </BaseTable>
            </div>

            <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
                :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />
        </template>

    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@shared/components/BasePagination/BasePagination.vue";

import {
    useClaimsDocuments,
} from "./ClaimsDocumentsList";

import type { ClaimDocumentListItem, ClaimSummary } from "@/composables/types/claims";

const { t } = useI18n();
const router = useRouter();

const {
    documents,
    claims,
    loading,
    fetching,
    search,
    pagination,
    claimType,
    isCreating,
    // titleKey,
    actionKey,
    setMode,
    setClaimType,
    goToPage,
} = useClaimsDocuments();

const columns = computed(() => [
    {
        key: "name",
        label: t("claims.document"),
        sortable: true,
    },

    {
        key: "number",
        label: t("claims.number"),
        sortable: true,
    },

    {
        key: "date_add",
        label: t("claims.date_add"),
        sortable: true,
    },

    {
        key: "unit",
        label: t("claims.contractor"),
        formatter: (row: ClaimDocumentListItem) =>
            row.unit?.name ?? "",
    },

    {
        key: "price",
        label: t("claims.total_net"),
        sortable: true,
    },

    {
        key: "price_tax",
        label: t("claims.total_gross"),
        sortable: true,
    },

    {
        key: "action",
        label: "",
    },
]);

const claimColumns = computed(() => [
    { key: "id", label: t("claims.case_number") },
    {
        key: "document_number",
        label: t("claims.number"),
        formatter: (row: ClaimSummary) => row.document?.number ?? "",
    },
    { key: "created_at", label: t("claims.date_add") },
    { key: "claim_status", label: t("claims.status") },
    { key: "action", label: "" },
]);

const openDocument = (row: ClaimDocumentListItem) => {
    router.push({
        name: "panel.claims.document",
        params: {
            id: row.id,
        },
        query: {
            type: claimType.value,
        },
    });
};

const openClaim = (row: ClaimSummary) => router.push({
    name: "panel.claims.detail",
    params: { id: row.id },
});
</script>

<style scoped>
.claims-documents-view .btn-group {
    gap: var(--gap-sm);
}
</style>