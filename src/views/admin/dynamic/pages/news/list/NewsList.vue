<template>
    <div>
        <div class="table-wrapper">
            <div v-if="fetching && !loading" class="table-loading">
                {{ t("common.loading") }}
            </div>

            <BaseTable :columns="columns" :data="newsList" :loading="loading" rowKey="id" :currentPage="pagination.page"
                :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir" @sort="changeSort">
                <!-- STATUS FILTER -->
                <template #header-is_active>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("common.status") }}
                        </div>

                        <BaseSelect v-model="filters.is_active" :options="statusOptions" labelKey="label"
                            valueKey="value" size="sm" />
                    </div>
                </template>

                <!-- CATEGORY -->
                <template #cell-category="{ row }">
                    <span>
                        {{ row.category?.title ?? "—" }}
                    </span>
                </template>

                <!-- STATUS -->
                <template #cell-is_active="{ row }">
                    <span :class="row.is_active
                        ? 'badge bg-success'
                        : 'badge bg-secondary'
                        ">
                        {{
                            row.is_active
                                ? t("common.active")
                                : t("common.inactive")
                        }}
                    </span>
                </template>

                <!-- PUBLISH DATE -->
                <template #cell-publish_date="{ row }">
                    {{ row.publish_date ?? "—" }}
                </template>

                <!-- ACTIONS -->
                <template #cell-actions="{ row }">
                    <div class="actions-td">
                        <BaseButton @click.stop="goToEdit(row as NewsListItem)">
                            {{ t("common.edit") }}
                        </BaseButton>

                        <BaseButton variant="secondary" @click.stop="confirmDelete(row as NewsListItem)">
                            {{ t("common.delete") }}
                        </BaseButton>
                    </div>
                </template>
            </BaseTable>
        </div>

        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="changePage" />
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import api from '@/core/api/axios';
import { useModalStore } from '@/core/stores/modalStore';
import ConfirmDeleteModal from '@/views/modals/ConfirmDeleteModal.vue';
import BaseButton from "@/views/shared/ui/BaseButton.vue";
import BaseSelect from "@/views/shared/ui/BaseSelect.vue";
import BaseTable from "@/views/shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@/views/shared/components/BasePagination/BasePagination.vue";
import { useNewsList } from "./NewsList";

import type {
    NewsListItem,
} from "@/composables/types/news";

const { t } = useI18n();
const router = useRouter();
const modal = useModalStore();

const {
    newsList,
    loading,
    fetching,
    filters,
    sortBy,
    sortDir,
    pagination,
    changePage,
    changeSort,
    fetchNews,
} = useNewsList();

const statusOptions = computed(() => [
    {
        label: t("common.all"),
        value: "",
    },
    {
        label: t("common.active"),
        value: "1",
    },
    {
        label: t("common.inactive"),
        value: "0",
    },
]);

const columns = computed(() => [
    {
        key: "title",
        label: t("common.name"),
        sortable: true,
    },
    {
        key: "category",
        label: t("news.category"),
        sortable: false,
    },
    {
        key: "is_active",
        label: t("common.status"),
        sortable: true,
    },
    {
        key: "publish_date",
        label: t("news.publish_date"),
        sortable: true,
    },
    {
        key: "created_at",
        label: t("common.created_at"),
        sortable: true,
    },
    {
        key: "actions",
        label: "",
        sortable: false,
    },
]);


const goToEdit = (row: NewsListItem) => {
    router.push({
        name: "admin.news.edit",
        params: {
            id: row.id,
        },
    });
};

const confirmDelete = async (row: NewsListItem) => {
    modal.openModal(ConfirmDeleteModal, {
        title: t('news.delete'),
        message: t('news.delete_confirm'),
        itemName: row.title,
        confirmText: t('common.delete'),
        cancelText: t('common.cancel'),
        loadingText: t('common.loading'),
        onConfirm: async () => {
            await api.delete(`/news/${row.id}`);
            await fetchNews();
        },
    });
};
</script>
