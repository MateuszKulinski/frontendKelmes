import { ref, onMounted, watch, computed } from "vue";
import api from "@/core/api/axios";
import type {
    CartListItem,
    CartFilters,
    CartResponse,
    SelectOption
} from "@entities/cart";

export function useCartList() {
    let controller: AbortController | null = null;
    let timeout: any = null;

    const carts = ref<CartListItem[]>([]);
    const paymentMethods = ref<SelectOption[]>([]);
    const transportMethods = ref<SelectOption[]>([]);

    const loading = ref(true);
    const fetching = ref(false);

    const search = ref("");

    const filters = ref<CartFilters>({
        unit: "",
        user: "",
        payment_method_id: "",
        transport_method_id: "",
        date_from: "",
        date_to: "",
    });

    const sortBy = ref("id");
    const sortDir = ref<"asc" | "desc">("desc");

    const pagination = ref({
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1
    });

    const activeFilters = computed(() => {
        const result: { key: string; label: string; value: string }[] = [];

        if (search.value) {
            result.push({
                key: "search",
                label: "Szukaj",
                value: search.value
            });
        }

        (Object.entries(filters.value) as [keyof CartFilters, string][]).forEach(([key, value]) => {
            if (!value) return;

            let displayValue = value;

            if (key === "payment_method_id") {
                const found = paymentMethods.value.find(p => p.id === Number(value));
                if (found) displayValue = found.name;
            }

            if (key === "transport_method_id") {
                const found = transportMethods.value.find(t => t.id === Number(value));
                if (found) displayValue = found.name;
            }

            result.push({
                key,
                label: key,
                value: displayValue
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

        fetchCarts();
    };

    const getCleanFilters = (): Partial<CartFilters> => {
        return Object.fromEntries(
            Object.entries(filters.value).filter(([_, v]) => v !== "")
        ) as Partial<CartFilters>;
    };

    const fetchCarts = async () => {
        if (controller) controller.abort();
        controller = new AbortController();

        if (carts.value.length === 0) {
            loading.value = true;
        } else {
            fetching.value = true;
        }

        try {
            const { data } = await api.get<CartResponse>("/carts", {
                signal: controller.signal,
                params: {
                    page: pagination.value.page,
                    search: search.value,
                    sort_by: sortBy.value,
                    sort_dir: sortDir.value,
                    ...getCleanFilters()
                },
            });

            carts.value = data.data;
            paymentMethods.value = data.payment_methods;
            transportMethods.value = data.transport_methods;

            pagination.value = {
                page: data.meta.current_page,
                per_page: data.meta.per_page,
                total: data.meta.total,
                last_page: data.meta.last_page,
            };

        } catch (e: any) {
            if (e.name === "CanceledError") return;
            console.error("Fetch carts failed", e.response?.data || e);
        } finally {
            loading.value = false;
            fetching.value = false;
        }
    };

    const triggerFetch = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            pagination.value.page = 1;
            fetchCarts();
        }, 400);
    };

    watch(search, triggerFetch);
    watch(filters, triggerFetch, { deep: true });

    const goToPage = (page: number) => {
        if (page === pagination.value.page) return;
        pagination.value.page = page;
        fetching.value = true;
        fetchCarts();
    };

    const handleSort = (payload: { sortBy: string; sortDir: "asc" | "desc" }) => {
        sortBy.value = payload.sortBy;
        sortDir.value = payload.sortDir;
        pagination.value.page = 1;
        fetching.value = true;
        fetchCarts();
    };

    onMounted(fetchCarts);

    return {
        carts,
        loading,
        fetching,
        pagination,
        search,
        filters,
        paymentMethods,
        transportMethods,
        goToPage,
        sortBy,
        sortDir,
        handleSort,
        resetFilters,
        activeFilters,
        clearSingleFilter,
        fetchCarts
    };
}