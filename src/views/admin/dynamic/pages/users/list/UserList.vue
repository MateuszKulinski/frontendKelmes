<template>
  <div class="list-view users-view">
    <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
      :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

    <ActiveFilters :filters="activeFilters" @remove="clearSingleFilter" @removeAll="resetFilters" />

    <div class="table-wrapper">
      <div v-if="fetching && !loading" class="table-loading">
        {{ t("common.loading") }}
      </div>

      <BaseTable :columns="columns" :data="users" :loading="loading" rowKey="id" :currentPage="pagination.page"
        :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir" @sort="handleSort" @row-click="goToView">
        <!-- LOGIN -->
        <template #header-name>
          <div class="th-filter" @click.stop>
            <div class="th-label">{{ t("user.login") }}</div>
            <BaseInput v-model="search" size="sm" />
          </div>
        </template>

        <template #header-email>
          <div class="th-filter" @click.stop>
            <div class="th-label">{{ t("user.email") }}</div>
            <BaseInput v-model="filters.email" size="sm" />
          </div>
        </template>

        <template #header-firstname>
          <div class="th-filter" @click.stop>
            <div class="th-label">{{ t("user.firstname") }}</div>
            <BaseInput v-model="filters.firstname" size="sm" />
          </div>
        </template>

        <template #header-lastname>
          <div class="th-filter" @click.stop>
            <div class="th-label">{{ t("user.lastname") }}</div>
            <BaseInput v-model="filters.lastname" size="sm" />
          </div>
        </template>

        <template #header-unit>
          <div class="th-filter" @click.stop>
            <div class="th-label">{{ t("user.unit") }}</div>
            <BaseInput v-model="filters.unit" size="sm" />
          </div>
        </template>

        <template #header-permission>
          <div class="th-filter" @click.stop>
            <div class="th-label">{{ t("user.role") }}</div>
            <BaseSelect v-model="filters.permission_id" :options="permissions" labelKey="display_name" valueKey="id"
              size="sm" />
          </div>
        </template>

        <template #header-status>
          <div class="th-filter" @click.stop>
            <div class="th-label">{{ t("user.status") }}</div>
            <BaseSelect v-model="filters.is_active" :options="[
              { label: t('common.active'), value: 1 },
              { label: t('common.inactive'), value: 0 }
            ]" size="sm" />
          </div>
        </template>

        <template #cell-unit="{ row }">
          {{ row.unit?.name }}
        </template>

        <template #cell-permission="{ row }">
          {{ row.permission?.display_name }}
        </template>

        <template #cell-status="{ row }">
          {{ row.is_active ? t('common.active') : t('common.inactive') }}
        </template>

        <template #cell-actions="{ row }">

          <BaseButton type="submit" class="submit-btn" @click.stop="goToEdit(row)">
            {{ t('common.edit') }}
          </BaseButton>
        </template>

      </BaseTable>
    </div>

    <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
      :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />
  </div>
</template>

<script setup lang="ts">
import "./UserList.css";
import BaseInput from "@shared/ui/BaseInput.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@shared/components/BasePagination/BasePagination.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";
import ActiveFilters from "@shared/components/ActiveFilters/ActiveFilters.vue";
import BaseButton from "@shared/ui/BaseButton.vue";

import { useUserView } from "./UserList";
import { useRouter } from "vue-router";
import { useLangStore } from "@/core/stores/langStore";
import { watch, computed } from "vue";
import { useI18n } from "vue-i18n";

import type {
  UserListItem
} from "@entities/user";

const router = useRouter();

const { t } = useI18n();
const langStore = useLangStore();

watch(
  () => langStore.current,
  async () => {
    await fetchUsers();
  }
);


const goToEdit = (row: Record<string, any>) => {
  const user = row as UserListItem;

  router.push({
    name: "admin.users.edit",
    params: { id: user.id },
  });
};

const goToView = (row: UserListItem) => {
  router.push({
    name: "admin.user",
    params: { id: row.id },
  });
};

const {
  users,
  permissions,
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
  fetchUsers
} = useUserView();

const columns = computed(() => [
  { key: "lp", label: t("common.no") },
  { key: "name", label: t("user.login"), sortable: true },
  { key: "email", label: t("user.email"), sortable: true },
  { key: "firstname", label: t("user.firstname"), sortable: true },
  { key: "lastname", label: t("user.lastname"), sortable: true },
  { key: "unit", label: t("user.unit") },
  { key: "permission", label: t("user.role") },
  { key: "status", label: t("user.status") },
  { key: "actions", label: "" },
]);
</script>