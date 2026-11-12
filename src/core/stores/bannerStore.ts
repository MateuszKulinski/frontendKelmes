import { defineStore } from 'pinia';
import api from '@/core/api/axios';
import type { Banner, BannersByCategoryResponse } from '@/composables/types/banner';

export const useBannerStore = defineStore('banner', {
    state: () => ({
        banners: [] as Banner[],
        loading: false,
    }),

    actions: {
        async fetchById(bannerId: number): Promise<Banner[]> {
            this.loading = true;
            try {
                const { data } = await api.get<{ data: Banner }>(`/content/banner-by-id/${bannerId}`);
                const banners = data.data ? [data.data] : [];
                this.banners = banners;
                return banners;
            } catch {
                this.banners = [];
                return [];
            } finally {
                this.loading = false;
            }
        },

        async fetchForCategory(categoryId: number): Promise<BannersByCategoryResponse> {
            this.loading = true;
            try {
                const { data } = await api.get<BannersByCategoryResponse>(`/content/banners/category/${categoryId}`);
                this.banners = data.banners;
                return data;
            } catch {
                this.banners = [];
                return { banners: [], logo: { logo: null, logo_dark: null } };
            } finally {
                this.loading = false;
            }
        },

        async fetchForCms(cmsId: number): Promise<Banner[]> {
            return this._fetch(`/content/banners/cms/${cmsId}`);
        },

        async fetchForProduct(productId: number): Promise<Banner[]> {
            return this._fetch(`/content/banners/product/${productId}`);
        },

        async _fetch(url: string): Promise<Banner[]> {
            this.loading = true;
            try {
                const { data } = await api.get<Banner[]>(url);
                this.banners = data;
                return data;
            } catch {
                this.banners = [];
                return [];
            } finally {
                this.loading = false;
            }
        },
    },
});
