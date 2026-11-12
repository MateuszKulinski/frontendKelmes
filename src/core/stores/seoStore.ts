import { defineStore } from 'pinia';
import api from '@/core/api/axios';
import type {
    SeoEntityType,
    SeoListResponse,
    SeoRecord,
    SeoUpdatePayload,
} from '@/composables/types/seo';

export const useSeoStore = defineStore('seo', {
    state: () => ({
        records: [] as SeoRecord[],
        loading: false,
        pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 25,
            total: 0,
        },
    }),

    actions: {
        async fetchList(params: Record<string, string | number | undefined>): Promise<void> {
            this.loading = true;

            try {
                const { data } = await api.get<SeoListResponse>('/settings/seo', { params });
                this.records = data.data;
                this.pagination = data.meta;
            } finally {
                this.loading = false;
            }
        },

        async update(
            type: SeoEntityType,
            id: number,
            payload: SeoUpdatePayload,
        ): Promise<SeoRecord> {
            const { data } = await api.patch<{ data: SeoRecord }>(
                `/settings/seo/${type}/${id}`,
                payload,
            );

            this.replaceRecords([data.data]);

            return data.data;
        },

        async generate(type: SeoEntityType, ids: number[], langIds: number[]): Promise<number> {
            const { data } = await api.post<{ updated_count: number }>(
                '/settings/seo/generate',
                { type, ids, lang_ids: langIds },
            );
            return data.updated_count;
        },

        replaceRecords(updated: SeoRecord[]): void {
            const byId = new Map(updated.map(record => [record.id, record]));
            this.records = this.records.map(record => byId.get(record.id) ?? record);
        },
    },
});
