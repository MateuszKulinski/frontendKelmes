import { onMounted, ref, watch } from "vue";

import api from "@/core/api/axios";

import type {
    NewsListItem,
    NewsResponse,
} from "@/composables/types/news";

export function useNewsList() {
    let controller: AbortController | null = null;

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

    const fetchNews = async () => {
        if (controller) {
            controller.abort();
        }

        controller = new AbortController();

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
                "/news",
                {
                    params,
                    signal: controller.signal,
                }
            );

            newsList.value = data.data;

            pagination.value.total = data.meta.total;
            pagination.value.last_page = data.meta.last_page;
            pagination.value.page = data.meta.current_page;
            pagination.value.per_page = data.meta.per_page;
        } catch (e: any) {
            if (
                e.name !== "CanceledError" &&
                e.code !== "ERR_CANCELED"
            ) {
                console.error(
                    "Nie udało się pobrać newsów:",
                    e
                );
            }
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

    const resetFilters = () => {
        filters.value.is_active = "";
        pagination.value.page = 1;
    };

    onMounted(fetchNews);

    watch(
        filters,
        () => {
            pagination.value.page = 1;
            fetchNews();
        },
        {
            deep: true,
        }
    );

    return {
        newsList,
        loading,
        fetching,

        filters,

        sortBy,
        sortDir,

        pagination,

        fetchNews,
        changePage,
        changeSort,
        resetFilters,
    };
}