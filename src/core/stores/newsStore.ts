import { defineStore } from 'pinia';
import api from '@/core/api/axios';
import type { NewsItem } from '@/composables/indexStore';


export const useNewsStore = defineStore('news', {
    state: () => ({
        newsList: [] as NewsItem[],
        singleNews: null as NewsItem | null,
        loading: false,
        page: 1,
        lastPage: 1,
        total: 0,
    }),

    actions: {
        // Pobieranie ogólnej listy aktualności
        async fetchAll(page: number = 1): Promise<NewsItem[]> {
            return this._fetchList(`/content/news?page=${page}`);
        },

        // Pobieranie aktualności dla wybranej kategorii
        async fetchForCategory(categoryId: number, page: number = 1): Promise<NewsItem[]> {
            return this._fetchList(`/content/news?category_id=${categoryId}&page=${page}`);
        },

        // Pobieranie jednego artykułu po ID (slug w URL jest dynamiczny – aktualizowany po pobraniu)
        async fetchById(id: number): Promise<NewsItem | null> {
            this.loading = true;
            try {
                // Axios automatycznie doklei nagłówek "X-Lang-Id" – backend zwróci slug bieżącego języka
                const { data } = await api.get<{ data: NewsItem }>(`/content/news/${id}`);
                this.singleNews = data.data;
                return data.data;
            } catch {
                this.singleNews = null;
                return null;
            } finally {
                this.loading = false;
            }
        },

        // Wspólny pomocnik do list
        async _fetchList(url: string): Promise<NewsItem[]> {
            this.loading = true;
            try {
                const { data } = await api.get<{
                    data: NewsItem[];
                    meta?: { current_page: number; last_page: number; total: number };
                }>(url);
                this.newsList = data.data;
                this.page = data.meta?.current_page ?? 1;
                this.lastPage = data.meta?.last_page ?? 1;
                this.total = data.meta?.total ?? data.data.length;
                return data.data;
            } catch {
                this.newsList = [];
                return [];
            } finally {
                this.loading = false;
            }
        },
    },
});
