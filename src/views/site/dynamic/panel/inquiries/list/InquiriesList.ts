import { ref, onMounted, watch, computed } from "vue";
import api from "@/core/api/axios";

import type {
    InquiryListItem,
    InquiryFilters,
    InquiriesResponse,
    InquiryStatusOption
} from "@/composables/types/inquiry";

export function useInquiryView() {
    let controller: AbortController | null = null;
    let timeout: any = null;

    const inquiries = ref<InquiryListItem[]>([]);
    const statuses = ref<InquiryStatusOption[]>([]);

    const loading = ref(true);
    const fetching = ref(false);

    const search = ref("");

    const filters = ref<InquiryFilters>({
        status_id: "",
        unit: "",
        user: "",
    });

    const sortBy = ref("id");
    const sortDir = ref<"asc" | "desc">("desc");

    const pagination = ref({
        page: 1,
        per_page: 25,
        total: 0,
        last_page: 1,
    });

    type FilterKey = keyof InquiryFilters;

    const activeFilters = computed(() => {
        const result: { key: string; label: string; value: string }[] = [];

        if (search.value) {
            result.push({
                key: "search",
                label: "Nazwa",
                value: search.value,
            });
        }

        (Object.entries(filters.value) as [FilterKey, InquiryFilters[FilterKey]][]).forEach(([key, value]) => {
            if (value === "" || value === null) return;

            let displayValue = String(value);

            if (key === "status_id") {
                const found = statuses.value.find(s => s.id === Number(value));

                if (found) {
                    displayValue = found.name;
                }
            }

            result.push({
                key,
                label: key,
                value: displayValue,
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
        Object.keys(filters.value).forEach((key) => {
            filters.value[key as FilterKey] = "" as any;
        });

        search.value = "";
        pagination.value.page = 1;

        fetchInquiries();
    };

    const fetchInquiries = async () => {
        if (controller) controller.abort();

        controller = new AbortController();

        if (inquiries.value.length === 0) {
            loading.value = true;
        } else {
            fetching.value = true;
        }

        try {
            const { data } = await api.get<InquiriesResponse>("/inquiries", {
                signal: controller.signal,
                params: {
                    page: pagination.value.page,
                    search: search.value,
                    sort_by: sortBy.value,
                    sort_dir: sortDir.value,
                    ...filters.value,
                },
            });

            inquiries.value = data.data;

            if (data.statuses) {
                statuses.value = data.statuses;
            }

            pagination.value = {
                page: data.meta.current_page,
                per_page: data.meta.per_page,
                total: data.meta.total,
                last_page: data.meta.last_page,
            };
        } catch (e: any) {
            if (e.name === "CanceledError") return;

            console.error("Fetch inquiries failed", e);
        } finally {
            loading.value = false;
            fetching.value = false;
        }
    };

    const triggerFetch = () => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            pagination.value.page = 1;

            fetchInquiries();
        }, 400);
    };

    watch(search, triggerFetch);
    watch(filters, triggerFetch, { deep: true });

    const goToPage = (page: number) => {
        if (page === pagination.value.page) return;

        pagination.value.page = page;
        fetching.value = true;

        fetchInquiries();
    };

    const handleSort = (payload: { sortBy: string; sortDir: "asc" | "desc" }) => {
        sortBy.value = payload.sortBy;
        sortDir.value = payload.sortDir;

        pagination.value.page = 1;
        fetching.value = true;

        fetchInquiries();
    };

    onMounted(fetchInquiries);

    return {
        inquiries,
        statuses,

        loading,
        fetching,

        pagination,

        search,
        filters,

        sortBy,
        sortDir,

        activeFilters,

        goToPage,
        handleSort,

        clearSingleFilter,
        resetFilters,

        fetchInquiries,
    };
}