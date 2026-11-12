<template>
    <div id="slider">
        <div v-if="indexStore.loading" class="loader-wrapper">
            <div class="spinner"></div>
        </div>

        <div v-else-if="indexStore.error">{{ indexStore.error }}</div>

        <div v-else class="swiper" ref="swiperEl">
            <div class="swiper-wrapper">
                <div
                    v-for="item in indexStore.slider"
                    :key="item.id"
                    class="swiper-slide slider-slide"
                >
                    <img v-if="item.image" :src="item.image" :alt="item.title ?? ''" class="slider-image" :style="(item.content || item.title) ? { filter: 'brightness(0.8)' } : {}" />
                    <div class="slider-content" :class="{ 'only-button': !item.title && !item.content}">
                        <h2 class="slider-title" v-if="item.title">{{ item.title }}</h2>
                        <p v-if="item.content" class="slider-text">{{ item.content }}</p>
                        <BaseButton v-if="item.link && item.button_text" @click="navigate(item.link)" variant="secondary-bg" size="wide">
                            {{ item.button_text }}
                        </BaseButton>
                    </div>
                </div>
            </div>

            <!-- nawigacja -->
            <div class="swiper-button-prev slider-btn slider-btn--prev"></div>
            <div class="swiper-button-next slider-btn slider-btn--next"></div>
            <div class="swiper-pagination slider-pagination"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, nextTick } from "vue";
import Swiper from "swiper";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { useNavigation } from "@/composables/useNavigation";
import { useSliderView } from "./SliderView";
import BaseButton from "@/views/shared/ui/BaseButton.vue";

const { indexStore } = useSliderView();
const { goTo } = useNavigation();

const swiperEl = ref<HTMLElement | null>(null);
let swiperInstance: Swiper | null = null;

function initSwiper() {
    if (swiperInstance) {
        swiperInstance.destroy(true, true);
        swiperInstance = null;
    }
    if (!swiperEl.value) return;

    swiperInstance = new Swiper(swiperEl.value, {
        modules: [Navigation, Pagination, Autoplay],
        loop: true,
        autoplay: { delay: 5000, disableOnInteraction: false },
        navigation: {
            prevEl: ".slider-btn--prev",
            nextEl: ".slider-btn--next",
        },
        pagination: {
            el: ".slider-pagination",
            clickable: true,
        },
    });
}

// reinicjalizuj Swiper po załadowaniu slajdów (dane z API)
watch(
    () => indexStore.slider,
    async (slides) => {
        if (!slides.length) return;
        // czekamy na wyrenderowanie DOM
        await nextTick();
        initSwiper();
    }
);

onBeforeUnmount(() => {
    swiperInstance?.destroy(true, true);
});

const navigate = (link: string | null) => {
    if (link) goTo(link);
};
</script>

<style scoped>
@import "./SliderStyle.css";

:deep(.swiper-pagination) {
    bottom: 12px;
}

:deep(.swiper-pagination-bullet) {
    width: 12px;
    height: 12px;
    background: #D9D9D9;
    opacity: 0.6;
}

:deep(.swiper-pagination-bullet-active) {
    opacity: 1;
    background: #83A6E1;
    width: 29px;
    height: 12px;
    border-radius: var(--radius-xl);
}
</style>