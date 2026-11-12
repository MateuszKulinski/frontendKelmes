import { ref, onMounted, watch } from 'vue';
import api from '@/core/api/axios';
import type { BannerListItem, BannersResponse } from '@/composables/types/banner';

export function useBannersList() {

    let controller: AbortController | null = null;

    const banners  = ref<BannerListItem[]>([]);
    const loading  = ref(true);
    const fetching = ref(false);

    const filters = ref({
        is_active: '' as '' | '0' | '1',
    });

    const sortBy  = ref('created_at');
    const sortDir = ref<'asc' | 'desc'>('desc');

    const pagination = ref({
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    });

    const fetchBanners = async () => {
        if (controller) controller.abort();
        controller = new AbortController();

        if (banners.value.length === 0) loading.value = true;
        else fetching.value = true;

        try {
            const { data } = await api.get<BannersResponse>('/settings/banners', {
                params: {
                    sort_by:  sortBy.value,
                    sort_dir: sortDir.value,
                    page:     pagination.value.page,
                    per_page: pagination.value.per_page,
                    ...Object.fromEntries(
                        Object.entries(filters.value).filter(([, v]) => v !== '')
                    ),
                },
                signal: controller.signal,
            });

            banners.value           = data.data;
            pagination.value.total     = data.meta.total;
            pagination.value.last_page = data.meta.last_page;
        } catch (e: any) {
            if (e.name !== 'CanceledError') console.error(e);
        } finally {
            loading.value  = false;
            fetching.value = false;
        }
    };

    const changePage = (page: number) => {
        pagination.value.page = page;
        fetchBanners();
    };

    const changeSort = (payload: { sortBy: string; sortDir: 'asc' | 'desc' }) => {
        sortBy.value  = payload.sortBy;
        sortDir.value = payload.sortDir;
        fetchBanners();
    };

    const resetFilters = () => {
        filters.value = { is_active: '' };
        pagination.value.page = 1;
        fetchBanners();
    };

    onMounted(fetchBanners);

    watch(filters, () => {
        pagination.value.page = 1;
        fetchBanners();
    }, { deep: true });

    return {
        banners,
        loading,
        fetching,
        filters,
        sortBy,
        sortDir,
        pagination,
        fetchBanners,
        changePage,
        changeSort,
        resetFilters,
    };
}
