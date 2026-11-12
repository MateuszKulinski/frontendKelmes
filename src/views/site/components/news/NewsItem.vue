<template>
    <div class="news-item">
        <router-link :to="newsLink" class="news-item__image">
            <img :src="item.image.replace(
                'http://127.0.0.1:8000',
                'https://cliply-test-b2b.exis24.pl'
            )" :alt="item.title">
        </router-link>

        <div class="news-item__date">
            {{ item.publish_date }}
        </div>

        <div v-if="item.category" class="news-item__category">
            {{ item.category.title }}
        </div>

        <router-link :to="newsLink" class="news-item__title">
            {{ item.title }}
        </router-link>

        <div class="news-item__description">
            {{ item.short_description }}
        </div>

        <router-link :to="newsLink" class="news-item__more">
            Czytaj dalej >
        </router-link>
    </div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
});
const newsLink = computed(() => ({
    name: 'news.detail',
    params: { idSlug: `${props.item.id}-${props.item.slug || props.item.id}` },
}));
</script>

<style scoped>
.news-item {
    display: flex;
    flex-direction: column;
    gap: var(--gap-ex-sm)
}

.news-item__image {
    display: block;
    overflow: hidden;
    border-radius: var(--radius-sm);
}

.news-item__image img {
    width: 100%;
    height: 220px;
    object-fit: cover;
    display: block;
    transition: .25s;
}

.news-item__image:hover img {
    transform: scale(1.05);
}

.news-item__date {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.news-item__category {
    color: var(--accent);
    font-size: var(--font-size-sm);
    font-weight: 600;
}

.news-item__title {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    overflow: hidden;
    text-overflow: ellipsis;

    color: var(--text-primary);
    font-size: var(--font-size-md-minus);
    font-weight: 600;
    text-decoration: none;
    line-height: 1.3;

    /* 2 * 1.3em */
    min-height: calc(2 * 1.3em);
}

.news-item__title:hover {
    color: var(--accent);
}

.news-item__description {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;

    overflow: hidden;
    text-overflow: ellipsis;

    color: var(--text-secondary);
    line-height: 1.6;

    /* 3 * 1.6em */
    min-height: calc(3 * 1.6em);

    flex: 1;
    font-size: var(--font-size-sm-plus)
}

.news-item__more {
    color: var(--accent);
    text-decoration: none;
    font-size: var(--font-size-sm);
}

.news-item__more:hover {
    text-decoration: underline;
}
</style>
