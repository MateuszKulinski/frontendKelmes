import { ref, onMounted, watch, computed } from "vue";
import api from "@/core/api/axios";
import type {
    OrderListItem,
    OrderFilters,
    OrdersResponse,
    SelectOption
} from "@entities/order";

export function useOrderList() {
    let controller: AbortController | null = null;
    let timeout: any = null;

    const orders = ref<OrderListItem[]>([]);
    const paymentMethods = ref<SelectOption[]>([]);
    const transportMethods = ref<SelectOption[]>([]);
    const orderStatuses = ref<SelectOption[]>([]);

    const loading = ref(true);
    const fetching = ref(false);

    const search = ref("");

    const filters = ref<OrderFilters>({
        unit: "",
        user: "",
        payment_method_id: "",
        transport_method_id: "",
        status_id: "",
        price_from: "",
        price_to: "",
        price_tax_from: "",
        price_tax_to: "",
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

    // 🔥 mapowanie labeli
    const keyMap: Record<string, string> = {
        unit: "Firma",
        user: "Użytkownik",
        payment_method_id: "Płatność",
        transport_method_id: "Transport",
        status_id: "Status",
        price: "Netto",
        price_tax: "Brutto",
        created_at: "Data"
    };

    const getFilterLabel = (key: string) => {
        if (key === "search") return "Szukaj";

        if (key.endsWith("_from") || key.endsWith("_to")) {
            const base = key.replace("_from", "").replace("_to", "");
            const label = keyMap[base] || base;

            return label + " " + (key.endsWith("_from") ? "od" : "do");
        }

        return keyMap[key] || key;
    };


    const activeFilters = computed(() => {
        const result: { key: string; label: string; value: string }[] = [];

        if (search.value) {
            result.push({
                key: "search",
                label: getFilterLabel("search"),
                value: search.value,
            });
        }

        (Object.entries(filters.value) as [keyof OrderFilters, string][]).forEach(([key, value]) => {
            if (!value) return;

            let displayValue = value;

            if (key === "payment_method_id") {
                displayValue =
                    paymentMethods.value.find(p => p.id === Number(value))?.name || value;
            }

            if (key === "transport_method_id") {
                displayValue =
                    transportMethods.value.find(t => t.id === Number(value))?.name || value;
            }

            if (key === "status_id") {
                displayValue =
                    orderStatuses.value.find(s => s.id === Number(value))?.name || value;
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

        fetchOrders();
    };

    const fetchOrders = async () => {
        if (controller) controller.abort();
        controller = new AbortController();

        if (orders.value.length === 0) {
            loading.value = true;
        } else {
            fetching.value = true;
        }

        try {
            const { data } = await api.get<OrdersResponse>("/orders", {
                signal: controller.signal,
                params: {
                    page: pagination.value.page,
                    search: search.value,
                    sort_by: sortBy.value,
                    sort_dir: sortDir.value,
                    ...filters.value
                },
            });

            orders.value = data.data;
            paymentMethods.value = data.payment_methods;
            transportMethods.value = data.transport_methods;
            orderStatuses.value = data.order_statuses;

            pagination.value = {
                page: data.meta.current_page,
                per_page: data.meta.per_page,
                total: data.meta.total,
                last_page: data.meta.last_page,
            };

        } catch (e: any) {
            if (e.name === "CanceledError") return;
            console.error("Fetch orders failed", e);
        } finally {
            loading.value = false;
            fetching.value = false;
        }
    };

    const triggerFetch = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            pagination.value.page = 1;
            fetchOrders();
        }, 400);
    };

    watch(search, triggerFetch);
    watch(filters, triggerFetch, { deep: true });

    const goToPage = (page: number) => {
        if (page === pagination.value.page) return;
        pagination.value.page = page;
        fetching.value = true;
        fetchOrders();
    };

    const handleSort = (payload: { sortBy: string; sortDir: "asc" | "desc" }) => {
        sortBy.value = payload.sortBy;
        sortDir.value = payload.sortDir;
        pagination.value.page = 1;
        fetching.value = true;
        fetchOrders();
    };

    onMounted(fetchOrders);

    return {
        orders,
        paymentMethods,
        transportMethods,
        orderStatuses,
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
        fetchOrders
    };
}