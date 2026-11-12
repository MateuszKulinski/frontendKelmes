<template>
    <div class="table-wrapper">
        <BaseTable :columns="columns" :data="items" :loading="loading">
            <template #cell-actions="{ row }">
                <div class="actions-td">
                    <BaseButton @click.stop="edit(row.id)">{{ t("common.edit") }}</BaseButton>
                    <BaseButton variant="secondary" @click.stop="remove(row.id)">{{ t("common.delete") }}</BaseButton>
                </div>
            </template>
        </BaseTable>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BaseButton from "@shared/ui/BaseButton.vue";

import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";
import { useModalStore } from "@/core/stores/modalStore";
import ConfirmDeleteModal from "@/views/modals/ConfirmDeleteModal.vue";

const { t } = useI18n();
const router = useRouter();
const ui = useUiStore();
const modal = useModalStore();

const emit = defineEmits<{
    (e: "refresh"): void;
}>();

const props = defineProps<{
    loading: boolean;
    items: {
        id: number;
        name: string;
    }[];
}>();

const columns = computed(() => [
    {
        key: "id",
        label: "ID",
    },
    {
        key: "name",
        label: t("newsletter.subject"),
    },
    {
        key: "actions",
        label: "",
    },
]);

const edit = (id: number) => {
    router.push({
        name: "admin.newsletterSubjects.edit",
        params: { id },
    });
};

const remove = (id: number) => {
    const subject = props.items.find((item) => item.id === id);
    modal.openModal(ConfirmDeleteModal, {
        title: t("common.delete"),
        message: t("newsletter.confirm_delete"),
        itemName: subject?.name,
        confirmText: t("common.delete"),
        cancelText: t("common.cancel"),
        loadingText: t("common.loading"),
        onConfirm: async () => {
            await api.delete(`/newsletter/${id}`);
            ui.showSuccess(t("newsletter.subject_deleted"));
            emit("refresh");
        },
        onError: (error: unknown) => {
            console.error("Delete newsletter subject failed", error);
            ui.showError(t("common.error_occurred"));
        },
    });
};
</script>