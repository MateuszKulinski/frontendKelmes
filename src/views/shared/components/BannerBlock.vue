<template>
    <div v-if="banners.length" class="banner-block d-flex"
        :class="{ 'category': type === 'category', 'cms': type === 'cms', 'product': type === 'product', 'more-banners': banners.length > 1 }">
        <a v-for="banner in banners" :key="banner.id" :href="banner.link ?? undefined"
            :target="banner.target_blank ? '_blank' : '_self'" class="banner-item"
            :class="{ 'banner-item--no-link': !banner.link, 'col-md-12': banners.length === 1, 'col-md-6': banners.length === 2, 'col-md-4': banners.length >= 3 }">
            <picture>
                <source v-if="banner.mobile_image" :srcset="banner.mobile_image" media="(max-width: 768px)" />
                <img v-if="banner.image" :src="banner.image" :alt="banner.title ?? ''" class="banner-img" />
            </picture>

            <div v-if="(showTitle && banner.title) || banner.subtitle || banner.description || banner.button_text"
                class="banner-content">
                <img v-if="logo?.logo" :src="logo.logo" alt="logo" class="banner-logo" />
                <h2 v-if="showTitle && banner.title" class="banner-title">{{ banner.title }}</h2>
                <p v-if="banner.subtitle" class="banner-subtitle">{{ banner.subtitle }}</p>
                <p v-if="banner.description" class="banner-description">{{ banner.description }}</p>
                <span v-if="banner.button_text" class="banner-btn">{{ banner.button_text }}</span>
            </div>
        </a>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useBannerStore } from '@/core/stores/bannerStore';
import type { Banner, Logo } from '@/composables/types/banner';

const props = withDefaults(defineProps<{
    type: 'category' | 'cms' | 'product' | 'manufacturer' | 'unset';
    contextId: number;
    showTitle?: boolean;
}>(), { showTitle: true });

const bannerStore = useBannerStore();
const banners = ref<Banner[]>([]);
const logo = ref<Logo | null>(null);

async function load() {
    if (!props.contextId) return;

    if (props.type === 'category') {
        const response = await bannerStore.fetchForCategory(props.contextId);
        banners.value = response.banners;
        logo.value = response.logo;
    } else if (props.type === 'cms') {
        banners.value = await bannerStore.fetchForCms(props.contextId);
    } else if (props.type === 'product') {
        banners.value = await bannerStore.fetchForProduct(props.contextId);
    } else if (props.type === 'unset') {
        banners.value = await bannerStore.fetchById(props.contextId);
    }
}

onMounted(load);
watch(() => [props.type, props.contextId], load);

defineExpose({ logo });
</script>

<style scoped>
.banner-logo {
    max-height: 20px;
    width: auto;
    max-width: fit-content;
}

.banner-item {
    display: block;
    position: relative;
    overflow: hidden;
    text-decoration: none;
}

.more-banners .banner-item {
    padding: 0 var(--padding-md);
}

.category .banner-content {
    position: absolute;
    display: flex;
    flex-direction: column;
}

.category .banner-item {
    pointer-events: none;
    padding: 0 !important;
}

.category.banner-block {
    margin-bottom: var(--margin-lg);
}

.category .banner-btn {
    display: none;
}

.banner-item--no-link {
    pointer-events: none;
}

.banner-img {
    width: 100%;
    height: auto;
    display: block;
    max-height: 300px;
    object-fit: cover;
    border-radius: var(--radius-sm);
}

.banner-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: var(--padding-lg);
    color: #000;
}

.banner-content>* {
    margin: 0;
}

.banner-title {
    font-size: var(--font-size-extra);
    font-weight: 700;
    line-height: 60px;
}

.banner-subtitle {
    font-size: var(--font-size-lg);
    line-height: 27px;
}

.banner-description {
    font-size: var(--font-size-lg);
    line-height: 27px;
}

.banner-btn {
    display: inline-block;
    margin-top: 0.5rem;
    padding: 0.4rem 1rem;
    background: #fff;
    color: #333;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: var(--font-size-md);
}
</style>
