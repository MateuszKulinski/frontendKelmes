import { ref, onMounted, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/core/api/axios";

import type {
    PromotionListItem,
    PromotionsResponse,
} from "@/composables/types/promotion";

export function usePromotionList() {
    const { t } = useI18n();

    let controller: AbortController | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const promotions = ref<PromotionListItem[]>([]);

    const loading = ref(true);
    const fetching = ref(false);

    const search = ref("");

    const filters = ref({
        id: "",
        type: "",
        value_type: "",
        percentage_from: "",
        percentage_to: "",
        quantity_from: "",
        value_from: "",
        active: "",
    });

    const sortBy = ref("id");
    const sortDir = ref<"asc" | "desc">("desc");

    const pagination = ref({
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    });

    const activeOptions = computed(() => [
        {
            label: t("common.yes"),
            value: "1",
        },
        {
            label: t("common.no"),
            value: "0",
        },
    ]);

    const keyMap: Record<string, string> = {
        id: "id",
        description: "description",
        type: "type",
        value_type: "value_type",
        percentage: "percentage",
        quantity_from: "quantity_from",
        value_from: "value_from",
        active: "active",
    };

    const getFilterLabel = (key: string) => {
        if (key === "search") {
            return "";
        }

        if (key.endsWith("_from") || key.endsWith("_to")) {
            const base = key
                .replace("_from", "")
                .replace("_to", "");

            const label = t(
                `promotions.${keyMap[base] || base}`
            );

            return (
                label +
                " " +
                (key.endsWith("_from")
                    ? t("common.from")
                    : t("common.to"))
            );
        }

        return t(
            `promotions.${keyMap[key] || key}`
        );
    };

    const activeFilters = computed(() => {
        const result: {
            key: string;
            label: string;
            value: string;
        }[] = [];

        Object.entries(filters.value).forEach(
            ([key, value]) => {
                if (!value) return;

                let displayValue = String(value);

                if (key === "active") {
                    const found = activeOptions.value.find(
                        option => option.value === value
                    );

                    if (found) {
                        displayValue = found.label;
                    }
                }

                if (key === "value_type") {
                    if (value === "percentage") {
                        displayValue = t(
                            "promotions.percentage"
                        );
                    }
                }

                result.push({
                    key,
                    label: getFilterLabel(key),
                    value: displayValue,
                });
            }
        );

        if (search.value) {
            result.unshift({
                key: "search",
                label: t("common.search"),
                value: search.value,
            });
        }

        return result;
    });

    const clearSingleFilter = (key: string) => {
        if (key === "search") {
            search.value = "";
            return;
        }

        filters.value[
            key as keyof typeof filters.value
        ] = "";
    };

    const resetFilters = () => {
        Object.keys(filters.value).forEach(key => {
            filters.value[
                key as keyof typeof filters.value
            ] = "";
        });

        search.value = "";
        pagination.value.page = 1;

        fetchPromotions();
    };

    const fetchPromotions = async () => {
        if (controller) {
            controller.abort();
        }

        controller = new AbortController();

        if (promotions.value.length === 0) {
            loading.value = true;
        } else {
            fetching.value = true;
        }

        try {
            const { data } =
                await api.get<PromotionsResponse>(
                    "/promotions",
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

            promotions.value = data.contracts;

            pagination.value = {
                page: data.meta.current_page,
                per_page: data.meta.per_page,
                total: data.meta.total,
                last_page: data.meta.last_page,
            };
        } catch (e: any) {
            if (
                e.name === "CanceledError" ||
                e.code === "ERR_CANCELED"
            ) {
                return;
            }

            console.error(
                "Fetch promotions failed",
                e
            );
        } finally {
            loading.value = false;
            fetching.value = false;
        }
    };

    const triggerFetch = () => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            pagination.value.page = 1;
            fetchPromotions();
        }, 400);
    };

    watch(search, triggerFetch);

    watch(
        filters,
        triggerFetch,
        { deep: true }
    );

    const goToPage = (page: number) => {
        if (page === pagination.value.page) {
            return;
        }

        pagination.value.page = page;
        fetching.value = true;

        fetchPromotions();
    };

    const handleSort = (payload: {
        sortBy: string;
        sortDir: "asc" | "desc";
    }) => {
        sortBy.value = payload.sortBy;
        sortDir.value = payload.sortDir;

        pagination.value.page = 1;
        fetching.value = true;

        fetchPromotions();
    };

    onMounted(fetchPromotions);

    return {
        promotions,
        loading,
        fetching,

        pagination,

        search,
        filters,

        activeOptions,
        activeFilters,

        sortBy,
        sortDir,

        goToPage,
        handleSort,

        resetFilters,
        clearSingleFilter,

        fetchPromotions,
    };
}