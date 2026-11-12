import { ref, onMounted, watch } from 'vue';
import { useSliderAdminStore } from '@/core/stores/sliderAdminStore';

export function useSliderList() {
    const store = useSliderAdminStore();

    const fetching = ref(false);

    const filters = ref({
        is_active: '' as '' | '0' | '1',
    });

    const sortBy  = ref('sort_order');
    const sortDir = ref<'asc' | 'desc'>('asc');
    const page    = ref(1);

    const fetchSliders = async () => {
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
        fetchSliders();
    };

    const changeSort = (payload: { sortBy: string; sortDir: 'asc' | 'desc' }) => {
        sortBy.value  = payload.sortBy;
        sortDir.value = payload.sortDir;
        fetchSliders();
    };

    onMounted(fetchSliders);

    watch(filters, () => {
        page.value = 1;
        fetchSliders();
    }, { deep: true });

    return { store, fetching, filters, sortBy, sortDir, page, changePage, changeSort };
}
