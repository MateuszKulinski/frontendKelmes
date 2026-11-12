<template>
    <div class="news-detail-view content-container">

        <div v-if="store.loading" class="loader-wrapper">
            <div class="spinner"></div>
        </div>

        <template v-else-if="store.singleNews">
            <p class="news-detail__date" v-if="store.singleNews.publish_date">
                {{ store.singleNews.publish_date }}
            </p>

            <h1 class="news-detail__title">{{ store.singleNews.title }}</h1>

            <img
                v-if="store.singleNews.image"
                :src="store.singleNews.image"
                :alt="store.singleNews.title ?? ''"
                class="news-detail__image"
            />

            <p
                v-if="store.singleNews.short_description"
                class="news-detail__lead"
            >
                {{ store.singleNews.short_description }}
            </p>

            <div
                v-if="store.singleNews.content"
                class="news-detail__content"
                v-html="store.singleNews.content"
            />

            <button class="news-detail__back" @click="router.push({ name: 'news.list' })">
                ← {{ t('common.back') }}
            </button>
        </template>

        <div v-else class="news-not-found">
            {{ t('common.not_found') }}
        </div>

    </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useNewsStore } from '@/core/stores/newsStore';
import { useLangStore } from '@/core/stores/langStore';
import { getIdFromSlug } from '@/core/utils/slug';

const { t }     = useI18n();
const route     = useRoute();
const router    = useRouter();
const store     = useNewsStore();
const langStore = useLangStore();

const load = async () => {
    const idSlug = route.params.idSlug as string;
    const id     = getIdFromSlug(idSlug);

    if (!id) return router.replace('/404');

    // Pobierz news po samym ID – backend zwraca slug dla bieżącego języka (X-Lang-Id w nagłówku)
    const news = await store.fetchById(id);

    if (!news) return router.replace('/404');

    // Dynamicznie aktualizuj slug w URL do slug-a z aktualnego języka
    const currentSlug = news.slug ?? String(news.id);
    const expectedParam = `${news.id}-${currentSlug}`;

    if (idSlug !== expectedParam) {
        return router.replace({
            name: 'news.detail',
            params: { idSlug: expectedParam },
        });
    }
};

onMounted(load);
watch(() => route.params.idSlug, load);
watch(() => langStore.current, load);
</script>

<style scoped>
.news-detail__date {
    font-size: 0.85rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
}

.news-detail__title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1.25rem;
    line-height: 1.3;
}

.news-detail__image {
    width: 100%;
    max-height: 480px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1.5rem;
}

.news-detail__lead {
    font-size: 1.1rem;
    color: #374151;
    font-weight: 500;
    margin-bottom: 1.5rem;
    border-left: 4px solid #3b82f6;
    padding-left: 1rem;
}

.news-detail__content {
    font-size: 1rem;
    line-height: 1.8;
    color: #1f2937;
    margin-bottom: 2rem;
}

.news-detail__back {
    background: none;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: #374151;
    transition: background 0.15s;
}

.news-detail__back:hover { background: #f3f4f6; }

.loader-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
