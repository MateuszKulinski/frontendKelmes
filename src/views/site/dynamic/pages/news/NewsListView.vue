<template>
    <div class="news-list-view content-container">
        <h1>{{ t('news.title_list') }}</h1>

        <div v-if="store.loading" class="loader-wrapper">
            <div class="spinner"></div>
        </div>

        <template v-else>
            <div v-if="!store.newsList.length" class="news-empty">
                {{ t('common.no_results') }}
            </div>

            <div v-else class="news-grid">
                <NewsItem v-for="item in store.newsList" :key="item.id" :item="item" />
            </div>

            <CategoryPagination v-if="store.lastPage > 1" :page="store.page" :per-page="20" :total="store.total"
                :last-page="store.lastPage" :disabled="store.loading" @change="loadPage" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useNewsStore } from '@/core/stores/newsStore'
import { useLangStore } from '@/core/stores/langStore'

import CategoryPagination from '@/views/site/components/category/CategoryPagination/CategoryPagination.vue'
import NewsItem from '@/views/site/components/news/NewsItem.vue'

const { t } = useI18n()

const route = useRoute()
const store = useNewsStore()
const langStore = useLangStore()

const loadPage = (page: number) => {
    const categoryId = Number(route.query.category_id)

    return categoryId > 0
        ? store.fetchForCategory(categoryId, page)
        : store.fetchAll(page)
}

const load = () => {
    return loadPage(1)
}

onMounted(load)

watch(
    () => langStore.current,
    load,
)

watch(
    () => route.query.category_id,
    load,
)
</script>

<style scoped>
.news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
}

.news-empty {
    margin-top: 2rem;
    color: var(--text-secondary);
    text-align: center;
}

.loader-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-default);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>