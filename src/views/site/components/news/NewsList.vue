<template>
    <section v-if="data && data.articles?.length" class="news-list">
        <div class="news-list__header">
            <div>
                <h2>{{ data.title }}</h2>
                <!-- <p v-if="data.short_description">{{ data.short_description }}</p> -->
            </div>

            <router-link :to="{ name: 'news.list' }" class="news-list__all">
                Zobacz wszystkie artykuły >
            </router-link>
        </div>

        <div v-if="carousel" class="news-list__carousel">
            <button ref="prevEl" type="button" class="news-list__nav"
                :aria-label="t('news.previous_articles')">‹</button>
            <div ref="swiperEl" class="swiper news-list__swiper">
                <div class="swiper-wrapper">
                    <div v-for="article in data.articles" :key="article.id" class="swiper-slide">
                        <NewsItem :item="article" />
                    </div>
                </div>
            </div>
            <button ref="nextEl" type="button" class="news-list__nav" :aria-label="t('news.next_articles')">›</button>
        </div>
        <div v-else class="news-list__items">
            <NewsItem v-for="article in data.articles" :key="article.id" :item="article" />
        </div>
    </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Swiper from 'swiper'
import { Navigation } from 'swiper/modules'
import 'swiper/swiper-bundle.css'
import NewsItem from './NewsItem.vue';

defineProps<{ data: any; carousel?: boolean }>()
const { t } = useI18n()
const swiperEl = ref<HTMLElement | null>(null)
const prevEl = ref<HTMLElement | null>(null)
const nextEl = ref<HTMLElement | null>(null)
let swiper: Swiper | null = null
onMounted(() => {
    if (!swiperEl.value || !prevEl.value || !nextEl.value) return
    swiper = new Swiper(swiperEl.value, {
        modules: [Navigation], slidesPerView: 1, spaceBetween: 16,
        navigation: { prevEl: prevEl.value, nextEl: nextEl.value },
        breakpoints: {
            576: { slidesPerView: 2 },
            900: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
        },
    })
})
onBeforeUnmount(() => swiper?.destroy(true, true))
</script>

<style scoped>
.news-list {
    margin-top: var(--margin-xxl);
    padding: var(--padding-xl);
    border: 1px solid var(--border-default);

    border-radius: var(--radius-sm);
}

.news-list__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--margin-lg);
    gap: 20px;
}

.news-list__header h2 {
    color: var(--text-primary);
    font-size: var(--font-size-lg-plus);
}

.news-list__header p {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--font-size-md);
}

.news-list__all {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: var(--font-size-md);
}

.news-list__all:hover {
    text-decoration: underline;
}

.news-list__items {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
}

.news-list__carousel {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

.news-list__swiper {
    min-width: 0;
    flex: 1;
}

.news-list__nav {
    flex: 0 0 32px;
    height: 32px;
    border: 0;
    border-radius: 50%;
    background: var(--accent);
    color: #fff;
    font-size: 22px;
    line-height: 1;
}

.news-list__nav.swiper-button-disabled {
    opacity: .4;
    cursor: default;
}

@media (max-width: 1200px) {
    .news-list__items {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .news-list {
        padding: var(--padding-md);
    }

    .news-list__header {
        flex-direction: column;
        align-items: flex-start;
    }

    .news-list__items {
        grid-template-columns: 1fr;
    }
}
</style>
