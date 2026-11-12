import { ref, onMounted, watch, computed } from "vue";
import api from "@/core/api/axios";
import { useI18n } from "vue-i18n";
import type { DocumentListItem, DocumentTypeOption, DocumentsResponse } from "@entities/document";

export function useDocsList() {
    const { t } = useI18n();

    let controller: AbortController | null = null;
    let timeout: any = null;

    const docs = ref<DocumentListItem[]>([]);
    const documentTypes = ref<DocumentTypeOption[]>([]);

    const loading = ref(true);
    const fetching = ref(false);

    const search = ref("");

    const filters = ref({
        number: "",
        unit: "",
        document_type_id: "",
        price_from: "",
        price_to: "",
        price_tax_from: "",
        price_tax_to: "",
        outstanding_from: "",
        outstanding_to: "",
        date_add_from: "",
        date_add_to: "",
        date_payment_from: "",
        date_payment_to: "",
    });

    const sortBy = ref("id");
    const sortDir = ref<"asc" | "desc">("desc");

    const pagination = ref({
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1
    });

    // 🔥 mapowanie kluczy → i18n
    const keyMap: Record<string, string> = {
        price: "price_net",
        price_tax: "price_gross",
        outstanding_amount: "outstanding",
        unit: "contractor",
        document_type: "type",
        document_type_id: "type",
    };

    const getFilterLabel = (key: string) => {
        if (key === "search") return "";

        if (key.endsWith("_from") || key.endsWith("_to")) {
            const base = key.replace("_from", "").replace("_to", "");
            const label = t(`docs.${keyMap[base] || base}`);

            return label + " " + (key.endsWith("_from") ? t("common.from") : t("common.to"));
        }

        return t(`docs.${keyMap[key] || key}`);
    };

    const activeFilters = computed(() => {
        const result: {
            key: string;
            label: string;
            value: string;
        }[] = [];

        Object.entries(filters.value).forEach(([key, value]) => {
            if (!value) return;

            let displayValue = value;

            // 🔥 document_type_id mapping (zostaje jak było)
            if (key === "document_type_id") {
                const found = documentTypes.value.find(
                    (dt: any) => dt.id == value
                );

                if (found) {
                    displayValue = `${found.short_name} - ${found.name}`;
                }
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
        Object.keys(filters.value).forEach(key => {
            filters.value[key as keyof typeof filters.value] = "";
        });

        search.value = "";
        pagination.value.page = 1;

        fetchDocs();
    };

    const fetchDocs = async () => {
        if (controller) controller.abort();
        controller = new AbortController();

        if (docs.value.length === 0) {
            loading.value = true;
        } else {
            fetching.value = true;
        }

        try {
            const { data } = await api.get<DocumentsResponse>("/documents", {
                signal: controller.signal,
                params: {
                    page: pagination.value.page,
                    search: search.value,
                    sort_by: sortBy.value,
                    sort_dir: sortDir.value,
                    ...filters.value
                },
            });

            docs.value = data.data;
            documentTypes.value = data.document_types;

            pagination.value = {
                page: data.meta.current_page,
                per_page: data.meta.per_page,
                total: data.meta.total,
                last_page: data.meta.last_page,
            };

        } catch (e: any) {
            if (e.name === "CanceledError") return;
            console.error("Fetch docs failed", e);
        } finally {
            loading.value = false;
            fetching.value = false;
        }
    };

    const triggerFetch = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            pagination.value.page = 1;
            fetchDocs();
        }, 400);
    };

    watch(search, triggerFetch);
    watch(filters, triggerFetch, { deep: true });

    const goToPage = (page: number) => {
        if (page === pagination.value.page) return;
        pagination.value.page = page;
        fetching.value = true;
        fetchDocs();
    };

    const handleSort = (payload: { sortBy: string; sortDir: "asc" | "desc" }) => {
        sortBy.value = payload.sortBy;
        sortDir.value = payload.sortDir;
        pagination.value.page = 1;
        fetching.value = true;
        fetchDocs();
    };

    onMounted(fetchDocs);

    return {
        docs,
        documentTypes,
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
        fetchDocs
    };
}