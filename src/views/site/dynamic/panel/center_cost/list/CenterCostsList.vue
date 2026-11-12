<template>
    <div class="list-view center-costs-view">
        <div class="list-header">
            <h1>{{ t("center_cost.title") }}</h1>

            <BaseButton type="button" @click="goToCreate">
                {{ t("center_cost.add") }}
            </BaseButton>
        </div>

        <div class="table-wrapper">
            <BaseTable :columns="columns" :data="centerCosts" :loading="loading" rowKey="id">
                <template #cell-name="{ row }">
                    {{ row.name }}
                </template>

                <template #cell-actions="{ row }">
                    <div class="actions-td">
                        <BaseButton type="button" variant="secondary" @click.stop="goToEdit(row as CenterCost)">
                            {{ t("center_cost.edit") }}
                        </BaseButton>

                        <BaseButton type="button" variant="danger" @click.stop="confirmDelete(row as CenterCost)">
                            {{ t("center_cost.delete") }}
                        </BaseButton>
                    </div>
                </template>
            </BaseTable>

            <div v-if="!loading && centerCosts.length === 0" class="empty-state">
                {{ t("center_cost.no_data") }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BaseButton from "@shared/ui/BaseButton.vue";

import { useNavigation } from "@/composables/useNavigation";
import { useModalStore } from "@/core/stores/modalStore";
import ConfirmDeleteModal from "@/views/modals/ConfirmDeleteModal.vue";

import {
    useCenterCostsList,
    type CenterCost,
} from "./CenterCostsList";

const { t } = useI18n();
const { goTo } = useNavigation();
const modal = useModalStore();

const {
    centerCosts,
    loading,
    deleteCenterCost,
} = useCenterCostsList();

const columns = computed(() => [
    {
        key: "name",
        label: t("center_cost.name"),
    },
    {
        key: "actions",
        label: "",
    },
]);

const goToCreate = () => {
    goTo("centerCostCreate");
};

const goToEdit = (row: CenterCost) => {
    goTo("centerCostEdit", {
        id: row.id,
    });
};

const confirmDelete = (row: CenterCost) => {
    modal.openModal(ConfirmDeleteModal, {
        title: t("center_cost.delete"),
        message: t("center_cost.delete_confirm"),
        itemName: row.name,
        confirmText: t("common.delete"),
        cancelText: t("common.cancel"),
        loadingText: t("common.loading"),
        onConfirm: () => deleteCenterCost(row.id),
    });
};
</script>