<template>
  <div class="list-view docs-view">
    <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
      :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

    <!-- aktywne filtry -->
    <ActiveFilters :filters="activeFilters" @remove="clearSingleFilter" @removeAll="resetFilters" />

    <div class="table-wrapper">
      <div v-if="fetching && !loading" class="table-loading">
        {{ t("common.loading") }}
      </div>

      <BaseTable :columns="columns" :data="docs" :loading="loading" rowKey="id" :currentPage="pagination.page"
        :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir" @sort="handleSort" @row-click="goToView">
        <!-- NAZWA -->
        <template #header-name>
          <div class="th-filter" @click.stop>
            <div class="th-label">{{ t("common.name") }}</div>
            <BaseInput v-model="search" size="sm" />
          </div>
        </template>

        <!-- NUMER -->
        <template #header-number>
          <div class="th-filter" @click.stop>
            <div class="th-label">{{ t("common.number") }}</div>
            <BaseInput v-model="filters.number" size="sm" />
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

        <!-- DO ZAPŁATY -->
        <template #header-outstanding_amount>
          <div class="th-filter" @click.stop>
            <div class="th-label">{{ t("common.outstanding") }}</div>
            <div class="range">
              <BaseInput v-model="filters.outstanding_from" size="sm" />
              <BaseInput v-model="filters.outstanding_to" size="sm" />
            </div>
          </div>
        </template>

        <!-- DATA -->
        <template #header-date_add>
          <div class="th-filter" @click.stop>
            <div class="th-label">{{ t("common.date_add") }}</div>
            <div class="range">
              <BaseInput v-model="filters.date_add_from" type="date" size="sm" />
              <BaseInput v-model="filters.date_add_to" type="date" size="sm" />
            </div>
          </div>
        </template>

        <!-- TERMIN -->
        <template #header-date_payment>
          <div class="th-filter" @click.stop>
            <div class="th-label">{{ t("common.date_payment") }}</div>
            <div class="range">
              <BaseInput v-model="filters.date_payment_from" type="date" size="sm" />
              <BaseInput v-model="filters.date_payment_to" type="date" size="sm" />
            </div>
          </div>
        </template>

        <!-- KONTRAHENT -->
        <template #header-unit>
          <div class="th-filter" @click.stop>
            <div class="th-label">{{ t("common.contractor") }}</div>
            <BaseInput v-model="filters.unit" size="sm" />
          </div>
        </template>

        <!-- TYP -->
        <template #header-document_type>
          <div class="th-filter" @click.stop>
            <div class="th-label">{{ t("docs.type") }}</div>
            <BaseSelect v-model="filters.document_type_id" :options="documentTypes" labelKey="name" valueKey="id"
              size="sm" />
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
import { useDocsList } from "./DocsList";
import { useRouter } from "vue-router";
import { useLangStore } from "@/core/stores/langStore";
import { watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { DocumentListItem } from "@/composables/types/document";
import { useNavigation } from "@/composables/useNavigation";

const { t } = useI18n();
const langStore = useLangStore();

const props = withDefaults(defineProps<{
  isAdmin?: boolean
}>(), {
  isAdmin: true
});

const {
  docs,
  loading,
  fetching,
  pagination,
  search,
  filters,
  documentTypes,
  goToPage,
  sortBy,
  sortDir,
  handleSort,
  resetFilters,
  activeFilters,
  clearSingleFilter,
  fetchDocs
} = useDocsList();

watch(
  () => langStore.current,
  async () => {
    await fetchDocs();
  }
);


const { goTo } = useNavigation();
const router = useRouter()

const goToView = (row: DocumentListItem) => {
  if (props.isAdmin) {
    router.push({ name: 'admin.doc', params: { id: row.id } });
  } else {
    goTo('document', { id: row.id });
  }
};

const columns = computed(() => [
  { key: "name", label: t("docs.name"), sortable: true },
  { key: "number", label: t("docs.number"), sortable: true },
  { key: "price", label: t("docs.price_net"), sortable: true },
  { key: "price_tax", label: t("docs.price_gross"), sortable: true },
  { key: "outstanding_amount", label: t("docs.outstanding"), sortable: true },
  { key: "date_add", label: t("docs.date_add"), sortable: true },
  { key: "date_payment", label: t("docs.date_payment"), sortable: true },
  { key: "unit", label: t("docs.contractor"), sortable: true },
  {
    key: "document_type",
    label: t("docs.type"),
    formatter: (row: DocumentListItem) =>
      row.document_type
        ? `${row.document_type.short_name} - ${row.document_type.name}`
        : "",
  },
]);
</script>