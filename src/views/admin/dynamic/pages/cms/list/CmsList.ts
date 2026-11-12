import { ref, onMounted, watch } from 'vue';
import { useCmsStore } from '@/core/stores/cmsStore';

export function useCmsList() {
    const store = useCmsStore();

    const fetching = ref(false);

    const filters = ref({
        is_active: '' as '' | '0' | '1',
    });

    const sortBy  = ref('id');
    const sortDir = ref<'asc' | 'desc'>('asc');

    const page = ref(1);

    const fetchCms = async () => {
        fetching.value = true;
        try {
            await store.fetchList({
                sort_by:  sortBy.value,
                sort_dir: sortDir.value,
                page:     page.value,
                per_page: store.pagination.per_page,
                ...Object.fromEntries(
                    Object.entries(filters.value).filter(([, v]) => v !== '')
                ),
            });
        } finally {
            fetching.value = false;
        }
    };

    const changePage = (p: number) => {
        page.value = p;
        fetchCms();
    };

    const changeSort = (payload: { sortBy: string; sortDir: 'asc' | 'desc' }) => {
        sortBy.value  = payload.sortBy;
        sortDir.value = payload.sortDir;
        fetchCms();
    };

    const resetFilters = () => {
        filters.value = { is_active: '' };
        page.value = 1;
        fetchCms();
    };

    onMounted(fetchCms);

    watch(filters, () => {
        page.value = 1;
        fetchCms();
    }, { deep: true });

    return {
        store,
        fetching,
        filters,
        sortBy,
        sortDir,
        page,
        fetchCms,
        changePage,
        changeSort,
        resetFilters,
    };
}
