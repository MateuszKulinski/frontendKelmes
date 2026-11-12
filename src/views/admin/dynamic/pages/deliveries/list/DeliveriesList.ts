import { ref, onMounted, watch, computed } from "vue";
import api from "@/core/api/axios";
import { useI18n } from "vue-i18n";

import type {
    DeliveryMethodItem,
    DeliveryMethodsResponse
} from "@/composables/types/delivery";

export function useDeliveryMethodsList() {

    const { t } = useI18n();

    let controller: AbortController | null = null;
    let timeout: any = null;

    const deliveries = ref<DeliveryMethodItem[]>([]);

    const loading = ref(true);
    const fetching = ref(false);

    const search = ref("");

    const filters = ref({
        code: "",
        name: "",
        is_active: "" as "" | 0 | 1
    });

    const sortBy = ref("sort_order");
    const sortDir = ref<"asc" | "desc">("asc");

    const pagination = ref({
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    });

    const getFilterLabel = (key: string) => {

        if (key === "search") {
            return "";
        }

        return t(`delivery.${key}`);
    };

    const activeFilters = computed(() => {

        const result: {
            key: string;
            label: string;
            value: string;
        }[] = [];

        Object.entries(filters.value).forEach(([key, value]) => {

            if (!value) return;

            let displayValue = String(value);

            if (key === "is_active") {

                displayValue =
                    value === 1 || value === "1"
                        ? t("common.active")
                        : t("common.inactive");
            }

            result.push({
                key,
                label: getFilterLabel(key),
                value: displayValue,
            });
        });

        return result;
    });

    const clearSingleFilter = (key: string) => {

        if (key === "search") {
            search.value = "";
        } else {
            filters.value[key as keyof typeof filters.value] = "";
        }
    };

    const resetFilters = () => {

        Object.keys(filters.value).forEach((key) => {
            filters.value[key as keyof typeof filters.value] = "";
        });

        search.value = "";
        pagination.value.page = 1;

        fetchDeliveries();
    };

    const fetchDeliveries = async () => {

        if (controller) {
            controller.abort();
        }

        controller = new AbortController();

        if (deliveries.value.length === 0) {
            loading.value = true;
        } else {
            fetching.value = true;
        }

        try {

            const { data } = await api.get<DeliveryMethodsResponse>(
                "/settings/deliveries",
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

            deliveries.value = data.data;

            pagination.value = {
                page: data.meta.current_page,
                per_page: data.meta.per_page,
                total: data.meta.total,
                last_page: data.meta.last_page,
            };

        } catch (e: any) {

            if (e.name === "CanceledError") {
                return;
            }

            console.error("Fetch deliveries failed", e);

        } finally {

            loading.value = false;
            fetching.value = false;
        }
    };

    const triggerFetch = () => {

        clearTimeout(timeout);

        timeout = setTimeout(() => {

            pagination.value.page = 1;

            fetchDeliveries();

        }, 400);
    };

    watch(search, triggerFetch);
    watch(filters, triggerFetch, { deep: true });

    const goToPage = (page: number) => {

        if (page === pagination.value.page) {
            return;
        }

        pagination.value.page = page;

        fetching.value = true;

        fetchDeliveries();
    };

    const handleSort = (
        payload: {
            sortBy: string;
            sortDir: "asc" | "desc";
        }
    ) => {

        sortBy.value = payload.sortBy;
        sortDir.value = payload.sortDir;

        pagination.value.page = 1;

        fetching.value = true;

        fetchDeliveries();
    };

    const reorderDeliveries = async (list: any[]) => {

        loading.value = true;

        const payload = list.map((item, index) => ({
            id: item.id,
            sort_order: index + 1,
        }));

        await api.post("/settings/deliveries/sort", {
            items: payload,
        });

        deliveries.value = list;

        fetchDeliveries();
    };

    onMounted(fetchDeliveries);

    return {
        deliveries,
        loading,
        fetching,
        pagination,
        search,
        filters,
        goToPage,
        sortBy,
        sortDir,
        handleSort,
        resetFilters,
        activeFilters,
        clearSingleFilter,
        fetchDeliveries,
        reorderDeliveries
    };
}