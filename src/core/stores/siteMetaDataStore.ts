import { defineStore } from 'pinia';
import api from '@/core/api/axios';
import type {
    SiteMetaDataListResponse,
    SiteMetaDataPayload,
    SiteMetaDataRecord,
} from '@/composables/types/siteMetaData';

export const useSiteMetaDataStore = defineStore('siteMetaData', {
    state: () => ({
        records: [] as SiteMetaDataRecord[],
        loading: false,
        pagination: { current_page: 1, last_page: 1, per_page: 25, total: 0 },
    }),

    actions: {
        async fetchList(params: Record<string, string | number | undefined>, signal: AbortSignal): Promise<void> {
            this.loading = true;
            try {
                const { data } = await api.get<SiteMetaDataListResponse>('/settings/site-meta-data', {
                    params,
                    signal,
                });
                if (signal.aborted) return;
                this.records = data.data;
                this.pagination = data.meta;
            } finally {
                if (!signal.aborted) this.loading = false;
            }
        },

        async create(payload: SiteMetaDataPayload): Promise<SiteMetaDataRecord> {
            const { data } = await api.post<{ data: SiteMetaDataRecord }>('/settings/site-meta-data', payload);
            return data.data;
        },

        async update(id: number, payload: SiteMetaDataPayload): Promise<SiteMetaDataRecord> {
            const { data } = await api.put<{ data: SiteMetaDataRecord }>(`/settings/site-meta-data/${id}`, payload);
            return data.data;
        },
    },
});
