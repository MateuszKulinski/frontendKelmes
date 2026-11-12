<template>
    <section v-if="smallBanners.length" class="multiple-items">
        <div v-for="banner in smallBanners" :key="banner.id">
            <div class="item-content-box">
                <picture>
                    <source v-if="banner.mobile_image" :srcset="banner.mobile_image" media="(max-width: 768px)" />
                    <img v-if="banner.image" :src="banner.image" :alt="banner.title ?? ''" />
                </picture>
                <div class="item-box">
                    <span class="homepage-item-title" v-if="banner.title">{{ banner.title }}</span>
                    <a v-if="banner.link" :href="banner.link" :target="banner.target_blank ? '_blank' : '_self'"
                        class="more">
                        {{ banner.button_text || 'Zobacz więcej' }}
                        <BaseIcon name='arrowRight' />
                    </a>
                </div>
            </div>
        </div>
    </section>
    <section v-if="largeBanner" class="single-item large-banner">
        <div class="item-content-box">
            <picture>
                <source v-if="largeBanner.mobile_image" :srcset="largeBanner.mobile_image" media="(max-width: 768px)" />
                <img v-if="largeBanner.image" :src="largeBanner.image" :alt="largeBanner.title ?? ''" />
            </picture>
            <div class="large-banner-content">
                <h2 v-if="largeBanner.title" class="large-banner-title">{{ largeBanner.title }}</h2>
                <p v-if="largeBanner.subtitle" class="large-banner-subtitle">{{ largeBanner.subtitle }}</p>
                <a v-if="largeBanner.link" :href="largeBanner.link"
                    :target="largeBanner.target_blank ? '_blank' : '_self'" class="large-banner-button">
                    {{ largeBanner.button_text || 'Zobacz więcej' }}
                    <BaseIcon name="arrowRight" />
                </a>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Banner } from '@/composables/types/banner';
import BaseIcon from '@/views/shared/ui/BaseIcon.vue';

const props = defineProps<{
    banners: Banner[];
}>();

const smallBanners = computed(() => props.banners.slice(0, 4));
const largeBanner = computed(() => props.banners.length > 4 ? props.banners[props.banners.length - 1] : null);
</script>
<style scoped>
.item-content-box {
    position: relative;
    display: inline-block;
}

.item-content-box>picture,
.item-content-box>picture img {
    width: 100%;
    display: block;
}

.item-content-box>picture img {
    max-height: 300px;
    object-fit: cover;
    object-position: bottom;
    border-radius: 15px;
}

.homepage-item-title {
    font-size: 28px;
    font-weight: 600;
    color: #fff;
}

.more {
    font-size: 16px;
    font-weight: 500;
    color: #fff;
    text-decoration: none;
    display: flex;
    gap: 5px;
    align-items: flex-end;
}

.more i {
    font-size: 19px;
}

.item-box {
    position: absolute;
    bottom: 25px;
    left: 35px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.single-item .item-content-box {
    display: block;
    width: 100%;
}

.large-banner .item-content-box>picture img {
    max-height: none;
    object-fit: contain;
    object-position: center;
}

.large-banner-content {
    position: absolute;
    top: 50%;
    left: 60%;
    right: 5%;
    right: 3%;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 1vw, 18px);
    transform: translateY(-50%);
    max-width: 35%;
}

.large-banner-title {
    margin: 0;
    color: #fff;
    font-size: clamp(28px, 3.5vw, 68px);
    font-weight: 700;
    line-height: 1.1;
}

.large-banner-subtitle {
    margin: 0;
    color: #dceaff;
    font-size: clamp(14px, 1.35vw, 26px);
    line-height: 1.35;
}

.large-banner-button {
    align-self: flex-end;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-top: clamp(4px, 0.6vw, 12px);
    padding: clamp(10px, 1vw, 18px) clamp(18px, 1.7vw, 34px);
    border-radius: 16px;
    background: #fff;
    color: #1768dc;
    font-size: clamp(14px, 1.1vw, 21px);
    font-weight: 700;
    text-decoration: none;
    text-transform: uppercase;
    transition: background-color 160ms ease, color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.large-banner-button:hover {
    background: #1768dc;
    color: #fff;
    box-shadow: 0 6px 18px rgb(0 0 0 / 18%);
    transform: translateY(-2px);
}

.multiple-items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 33px 56px;
}

.multiple-items .item-content-box {
    display: block;
    width: 100%;
}

@media (max-width: 760px) {
    .multiple-items {
        display: flex;
        flex-direction: column;
        gap: var(--gap-md);
    }

    .large-banner-content {
        left: 54%;
        right: 3%;
        gap: 6px;
    }

    .large-banner-title {
        font-size: clamp(20px, 4vw, 30px);
    }

    .large-banner-subtitle {
        font-size: clamp(10px, 1.8vw, 14px);
    }

    .large-banner-button {
        gap: 4px;
        padding: 6px 10px;
        border-radius: 10px;
        font-size: clamp(9px, 1.6vw, 12px);
    }
}
</style>