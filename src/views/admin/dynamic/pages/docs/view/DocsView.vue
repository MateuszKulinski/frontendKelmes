<template>

  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border"></div>
  </div>

  <template v-else-if="doc">

    <BigCard :title="doc.name">

      <template #actions>
        <span class="badge bg-secondary">
          {{ doc.document_type?.short_name }}
        </span>
      </template>

      <div class="row g-3">
        <Info :label="t('common.number', 'Numer')" :value="doc.number" />
        <Info :label="t('common.contractor', 'Jednostka')" :value="doc.unit" />

        <Info :label="t('common.total_net', 'Neto')" :value="doc.price" />
        <Info :label="t('common.total_gross', 'Bruto')" :value="doc.price_tax" />

        <Info :label="t('common.outstanding', 'Do zapłaty')" :value="doc.outstanding_amount" />

        <Info :label="t('common.date_add', 'Data dodania')" :value="doc.date_add" />
        <Info :label="t('common.date_payment', 'Termin płatności')" :value="doc.date_payment" />
      </div>

    </BigCard>

    <BigCard :title="t('docs.positions', 'Pozycje')" class="mt-3">
      <BaseTable :columns="columns" :data="doc.positions || []" :loading="loading">

        <template #cell-name="{ row }">
          <a v-if="row.product?.url" :href="resolve(row.product.url)" target="_blank" rel="noopener noreferrer"
            class="text-primary text-decoration-none" @click.stop>
            {{ row.product.name }}
          </a>

          <span v-else>
            {{ row.name }}
          </span>
        </template>
        <template #cell-indeks="{ row }">
          <a v-if="row.product?.url" :href="resolve(row.product.url)" target="_blank" rel="noopener noreferrer"
            class="text-primary text-decoration-none" @click.stop>
            {{ row.product.indeks }}
          </a>

          <span v-else>
            {{ row.indeks }}
          </span>
        </template>

      </BaseTable>
    </BigCard>

  </template>

  <div v-else class="alert alert-warning">
    {{ t('docs.not_found') }}
  </div>

</template>

<script setup lang="ts">
import { useDoc } from "./DocsView";
import Info from "@shared/ui/Info.vue";
import BigCard from "@shared/components/BigCard.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import { useI18n } from "vue-i18n";
import { watch, computed } from "vue";
import { useUrlResolver } from "@/composables/useUrlResolver";
const { t } = useI18n();
import type { DocumentPosition } from "@entities/document";
import { useLangStore } from "@/core/stores/langStore";
const langStore = useLangStore();

const { resolve } = useUrlResolver();


const { doc, loading, fetchDoc } = useDoc();

const columns = computed(() => [
  { key: 'lp' },

  {
    key: 'name', label: t('products.details.name'),
    sortable: true,

  },
  {
    key: 'indeks', label: t('products.details.indeks'),
    sortable: true,

  },

  {
    key: 'quantity',
    label: t('common.quantity'),
    sortable: true,
    formatter: (row: DocumentPosition) => {
      const unit = row.product?.unit?.name ?? '';
      return `${row.quantity} ${unit}`;
    }
  },

  {
    key: 'price',
    label: t('products.details.price_net'),
    sortable: true,
  },

  {
    key: 'price_tax',
    label: t('products.details.price_gross'),
    sortable: true,
  },

  {
    key: 'total_amount',
    label: t('common.total_net'),
    sortable: true,
  },

  {
    key: 'total_amount_tax',
    label: t('common.total_gross'),
    sortable: true,
  },
]);


watch(
  () => langStore.current,
  async () => {
    await fetchDoc();
  }
);

</script>