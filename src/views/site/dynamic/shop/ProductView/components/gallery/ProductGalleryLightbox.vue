<template>
    <Teleport to="body">
        <Transition name="gallery-lightbox">
            <div v-if="isOpen" class="gallery-lightbox" @click.self="close">
                <!-- CLOSE -->
                <button type="button" class="gallery-lightbox__close" aria-label="Close gallery" @click="close">
                    <span>×</span>
                </button>

                <!-- PREVIOUS -->
                <button v-if="images.length > 1" type="button"
                    class="gallery-lightbox__arrow gallery-lightbox__arrow--prev" aria-label="Previous image"
                    @click="previousImage">
                    <BaseIcon name="chLeft" />
                </button>

                <!-- MAIN IMAGE -->
                <div class="gallery-lightbox__content">
                    <div class="gallery-lightbox__image-wrapper">
                        <img v-if="currentImage" :src="getImageUrl(currentImage)" :alt="alt"
                            class="gallery-lightbox__image" @error="handleImageError" />
                    </div>
                </div>

                <!-- NEXT -->
                <button v-if="images.length > 1" type="button"
                    class="gallery-lightbox__arrow gallery-lightbox__arrow--next" aria-label="Next image"
                    @click="nextImage">
                    <BaseIcon name="chRight" />
                </button>

                <!-- BOTTOM THUMBNAILS -->
                <div v-if="images.length > 1" ref="thumbnailContainer" class="gallery-lightbox__thumbnails">
                    <div ref="thumbnailTrack" class="gallery-lightbox__thumbnail-track">
                        <button v-for="(image, index) in images" :key="image.medium || index"
                            :ref="el => setThumbnailRef(el, index)" type="button" class="gallery-lightbox__thumbnail"
                            :class="{
                                active: index === currentIndex
                            }" @click="selectImage(index)">
                            <img :src="getThumbUrl(image)" :alt="`${alt} ${index + 1}`" @error="handleImageError" />
                        </button>
                    </div>
                </div>

                <!-- COUNTER -->
                <div v-if="images.length > 1" class="gallery-lightbox__counter">
                    {{ currentIndex + 1 }} / {{ images.length }}
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import {
    computed,
    nextTick,
    onBeforeUnmount,
    ref,
    watch,
    type ComponentPublicInstance,
} from 'vue'

import BaseIcon from '@/views/shared/ui/BaseIcon.vue'

interface ProductImage {
    thumb?: string
    medium?: string
    large?: string
}

const props = defineProps<{
    images: ProductImage[]
    initialIndex?: number
    alt?: string
    open: boolean
}>()

const emit = defineEmits<{
    'update:open': [value: boolean]
    'change': [index: number]
}>()

const isOpen = computed(() => props.open)

const currentIndex = ref(
    Math.max(
        0,
        Math.min(
            props.initialIndex ?? 0,
            Math.max(props.images.length - 1, 0)
        )
    )
)

// const thumbnailContainer = ref<HTMLElement | null>(null)

const thumbnailRefs = ref<(HTMLElement | null)[]>([])

const images = computed(() => props.images ?? [])

const currentImage = computed(() => {
    return images.value[currentIndex.value] ?? null
})

const setThumbnailRef = (
    element: Element | ComponentPublicInstance | null,
    index: number
) => {
    thumbnailRefs.value[index] =
        element instanceof HTMLElement ? element : null
}

const getImageUrl = (image: ProductImage) => {
    const url =
        image.large ||
        image.medium ||
        image.thumb ||
        ''

    return replaceLocalhost(url)
}

const getThumbUrl = (image: ProductImage) => {
    return replaceLocalhost(
        image.thumb ||
        image.medium ||
        image.large ||
        ''
    )
}

const replaceLocalhost = (url: string) => {
    return url.replace(
        'http://127.0.0.1:8000',
        'https://cliply-test-b2b.exis24.pl'
    )
}

/**
 * Select image.
 *
 * Important:
 * after selecting an image, its thumbnail
 * is moved to the CENTER of the bottom strip.
 */
const selectImage = async (index: number) => {
    if (!images.value.length) {
        return
    }

    currentIndex.value = Math.max(
        0,
        Math.min(index, images.value.length - 1)
    )

    emit('change', currentIndex.value)

    await nextTick()

    centerCurrentThumbnail()
}

const centerCurrentThumbnail = () => {
    const element =
        thumbnailRefs.value[currentIndex.value]

    if (!element) {
        return
    }

    element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
    })
}

const previousImage = () => {
    if (!images.value.length) {
        return
    }

    const nextIndex =
        currentIndex.value <= 0
            ? images.value.length - 1
            : currentIndex.value - 1

    selectImage(nextIndex)
}

const nextImage = () => {
    if (!images.value.length) {
        return
    }

    const nextIndex =
        currentIndex.value >= images.value.length - 1
            ? 0
            : currentIndex.value + 1

    selectImage(nextIndex)
}

const close = () => {
    emit('update:open', false)
}

const handleKeydown = (event: KeyboardEvent) => {
    if (!isOpen.value) {
        return
    }

    switch (event.key) {
        case 'Escape':
            event.preventDefault()
            close()
            break

        case 'ArrowLeft':
            event.preventDefault()
            previousImage()
            break

        case 'ArrowRight':
            event.preventDefault()
            nextImage()
            break
    }
}

const handleImageError = (
    event: Event
) => {
    const img =
        event.target as HTMLImageElement

    img.src =
        '/img/p/pl-default-large_default.jpg'
}

/**
 * Lock page scrolling while lightbox is open.
 */
watch(
    () => props.open,
    async (open) => {
        if (open) {
            document.body.classList.add(
                'gallery-lightbox-open'
            )

            await nextTick()

            centerCurrentThumbnail()
        } else {
            document.body.classList.remove(
                'gallery-lightbox-open'
            )
        }
    },
    {
        immediate: true
    }
)

/**
 * If parent changes initialIndex while opened.
 */
watch(
    () => props.initialIndex,
    async index => {
        if (
            typeof index !== 'number' ||
            !props.open
        ) {
            return
        }

        currentIndex.value = Math.max(
            0,
            Math.min(
                index,
                Math.max(images.value.length - 1, 0)
            )
        )

        await nextTick()

        centerCurrentThumbnail()
    }
)

window.addEventListener(
    'keydown',
    handleKeydown
)

onBeforeUnmount(() => {
    window.removeEventListener(
        'keydown',
        handleKeydown
    )

    document.body.classList.remove(
        'gallery-lightbox-open'
    )
})
</script>

<style scoped>
.gallery-lightbox {
    position: fixed;
    inset: 0;
    z-index: 9999;

    width: 100vw;
    height: 100vh;

    background: rgba(0, 0, 0, 0.92);

    display: flex;
    align-items: center;
    justify-content: center;
}

/* -------------------------
   MAIN IMAGE
------------------------- */

.gallery-lightbox__content {
    width: 100%;
    height: calc(100% - 150px);

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 60px 120px 20px;
}

.gallery-lightbox__image-wrapper {
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
}

.gallery-lightbox__image {
    display: block;

    max-width: 100%;
    max-height: 100%;

    width: auto;
    height: auto;

    object-fit: contain;

    user-select: none;
}

/* -------------------------
   CLOSE
------------------------- */

.gallery-lightbox__close {
    position: absolute;
    top: 24px;
    right: 30px;

    z-index: 10;

    width: 44px;
    height: 44px;

    border: 0;
    background: transparent;

    color: #fff;

    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;
}

.gallery-lightbox__close span {
    font-size: 42px;
    font-weight: 200;
    line-height: 1;
}

/* -------------------------
   ARROWS
------------------------- */

.gallery-lightbox__arrow {
    position: absolute;
    top: 50%;

    z-index: 10;

    transform: translateY(-50%);

    width: 56px;
    height: 80px;

    border: 0;
    border-radius: 4px;

    background: rgba(255, 255, 255, 0.12);

    color: #fff;

    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    transition:
        background 0.15s ease,
        transform 0.15s ease;
}

.gallery-lightbox__arrow:hover {
    background: rgba(255, 255, 255, 0.22);
}

.gallery-lightbox__arrow--prev {
    left: 24px;
}

.gallery-lightbox__arrow--next {
    right: 24px;
}

/* -------------------------
   THUMBNAILS
------------------------- */

.gallery-lightbox__thumbnails {
    position: absolute;
    left: 50%;
    bottom: 28px;

    transform: translateX(-50%);

    width: min(calc(100vw - 180px),
            900px);

    overflow-x: auto;
    overflow-y: hidden;

    scrollbar-width: none;
}

.gallery-lightbox__thumbnails::-webkit-scrollbar {
    display: none;
}

.gallery-lightbox__thumbnail-track {
    display: flex;
    align-items: center;

    width: max-content;

    gap: 10px;

    padding: 4px 20px;
}

.gallery-lightbox__thumbnail {
    flex: 0 0 76px;

    width: 76px;
    height: 76px;

    padding: 0;

    border: 2px solid transparent;
    border-radius: 4px;

    background: #fff;

    overflow: hidden;

    cursor: pointer;

    opacity: 0.65;

    transition:
        opacity 0.15s ease,
        border-color 0.15s ease,
        transform 0.15s ease;
}

.gallery-lightbox__thumbnail:hover {
    opacity: 0.9;
}

.gallery-lightbox__thumbnail.active {
    border-color: #fff;
    opacity: 1;
    transform: scale(1.05);
}

.gallery-lightbox__thumbnail img {
    display: block;

    width: 100%;
    height: 100%;

    object-fit: contain;
}

/* -------------------------
   COUNTER
------------------------- */

.gallery-lightbox__counter {
    position: absolute;
    right: 30px;
    bottom: 32px;

    color: rgba(255, 255, 255, 0.75);

    font-size: 14px;
}

/* -------------------------
   TRANSITION
------------------------- */

.gallery-lightbox-enter-active,
.gallery-lightbox-leave-active {
    transition: opacity 0.2s ease;
}

.gallery-lightbox-enter-from,
.gallery-lightbox-leave-to {
    opacity: 0;
}

/* -------------------------
   MOBILE
------------------------- */

@media (max-width: 768px) {
    .gallery-lightbox__content {
        height: calc(100% - 120px);

        padding: 50px 50px 20px;
    }

    .gallery-lightbox__arrow {
        width: 42px;
        height: 60px;
    }

    .gallery-lightbox__arrow--prev {
        left: 8px;
    }

    .gallery-lightbox__arrow--next {
        right: 8px;
    }

    .gallery-lightbox__thumbnails {
        width: calc(100vw - 20px);
        bottom: 12px;
    }

    .gallery-lightbox__thumbnail {
        flex-basis: 64px;

        width: 64px;
        height: 64px;
    }

    .gallery-lightbox__counter {
        display: none;
    }

    .gallery-lightbox__close {
        top: 10px;
        right: 10px;
    }
}
</style>