<template>
    <div class="gallery-view col-md-7">
        <div class="product-gallery d-flex justify-content-start">

            <!-- THUMBNAILS -->
            <div v-if="product.images?.length" class="product-thumbs-wrapper col-md-2">
                <button type="button" class="thumbnail-arrow thumbnail-arrow-up" :disabled="!canScrollUp"
                    @click="scrollThumbnails(-1)">
                    <BaseIcon name="chUp" />
                </button>

                <div ref="thumbnailViewport" class="thumbnail-viewport">
                    <div class="thumbnail-track" :style="{
                        transform: `translateY(-${thumbnailOffset * thumbnailStep}px)`
                    }">
                        <button v-for="(img, i) in product.images" :key="i" type="button" class="product-thumb-slide"
                            :class="{
                                active: activeIndex === i
                            }" @click="selectImage(Number(i))">
                            <img :src="getThumbUrl(img)" :alt="product.name" class="product-thumb"
                                @error="handleImageError" />
                        </button>
                    </div>
                </div>

                <button type="button" class="thumbnail-arrow thumbnail-arrow-down" :disabled="!canScrollDown"
                    @click="scrollThumbnails(1)">
                    <BaseIcon name="chDown" />
                </button>
            </div>

            <!-- MAIN IMAGE -->
            <div class="product-image-placeholder col-md-10 rounded" @click="openLightbox">
                <ProductImage :src="activeImage" :alt="product.name ?? ''" class="img-fluid rounded" type="big" />

                <ProductBadges :product="product" />
            </div>

        </div>

        <!-- FULLSCREEN GALLERY -->
        <ProductGalleryLightbox v-model:open="lightboxOpen" :images="product.images" :initial-index="activeIndex"
            :alt="product.name ?? ''" @change="handleLightboxChange" />
    </div>
</template>

<script setup lang="ts">
import {
    computed,
    nextTick,
    ref,
    watch
} from 'vue'

import ProductImage from '@/views/site/components/products/ProductImage.vue'
import ProductBadges from './../ProductBadges.vue'
import ProductGalleryLightbox from './ProductGalleryLightbox.vue'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'

const props = defineProps<{
    product: any
}>()

const activeIndex = ref(0)

const lightboxOpen = ref(false)

const thumbnailRefs = ref<(HTMLElement | null)[]>([])

const activeImage = computed(() => {
    return (
        props.product?.images?.[
            activeIndex.value
        ]?.medium ??
        props.product?.image ??
        null
    )
})

const getThumbUrl = (image: any) => {
    return (
        image.thumb ||
        image.medium ||
        image.large ||
        ''
    ).replace(
        'http://127.0.0.1:8000',
        'https://cliply-test-b2b.exis24.pl'
    )
}

// const setThumbnailRef = (
//     element: Element | null,
//     index: number
// ) => {
//     thumbnailRefs.value[index] =
//         element as HTMLElement | null
// }

const selectImage = async (index: number) => {
    activeIndex.value = index

    await nextTick()

    thumbnailRefs.value[
        index
    ]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    })
}

// const selectPrevious = () => {
//     if (activeIndex.value <= 0) {
//         return
//     }

//     selectImage(activeIndex.value - 1)
// }

// const selectNext = () => {
//     if (
//         activeIndex.value >=
//         props.product.images.length - 1
//     ) {
//         return
//     }

//     selectImage(activeIndex.value + 1)
// }

const openLightbox = () => {
    lightboxOpen.value = true
}

const handleLightboxChange = (
    index: number
) => {
    activeIndex.value = index
}

const handleImageError = (
    event: Event
) => {
    const img =
        event.target as HTMLImageElement

    img.src =
        '/img/p/pl-default-cart_default.jpg'
}

watch(
    () => props.product?.image,
    image => {
        if (!image || !props.product?.images?.length) {
            return
        }

        const index =
            props.product.images.findIndex(
                (img: any) =>
                    img.medium === image
            )

        if (index >= 0) {
            activeIndex.value = index
        }
    },
    {
        immediate: true
    }
)

const visibleThumbnails = 4

const thumbnailHeight = 100
const thumbnailGap = 12

const thumbnailStep =
    thumbnailHeight + thumbnailGap

const thumbnailOffset = ref(0)

const maxThumbnailOffset = computed(() => {
    const count =
        props.product?.images?.length ?? 0

    return Math.max(
        0,
        count - visibleThumbnails
    )
})

const canScrollUp = computed(() => {
    return thumbnailOffset.value > 0
})

const canScrollDown = computed(() => {
    return (
        thumbnailOffset.value <
        maxThumbnailOffset.value
    )
})

const scrollThumbnails = (
    direction: number
) => {
    thumbnailOffset.value = Math.max(
        0,
        Math.min(
            thumbnailOffset.value + direction,
            maxThumbnailOffset.value
        )
    )
}

</script>

<style scoped>
@import './ProductGallery.css';
</style>