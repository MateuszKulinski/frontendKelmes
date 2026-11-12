import { ref, onMounted, watch, computed } from "vue";
import api from "@/core/api/axios";

import type {
    UserListItem,
    UserFilters,
    UsersResponse,
    PermissionOption
} from "@entities/user";

export function useUserView() {
    let controller: AbortController | null = null;
    let timeout: any = null;

    const users = ref<UserListItem[]>([]);
    const permissions = ref<PermissionOption[]>([]);

    const loading = ref(true);
    const fetching = ref(false);

    const search = ref("");

    const filters = ref<UserFilters>({
        email: "",
        firstname: "",
        lastname: "",
        unit: "",
        permission_id: "",
        is_active: "",
    });

    const sortBy = ref("id");
    const sortDir = ref<"asc" | "desc">("desc");

    const pagination = ref({
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    });

    type FilterKey = keyof UserFilters;

    const activeFilters = computed(() => {
        const result: { key: string; label: string; value: string }[] = [];

        if (search.value) {
            result.push({
                key: "search",
                label: "Login",
                value: search.value,
            });
        }

        (Object.entries(filters.value) as [FilterKey, UserFilters[FilterKey]][]).forEach(([key, value]) => {
            if (value === "" || value === null) return;

            let displayValue = String(value);

            if (key === "is_active") {
                displayValue = value ? "Aktywny" : "Nieaktywny";
            }

            if (key === "permission_id") {
                const found = permissions.value.find(p => p.id === Number(value));
                if (found) displayValue = found.display_name;
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

        fetchUsers();
    };

    const fetchUsers = async () => {
        if (controller) controller.abort();
        controller = new AbortController();

        if (users.value.length === 0) {
            loading.value = true;
        } else {
            fetching.value = true;
        }

        try {
            const { data } = await api.get<UsersResponse>("/users", {
                signal: controller.signal,
                params: {
                    page: pagination.value.page,
                    search: search.value,
                    sort_by: sortBy.value,
                    sort_dir: sortDir.value,
                    ...filters.value,
                },
            });

            users.value = data.data;
            permissions.value = data.permissions;

            pagination.value = {
                page: data.meta.current_page,
                per_page: data.meta.per_page,
                total: data.meta.total,
                last_page: data.meta.last_page,
            };
        } catch (e: any) {
            if (e.name === "CanceledError") return;
            console.error("Fetch users failed", e);
        } finally {
            loading.value = false;
            fetching.value = false;
        }
    };

    const triggerFetch = () => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            pagination.value.page = 1;
            fetchUsers();
        }, 400);
    };

    watch(search, triggerFetch);
    watch(filters, triggerFetch, { deep: true });

    const goToPage = (page: number) => {
        if (page === pagination.value.page) return;

        pagination.value.page = page;
        fetching.value = true;

        fetchUsers();
    };

    const handleSort = (payload: { sortBy: string; sortDir: "asc" | "desc" }) => {
        sortBy.value = payload.sortBy;
        sortDir.value = payload.sortDir;
        pagination.value.page = 1;
        fetching.value = true;
        fetchUsers();
    };

    onMounted(fetchUsers);

    return {
        users,
        permissions,
        loading,
        fetching,
        pagination,
        search,
        filters,
        goToPage,
        sortBy,
        sortDir,
        handleSort,
        activeFilters,
        clearSingleFilter,
        resetFilters,
        fetchUsers
    };
}