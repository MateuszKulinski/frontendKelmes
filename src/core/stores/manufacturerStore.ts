import { defineStore } from 'pinia';
import api from '@/core/api/axios';
import type {
    ManufacturerListItem,
    ManufacturerDetail,
    ManufacturerListResponse,
} from '@/composables/types/manufacturer';

export const useManufacturerStore = defineStore('manufacturer', {
    state: () => ({
        list: [] as ManufacturerListItem[],
        listLoading: false,
        pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
    }),

    actions: {
        async fetchList(params: Record<string, any> = {}): Promise<void> {
            this.listLoading = true;
            try {
                const { data } = await api.get<ManufacturerListResponse>('/settings/manufacturers', { params });
                this.list = data.data;
                this.pagination = data.meta;
            } catch {
                this.list = [];
            } finally {
                this.listLoading = false;
            }
        },

        async fetchOne(id: number): Promise<ManufacturerDetail | null> {
            try {
                const { data } = await api.get<{ data: ManufacturerDetail }>(`/settings/manufacturers/${id}`);
                return data.data;
            } catch {
                return null;
            }
        },

        async create(payload: Record<string, any>): Promise<ManufacturerDetail | null> {
            const { data } = await api.post<{ data: ManufacturerDetail }>('/settings/manufacturers', payload);
            return data.data;
        },

        async update(id: number, payload: Record<string, any>): Promise<ManufacturerDetail | null> {
            const { data } = await api.post<{ data: ManufacturerDetail }>(`/settings/manufacturers/${id}`, payload);
            return data.data;
        },

        async updateOnPage(id: number, isOnPage: boolean): Promise<void> {
            await api.put(`/settings/manufacturers/${id}/settings`, {
                is_on_page: isOnPage,
            });
        },

        async remove(id: number): Promise<void> {
            await api.delete(`/settings/manufacturers/${id}`);
            this.list = this.list.filter(item => item.id !== id);
        },

        async uploadLogo(id: number, file: File): Promise<string> {
            const formData = new FormData();
            formData.append('logo', file);
            const { data } = await api.post<{ logo_url: string }>(
                `/settings/manufacturers/${id}/logo`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            const item = this.list.find(m => m.id === id);
            if (item) {
                item.has_logo = true;
                item.logo_url = data.logo_url;
            }
            return data.logo_url;
        },
    },
});
