import { defineStore } from 'pinia';
import api from '@/core/api/axios';
import type {
    SliderListItem,
    SliderDetail,
    SliderListResponse,
} from '@/composables/types/slider';

export const useSliderAdminStore = defineStore('sliderAdmin', {
    state: () => ({
        list: [] as SliderListItem[],
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
                const { data } = await api.get<SliderListResponse>('/settings/sliders', { params });
                this.list = data.data;
                this.pagination = data.meta;
            } catch {
                this.list = [];
            } finally {
                this.listLoading = false;
            }
        },

        async fetchOne(id: number): Promise<SliderDetail | null> {
            try {
                const { data } = await api.get<{ data: SliderDetail }>(`/settings/sliders/${id}`);
                return data.data;
            } catch {
                return null;
            }
        },

        async create(formData: FormData): Promise<SliderDetail | null> {
            const { data } = await api.post<{ data: SliderDetail }>('/settings/sliders', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data.data;
        },

        async update(id: number, formData: FormData): Promise<SliderDetail | null> {
            const { data } = await api.post<{ data: SliderDetail }>(`/settings/sliders/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data.data;
        },

        async remove(id: number): Promise<void> {
            await api.delete(`/settings/sliders/${id}`);
            this.list = this.list.filter(item => item.id !== id);
        },
    },
});
