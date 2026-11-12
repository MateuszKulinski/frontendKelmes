import { ref, computed, watch, onMounted } from "vue";
import api from "@/core/api/axios";

import type {
    OfferCompany,
    OfferCompaniesResponse,
    OfferCompanyFilters
} from "@/composables/types/offerCompany";

export function useOfferCompaniesList() {

    let controller: AbortController | null = null;
    let timeout: any = null;

    const companies = ref<OfferCompany[]>([]);

    const loading = ref(true);
    const fetching = ref(false);

    const search = ref("");

    const filters = ref<OfferCompanyFilters>({
        city: "",
        authorized_person: "",
        created_by: "",
    });

    const sortBy = ref("id");
    const sortDir = ref<"asc" | "desc">("desc");

    const pagination = ref({
        page: 1,
        per_page: 25,
        total: 0,
        last_page: 1,
    });

    type FilterKey = keyof OfferCompanyFilters;

    const activeFilters = computed(() => {

        const result: {
            key: string;
            label: string;
            value: string;
        }[] = [];

        if (search.value) {
            result.push({
                key: "search",
                label: "Nazwa",
                value: search.value,
            });
        }

        Object.entries(filters.value).forEach(([key, value]) => {

            if (!value) return;

            result.push({
                key,
                label: key,
                value,
            });

        });

        return result;
    });

    const clearSingleFilter = (key: string) => {

        if (key === "search") {
            search.value = "";
        } else {
            filters.value[key as FilterKey] = "";
        }

    };

    const resetFilters = () => {

        Object.keys(filters.value).forEach((key) => {
            filters.value[key as FilterKey] = "";
        });

        search.value = "";
        pagination.value.page = 1;

        fetchCompanies();

    };

    const fetchCompanies = async () => {

        if (controller) controller.abort();

        controller = new AbortController();

        if (companies.value.length === 0) {
            loading.value = true;
        } else {
            fetching.value = true;
        }

        try {

            const { data } = await api.get<OfferCompaniesResponse>(
                "/offers/company",
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

            companies.value = data.data;

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

            fetchCompanies();

        }, 400);

    };

    watch(search, triggerFetch);
    watch(filters, triggerFetch, { deep: true });

    const goToPage = (page: number) => {

        pagination.value.page = page;

        fetchCompanies();

    };

    const handleSort = (payload: {
        sortBy: string;
        sortDir: "asc" | "desc";
    }) => {

        sortBy.value = payload.sortBy;
        sortDir.value = payload.sortDir;

        pagination.value.page = 1;

        fetchCompanies();

    };

    onMounted(fetchCompanies);

    return {

        companies,

        loading,
        fetching,

        pagination,

        search,
        filters,

        sortBy,
        sortDir,

        activeFilters,

        clearSingleFilter,
        resetFilters,

        goToPage,
        handleSort,

        fetchCompanies,

    };

}