<template>
    <div>
        <div class="page-header">
            <div>
                <h1>{{ categoryTitle }}</h1>
            </div>

            <div class="d-flex gap-2">
                <BaseButton variant="secondary" @click="goBack">
                    {{ t("common.back") }}
                </BaseButton>

                <BaseButton @click="goToCreate">
                    {{ t("common.create") }}
                </BaseButton>
            </div>
        </div>

        <div class="table-wrapper">
            <div v-if="fetching && !loading" class="table-loading">
                {{ t("common.loading") }}
            </div>

            <BaseTable :columns="columns" :data="newsList" :loading="loading" rowKey="id" :currentPage="pagination.page"
                :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir" @sort="changeSort">
                <!-- STATUS -->
                <template #header-is_active>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("common.status") }}
                        </div>

                        <BaseSelect v-model="filters.is_active" :options="statusOptions" labelKey="label"
                            valueKey="value" size="sm" />
                    </div>
                </template>

                <!-- TITLE -->
                <template #cell-title="{ row }">
                    {{ row.title }}
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

                        <BaseButton variant="danger" @click.stop="openDeleteModal(row as NewsListItem)">
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
import {
    computed,
    onMounted,
    ref,
} from "vue";

import {
    useRoute,
    useRouter,
} from "vue-router";

import { useI18n } from "vue-i18n";

import api from "@/core/api/axios";

import BaseButton from "@/views/shared/ui/BaseButton.vue";
import BaseSelect from "@/views/shared/ui/BaseSelect.vue";
import BaseTable from "@/views/shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@/views/shared/components/BasePagination/BasePagination.vue";

import { useModalStore } from "@/core/stores/modalStore";
import ConfirmDeleteModal from "@/views/modals/ConfirmDeleteModal.vue";
const modal = useModalStore();

const openDeleteModal = (
    row: NewsListItem
) => {
    modal.openModal(
        ConfirmDeleteModal,
        {
            title: t("news.delete"),
            message: t("news.delete_confirm"),
            itemName: row.title,

            confirmText: t("common.delete"),
            cancelText: t("common.cancel"),
            loadingText: t("common.loading"),

            onConfirm: () =>
                deleteNews(row),
        }
    );
};

const deleteNews = async (
    row: NewsListItem
) => {
    try {
        await api.delete(
            `/news/${row.id}`
        );

        await fetchNews();
    } catch (e) {
        console.error(
            "Nie udało się usunąć newsu:",
            e
        );

        throw e;
    }
};

import type {
    NewsCategoryDetail,
} from "@/composables/types/newsCategories";

import type {
    NewsListItem,
    NewsResponse,
} from "@/composables/types/news";

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const categoryId = Number(route.params.id);

const category = ref<NewsCategoryDetail | null>(null);

const newsList = ref<NewsListItem[]>([]);

const loading = ref(true);
const fetching = ref(false);

const filters = ref({
    is_active: "" as "" | "0" | "1",
});

const sortBy = ref("created_at");

const sortDir = ref<"asc" | "desc">("desc");

const pagination = ref({
    page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
});

const categoryTitle = computed(() => {
    const lang = category.value?.langs?.[0];

    return lang?.title ?? t("news.category");
});

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

const loadCategory = async () => {
    const { data } = await api.get(
        `/news-categories/${categoryId}`
    );

    category.value = data.data;
};

const fetchNews = async () => {
    if (newsList.value.length === 0) {
        loading.value = true;
    } else {
        fetching.value = true;
    }

    try {
        const params: Record<string, string | number> = {
            page: pagination.value.page,
            per_page: pagination.value.per_page,
            sort_by: sortBy.value,
            sort_dir: sortDir.value,
        };

        if (filters.value.is_active !== "") {
            params.is_active = filters.value.is_active;
        }

        const { data } = await api.get<NewsResponse>(
            `/news/category/${categoryId}`,
            {
                params,
            }
        );

        newsList.value = data.data;

        pagination.value.page =
            data.meta.current_page;

        pagination.value.last_page =
            data.meta.last_page;

        pagination.value.per_page =
            data.meta.per_page;

        pagination.value.total =
            data.meta.total;
    } catch (e) {
        console.error(
            "Nie udało się pobrać newsów kategorii:",
            e
        );
    } finally {
        loading.value = false;
        fetching.value = false;
    }
};

const changePage = (page: number) => {
    pagination.value.page = page;

    fetchNews();
};

const changeSort = (payload: {
    sortBy: string;
    sortDir: "asc" | "desc";
}) => {
    sortBy.value = payload.sortBy;
    sortDir.value = payload.sortDir;

    pagination.value.page = 1;

    fetchNews();
};

const goToEdit = (row: NewsListItem) => {
    router.push({
        name: "admin.news.edit",
        params: {
            id: row.id,
        },
    });
};


const goBack = () => {
    router.back();
};

onMounted(async () => {
    try {
        await loadCategory();
        await fetchNews();
    } catch (e) {
        console.error(
            "Nie udało się załadować kategorii:",
            e
        );
    }
});

const goToCreate = () => {
    router.push({
        name: "admin.news.create",
        query: {
            category_id: categoryId,
        },
    });
};

</script>