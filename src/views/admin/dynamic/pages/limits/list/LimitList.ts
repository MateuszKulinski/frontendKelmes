
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/core/api/axios";

export interface LimitListItem {
    id: number;
    name: string;
    limit_type: number;
    time_limit: number;
    quantity: number | null;
    price: number | null;
    required_approvals: number;
    items_count: number;
    units_count: number;
    created_at: string | null;
}

export function useLimitList() {
    const { t } = useI18n();
    const limits = ref<LimitListItem[]>([]);
    const loading = ref(true);
    const fetching = ref(false);
    const search = ref("");

    const pagination = ref({
        page: 1,
        per_page: 25,
        total: 0,
        last_page: 1,
    });

    let controller: AbortController | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const activeFilters = computed(() => {
        if (!search.value.trim()) return [];

        return [{
            key: "search",
            label: t("limits.name_filter"),
            value: search.value,
        }];
    });

    const fetchLimits = async () => {
        controller?.abort();
        controller = new AbortController();

        if (limits.value.length === 0) {
            loading.value = true;
        } else {
            fetching.value = true;
        }

        try {
            const { data } = await api.get("/limits", {
                signal: controller.signal,
                params: {
                    page: pagination.value.page,
                    per_page: pagination.value.per_page,
                    search: search.value,
                },
            });

            limits.value = data.data;

            pagination.value = {
                page: data.meta.current_page,
                per_page: data.meta.per_page,
                total: data.meta.total,
                last_page: data.meta.last_page,
            };
        } catch (error: any) {
            if (
                error.name !== "CanceledError" &&
                error.code !== "ERR_CANCELED"
            ) {
                console.error("Fetch limits failed", error);
            }
        } finally {
            loading.value = false;
            fetching.value = false;
        }
    };

    const triggerFetch = () => {
        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(() => {
            pagination.value.page = 1;
            fetchLimits();
        }, 400);
    };

    const goToPage = (page: number) => {
        if (
            page === pagination.value.page ||
            page < 1 ||
            page > pagination.value.last_page
        ) {
            return;
        }

        pagination.value.page = page;
        fetchLimits();
    };

    const clearSingleFilter = (key: string) => {
        if (key === "search") search.value = "";
    };

    const resetFilters = () => {
        search.value = "";
        pagination.value.page = 1;
        fetchLimits();
    };

    watch(search, triggerFetch);

    onMounted(fetchLimits);

    onBeforeUnmount(() => {
        controller?.abort();

        if (timeout) clearTimeout(timeout);
    });

    return {
        limits,
        loading,
        fetching,
        search,
        pagination,
        activeFilters,
        fetchLimits,
        goToPage,
        clearSingleFilter,
        resetFilters,
    };
}
