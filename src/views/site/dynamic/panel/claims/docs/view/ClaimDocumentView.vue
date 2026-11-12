<template>

    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border"></div>
    </div>

    <template v-else-if="doc">

        <BigCard :title="doc.name || ''">

            <template #actions>
                <span class="badge bg-secondary">
                    {{ doc.document_type?.short_name }}
                </span>
            </template>

            <div class="row g-3">

                <Info :label="t('claims.number')" :value="doc.number" />

                <Info :label="t('claims.contractor')" :value="doc.unit?.name" />

                <Info :label="t('claims.total_net')" :value="doc.price" />

                <Info :label="t('claims.total_gross')" :value="doc.price_tax" />

                <Info :label="t('claims.date_add')" :value="doc.date_add" />

            </div>

        </BigCard>

        <BigCard :title="t('claims.positions')" class="mt-3">

            <BaseTable :columns="columns" :data="positions" :loading="loading">

                <template #cell-name="{ row }">
                    <a v-if="row.product?.url" :href="resolve(row.product.url)" target="_blank"
                        rel="noopener noreferrer" class="text-primary text-decoration-none" @click.stop>
                        {{ row.product.name }}
                    </a>

                    <span v-else>
                        {{ row.name }}
                    </span>
                </template>

                <template #cell-quantity="{ row }">

                    <div class="d-flex align-items-center gap-2">

                        <span>
                            {{ row.available_quantity }}
                            /
                            {{ row.quantity }}
                        </span>

                        <BaseInput v-model="row.form_quantity" type="number" min="0" :max="row.available_quantity"
                            size="sm" class="claim-quantity" />

                    </div>

                </template>

                <template #cell-files="{ row }">
                    <input type="file" multiple class="form-control form-control-sm"
                        @change="onPositionFiles(row as ClaimDocumentPosition, $event)" />
                </template>

                <template #cell-notes="{ row }">
                    <BaseInput v-model="row.form_notes" size="sm" :placeholder="t('claims.position_notes')" />
                </template>

            </BaseTable>

        </BigCard>

        <BigCard :title="t('claims.description')" class="mt-3">
            <textarea v-model="description" class="form-control" rows="4"
                :placeholder="t('claims.description_placeholder')" />
        </BigCard>

        <BigCard :title="t('claims.attachments')" class="mt-3">

            <input type="file" multiple class="form-control" @change="onDocumentFiles" />

        </BigCard>

        <div class="d-flex justify-content-end mt-3">

            <button type="button" class="btn btn-primary" :disabled="submitting || !hasItems" @click="confirmSubmit">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2" />

                {{ t(actionKey) }}
            </button>

        </div>

    </template>

    <div v-else class="alert alert-warning">
        {{ t("claims.document_not_found") }}
    </div>

</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BigCard from "@shared/components/BigCard.vue";
import Info from "@shared/ui/Info.vue";

import { useUrlResolver } from "@/composables/useUrlResolver";
import type { ClaimDocumentPosition } from "@/composables/types/claims";
import {
    useClaimDocument,
} from "./ClaimDocumentView";

const { t } = useI18n();

const { resolve } = useUrlResolver();

const {
    doc,
    positions,
    loading,
    submitting,
    description,
    hasItems,
    actionKey,
    confirmSubmit,
    onDocumentFiles,
    onPositionFiles,
} = useClaimDocument();

const columns = computed(() => [
    {
        key: "lp",
    },

    {
        key: "name",
        label: t("claims.product"),
    },

    {
        key: "indeks",
        label: t("claims.indeks"),
    },

    {
        key: "quantity",
        label: t("claims.quantity"),
    },

    {
        key: "price",
        label: t("claims.price_net"),
    },

    {
        key: "total_amount",
        label: t("claims.total_net"),
    },

    {
        key: "notes",
        label: t("claims.notes"),
    },

    {
        key: "files",
        label: t("claims.attachments"),
    },
]);
</script>