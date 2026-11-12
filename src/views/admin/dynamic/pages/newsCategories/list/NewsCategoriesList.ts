import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import api from "@/core/api/axios";

import type {
    NewsCategoryFilters,
    NewsCategoryListItem,
    NewsCategoriesResponse,
} from "@/composables/types/newsCategories";

export function useNewsCategoriesView() {
    const router = useRouter();

    let controller: AbortController | null = null;
    let timeout: any = null;

    const categories = ref<NewsCategoryListItem[]>([]);

    const loading = ref(true);
    const fetching = ref(false);

    const search = ref("");

    const filters = ref<NewsCategoryFilters>({
        is_active: "",
    });

    const sortBy = ref("id");
    const sortDir = ref<"asc" | "desc">("desc");

    const pagination = ref({
        page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
    });

    const activeFilters = computed(() => {
        const result: { key: string; label: string; value: string }[] = [];

        if (search.value) {
            result.push({
                key: "search",
                label: "Tytuł",
                value: search.value,
            });
        }

        if (filters.value.is_active !== "") {
            result.push({
                key: "is_active",
                label: "Status",
                value: filters.value.is_active ? "Aktywna" : "Nieaktywna",
            });
        }

        return result;
    });

    const clearSingleFilter = (key: string) => {
        if (key === "search") {
            search.value = "";
            return;
        }

        if (key === "is_active") {
            filters.value.is_active = "";
        }
    };

    const resetFilters = () => {
        search.value = "";

        filters.value.is_active = "";

        pagination.value.page = 1;

        fetchCategories();
    };

    const fetchCategories = async () => {
        if (controller) controller.abort();

        controller = new AbortController();

        if (categories.value.length === 0) {
            loading.value = true;
        } else {
            fetching.value = true;
        }

        try {
            const { data } = await api.get<NewsCategoriesResponse>(
                "/news-categories",
                {
                    signal: controller.signal,
                    params: {
                        page: pagination.value.page,
                        search: search.value,
                        sort_by: sortBy.value,
                        sort_dir: sortDir.value,
                        ...filters.value,
                    },
                }
            );

            categories.value = data.data;

            pagination.value = {
                page: data.meta.current_page,
                per_page: data.meta.per_page,
                total: data.meta.total,
                last_page: data.meta.last_page,
            };
        } catch (e: any) {
            if (e.name === "CanceledError") return;

            console.error(e);
        } finally {
            loading.value = false;
            fetching.value = false;
        }
    };

    const triggerFetch = () => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            pagination.value.page = 1;
            fetchCategories();
        }, 400);
    };

    watch(search, triggerFetch);

    watch(filters, triggerFetch, {
        deep: true,
    });

    const goToPage = (page: number) => {
        pagination.value.page = page;
        fetchCategories();
    };

    const handleSort = (payload: {
        sortBy: string;
        sortDir: "asc" | "desc";
    }) => {
        sortBy.value = payload.sortBy;
        sortDir.value = payload.sortDir;
        pagination.value.page = 1;

        fetchCategories();
    };


    const goToEdit = (row: Record<string, any>) => {

        const newsCategory = row as NewsCategoryListItem;

        router.push({
            name: "admin.news-categories.edit",
            params: {
                id: newsCategory.id
            },
        });
    };

    const goToView = (row: Record<string, any>) => {

        const newsCategory = row as NewsCategoryListItem;

        router.push({
            name: "admin.news-categories.view",
            params: {
                id: newsCategory.id
            },
        });
    };

    onMounted(fetchCategories);

    return {
        categories,
        loading,
        fetching,
        pagination,
        search,
        filters,
        sortBy,
        sortDir,
        handleSort,
        goToPage,
        activeFilters,
        clearSingleFilter,
        resetFilters,
        fetchCategories,
        goToEdit,
        goToView
    };
}