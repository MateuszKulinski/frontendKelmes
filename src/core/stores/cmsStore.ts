import { defineStore } from 'pinia';
import api from '@/core/api/axios';
import type {
    CmsPage,
    CmsListItem,
    CmsDetail,
    CmsListResponse,
} from '@/composables/types/cms';

export const useCmsStore = defineStore('cms', {
    state: () => ({
        // ─── Public ───────────────────────────────────────
        currentPage: null as CmsPage | null,
        pageLoading: false,
        pagesById: {} as Record<number, CmsPage>,
        loadingById: {} as Record<number, boolean>,

        // ─── Admin ────────────────────────────────────────
        list: [] as CmsListItem[],
        listLoading: false,
        pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
    }),

    actions: {
        // ─── Public ───────────────────────────────────────

        async fetchById(id: number): Promise<CmsPage | null> {
            this.pageLoading = true;
            this.loadingById[id] = true;
            try {
                // Używa istniejącego endpointu /content/{type}/{id} – zwraca płaski obiekt
                const { data } = await api.get<CmsPage>(`/content/cms/${id}`);
                this.currentPage = data;
                this.pagesById[id] = data;
                return data;
            } catch {
                this.currentPage = null;
                return null;
            } finally {
                this.pageLoading = false;
                this.loadingById[id] = false;
            }
        },

        // ─── Admin ────────────────────────────────────────

        async fetchList(params: Record<string, any> = {}): Promise<void> {
            this.listLoading = true;
            try {
                const { data } = await api.get<CmsListResponse>('/settings/cms', { params });
                this.list = data.data;
                this.pagination = data.meta;
            } catch {
                this.list = [];
            } finally {
                this.listLoading = false;
            }
        },

        async fetchOne(id: number): Promise<CmsDetail | null> {
            try {
                const { data } = await api.get<{ data: CmsDetail }>(`/settings/cms/${id}`);
                return data.data;
            } catch {
                return null;
            }
        },

        async create(payload: Record<string, any>): Promise<CmsDetail | null> {
            const { data } = await api.post<{ data: CmsDetail }>('/settings/cms', payload);
            return data.data;
        },

        async update(id: number, payload: Record<string, any>): Promise<CmsDetail | null> {
            const { data } = await api.post<{ data: CmsDetail }>(`/settings/cms/${id}`, payload);
            return data.data;
        },

        async remove(id: number): Promise<void> {
            await api.delete(`/settings/cms/${id}`);
            this.list = this.list.filter(item => item.id !== id);
        },
    },
});
