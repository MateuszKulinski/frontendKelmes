import { ref, watch, onMounted, computed } from "vue";
import api from "@/core/api/axios";

import type {
    UnitListItem,
    UnitFilters,
    UnitsResponse
} from "@entities/unit";

export function useUnitView() {

    let controller: AbortController | null = null;
    let timeout: any = null;

    const units = ref<UnitListItem[]>([]);

    const loading = ref(true);
    const fetching = ref(false);

    const search = ref("");

    const filters = ref<UnitFilters>({
        name: "",
        number: "",
        is_active: "",
    });

    const sortBy = ref("id");
    const sortDir = ref<"asc" | "desc">("desc");

    const pagination = ref({
        page: 1,
        per_page: 25,
        total: 0,
        last_page: 1,
    });

    type FilterKey = keyof UnitFilters;

    const activeFilters = computed(() => {

        const result: {
            key: string;
            label: string;
            value: string;
        }[] = [];

        if (search.value) {
            result.push({
                key: "search",
                label: "Login",
                value: search.value,
            });
        }

        Object.entries(filters.value).forEach(([key, value]) => {

            if (value === "" || value === null)
                return;

            let display = String(value);

            if (key === "is_active") {
                display = value ? "Aktywny" : "Nieaktywny";
            }

            result.push({
                key,
                label: key,
                value: display,
            });

        });

        return result;

    });

    const clearSingleFilter = (key: string) => {

        if (key === "search") {
            search.value = "";
        } else {
            filters.value[key as FilterKey] = "" as any;
        }

    };

    const resetFilters = () => {

        Object.keys(filters.value).forEach(key => {
            filters.value[key as FilterKey] = "" as any;
        });

        search.value = "";
        pagination.value.page = 1;

        fetchUnits();

    };

    const fetchUnits = async () => {

        if (controller)
            controller.abort();

        controller = new AbortController();

        if (units.value.length === 0)
            loading.value = true;
        else
            fetching.value = true;

        try {

            const { data } = await api.get<UnitsResponse>(
                "/units",
                {
                    signal: controller.signal,
                    params: {
                        page: pagination.value.page,
                        search: search.value,
                        sort_by: sortBy.value,
                        sort_dir: sortDir.value,
                        ...filters.value,
                    }
                }
            );

            units.value = data.data;

            pagination.value = {
                page: data.meta.current_page,
                per_page: data.meta.per_page,
                total: data.meta.total,
                last_page: data.meta.last_page,
            };

        }
        catch (e: any) {

            if (e.name === "CanceledError")
                return;

            console.error(e);

        }
        finally {

            loading.value = false;
            fetching.value = false;

        }

    };

    const triggerFetch = () => {

        clearTimeout(timeout);

        timeout = setTimeout(() => {

            pagination.value.page = 1;
            fetchUnits();

        }, 400);

    };

    watch(search, triggerFetch);
    watch(filters, triggerFetch, { deep: true });

    const goToPage = (page: number) => {

        if (page === pagination.value.page)
            return;

        pagination.value.page = page;

        fetchUnits();

    };

    const handleSort = (payload: {
        sortBy: string;
        sortDir: "asc" | "desc";
    }) => {

        sortBy.value = payload.sortBy;
        sortDir.value = payload.sortDir;

        pagination.value.page = 1;

        fetchUnits();

    };

    onMounted(fetchUnits);

    return {

        units,

        loading,
        fetching,

        pagination,

        search,
        filters,

        sortBy,
        sortDir,

        activeFilters,

        fetchUnits,

        goToPage,
        handleSort,

        clearSingleFilter,
        resetFilters,

    };

}