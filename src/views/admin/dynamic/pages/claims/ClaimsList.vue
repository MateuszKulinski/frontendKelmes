<template>
  <div class="list-view claims-admin-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
      <h1 class="h3 mb-0">{{ t("claims.title") }}</h1>
      <div class="btn-group" role="group" :aria-label="t('claims.title')">
        <button type="button" class="btn" :class="claimType === 1 ? 'btn-primary' : 'btn-outline-primary'"
          @click="claimType = 1">{{ t("claims.claims_tab") }}</button>
        <button type="button" class="btn" :class="claimType === 2 ? 'btn-primary' : 'btn-outline-primary'"
          @click="claimType = 2">{{ t("claims.returns_tab") }}</button>
      </div>
    </div>

    <div class="d-flex justify-content-end mb-3">
      <select v-model="statusId" class="form-select" :aria-label="t('claims.status')" style="max-width: 280px">
        <option :value="null">{{ t("claims.all_statuses") }}</option>
        <option v-for="status in statuses" :key="status.id" :value="status.id">{{ statusName(status) }}</option>
      </select>
    </div>

    <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
      :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

    <div class="table-wrapper">
      <div v-if="fetching && !loading" class="table-loading">{{ t("claims.loading") }}</div>
      <BaseTable :columns="columns" :data="claims" :loading="loading" rowKey="id">
        <template #cell-claim_status="{ row }">{{ statusName(row.claim_status) }}</template>
        <template #cell-action="{ row }">
          <button type="button" class="btn btn-outline-primary btn-sm" @click.stop="openClaim(row as ClaimSummary)">
            {{ t("claims.open_case") }}
          </button>
        </template>
      </BaseTable>
      <div v-if="!loading && claims.length === 0" class="text-center text-muted py-4">
        {{ t("claims.no_cases") }}
      </div>
    </div>

    <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
      :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BasePagination from "@shared/components/BasePagination/BasePagination.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import type { ClaimSummary } from "@/composables/types/claims";
import { useClaimsList } from "./ClaimsList";

const { t } = useI18n();
const { claims, statuses, claimType, statusId, loading, fetching, pagination, goToPage, openClaim, statusName } = useClaimsList();

const columns = computed(() => [
  { key: "id", label: t("claims.case_number") },
  { key: "document_number", label: t("claims.number"), formatter: (row: ClaimSummary) => row.document?.number ?? "" },
  { key: "unit", label: t("claims.contractor"), formatter: (row: ClaimSummary) => row.unit?.name ?? "" },
  { key: "user", label: t("claims.user"), formatter: (row: ClaimSummary) => row.user?.fullname || row.user?.name || "" },
  { key: "created_at", label: t("claims.date_add") },
  { key: "claim_status", label: t("claims.status") },
  { key: "action", label: "" },
]);
</script>

<style scoped>
.btn-group {
  gap: var(--gap-sm);
}
</style>