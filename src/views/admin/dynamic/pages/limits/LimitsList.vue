<template>
    <div class="list-view limits-view">
        <header class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <h1 class="h3 mb-0">{{ t("limits.title") }}</h1>
            <button type="button" class="btn btn-primary" @click="router.push({ name: 'admin.limits.create' })">
                {{ t("limits.add") }}
            </button>
        </header>

        <div class="mb-3 limits-view__search">
            <BaseInput v-model="search" :placeholder="t('limits.search')" />
        </div>

        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

        <div class="table-wrapper">
            <div v-if="fetching && !loading" class="table-loading">{{ t("common.loading") }}</div>
            <BaseTable :columns="columns" :data="limits" :loading="loading" rowKey="id">
                <template #cell-limit_type="{ row }">{{ limitTypeName(row.limit_type) }}</template>
                <template #cell-time_limit="{ row }">{{ timeLimitName(row.time_limit) }}</template>
                <template #cell-limit_items="{ row }">
                    <span>{{ row.limit_items?.length ?? 0 }}</span>
                    <span v-if="row.limit_items?.length" class="text-muted ms-1">{{row.limit_items.slice(0,
                        2).map((item: any) => item.name).join(", ")}}</span>
                </template>
                <template #cell-limit_users="{ row }">{{ row.limit_users?.length ?? 0 }}</template>
                <template #cell-actions="{ row }">
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-outline-primary btn-sm" @click.stop="edit(row.id)">{{
                            t("common.edit") }}</button>
                        <button type="button" class="btn btn-outline-danger btn-sm" :disabled="deletingId === row.id"
                            @click.stop="remove(row as LimitRow)">{{ t("limits.delete") }}</button>
                    </div>
                </template>
            </BaseTable>
            <div v-if="!loading && limits.length === 0" class="text-center text-muted py-4">{{ t("limits.no_data") }}
            </div>
        </div>

        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";
import { useModalStore } from "@/core/stores/modalStore";
import ConfirmDeleteModal from "@/views/modals/ConfirmDeleteModal.vue";
import BaseInput from "@shared/ui/BaseInput.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@shared/components/BasePagination/BasePagination.vue";

interface LimitRow {
    id: number;
    name: string;
    limit_type: number;
    time_limit: number;
    unit?: { name: string } | null;
    quantity: number | null;
    price: number | null;
    limit_items: Array<{ name: string }>;
    limit_users: Array<{ user_id: number }>;
}

const { t } = useI18n();
const router = useRouter();
const ui = useUiStore();
const modal = useModalStore();
const limits = ref<LimitRow[]>([]);
const search = ref("");
const loading = ref(true);
const fetching = ref(false);
const deletingId = ref<number | null>(null);
const pagination = ref({ page: 1, per_page: 25, total: 0, last_page: 1 });
let searchTimer: ReturnType<typeof setTimeout> | null = null;
let controller: AbortController | null = null;

const fetchLimits = async () => {
    controller?.abort();
    controller = new AbortController();
    if (limits.value.length === 0) loading.value = true;
    else fetching.value = true;
    try {
        const { data } = await api.get("/limits", {
            signal: controller.signal,
            params: { search: search.value || undefined, page: pagination.value.page, per_page: pagination.value.per_page },
        });
        limits.value = data.data;
        pagination.value = {
            page: data.meta.current_page,
            per_page: data.meta.per_page,
            total: data.meta.total,
            last_page: data.meta.last_page,
        };
    } catch (error: any) {
        if (error.name !== "CanceledError") console.error("Fetch limits failed", error);
    } finally {
        loading.value = false;
        fetching.value = false;
    }
};

watch(search, () => {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        pagination.value.page = 1;
        void fetchLimits();
    }, 300);
});

const goToPage = (page: number) => {
    if (page === pagination.value.page) return;
    pagination.value.page = page;
    void fetchLimits();
};

const edit = (id: number | string) => router.push({ name: "admin.limits.edit", params: { id: Number(id) } });

const remove = async (row: LimitRow) => {
    modal.openModal(ConfirmDeleteModal, {
        title: t("limits.delete"),
        message: t("limits.confirm_delete"),
        itemName: row.name,
        confirmText: t("common.delete"),
        cancelText: t("common.cancel"),
        loadingText: t("common.loading"),
        onConfirm: async () => {
            deletingId.value = row.id;
            try {
                await api.delete(`/limits/${row.id}`);
                ui.showSuccess(t("limits.deleted"));
                await fetchLimits();
            } finally {
                deletingId.value = null;
            }
        },
        onError: (error: any) => {
            if (error.response?.status === 409) ui.showError(t("limits.delete_in_use"));
            else {
                console.error("Delete limit failed", error);
                ui.showError(t("common.error_occurred"));
            }
        },
    });
};

const limitTypeName = (type: number) => t(
    type === 1 ? "limits.type_quantity"
        : type === 2 ? "limits.type_financial"
            : type === 3 ? "limits.type_both"
                : "limits.type_either"
);
const timeLimitName = (period: number) => t(["", "limits.week", "limits.month", "limits.quarter", "limits.year", "limits.custom_period"][period] ?? "limits.custom_period");

const columns = computed(() => [
    { key: "name", label: t("limits.name") },
    { key: "unit", label: t("limits.unit"), formatter: (row: LimitRow) => row.unit?.name ?? "" },
    { key: "limit_type", label: t("limits.limit_type") },
    { key: "time_limit", label: t("limits.time_limit") },
    { key: "quantity", label: t("limits.quantity"), formatter: (row: LimitRow) => row.quantity ?? "–" },
    { key: "price", label: t("limits.price"), formatter: (row: LimitRow) => row.price ?? "–" },
    { key: "limit_items", label: t("limits.items") },
    { key: "limit_users", label: t("limits.users") },
    { key: "actions", label: "" },
]);

onMounted(fetchLimits);
onUnmounted(() => {
    if (searchTimer) clearTimeout(searchTimer);
    controller?.abort();
});
</script>

<style scoped>
.limits-view__search {
    max-width: 420px;
}
</style>