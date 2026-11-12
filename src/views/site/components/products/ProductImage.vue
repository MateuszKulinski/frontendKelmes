<template>
    <img :src="imageSrc" :alt="alt" :class="[
        className,
        {
            small: type === 'small',
            'extra-small': type === 'extra-small',
        }
    ]" @error="handleError" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
    src?: string | null
    alt?: string
    className?: string
    fallback?: string
    type?: string
}

const props = withDefaults(defineProps<Props>(), {
    src: null,
    alt: '',
    className: 'img-fluid',
    fallback: '/img/p/pl-default-cart_default.jpg',
    type: 'small',
})

const imageSrc = ref('')

const getFallback = () => {
    if (props.type === 'big') {
        return props.fallback.replace('cart', 'large')
    }

    return props.fallback
}

const getImageSrc = (src?: string | null) => {
    if (!src) return getFallback()

    return src
        .replace(
            'http://127.0.0.1:8000',
            'https://cliply-test-b2b.exis24.pl'
        )
        .replace(
            'http://localhost:5173',
            'https://cliply-test-b2b.exis24.pl'
        )
}

const handleError = () => {
    imageSrc.value = getFallback()
}

watch(
    () => props.src,
    (src) => {
        imageSrc.value = getImageSrc(src)
    },
    { immediate: true }
)
</script>

<style scoped>
.extra-small {
    max-width: 50px;
    max-height: 50px;
    width: 100%;
    height: auto;
    object-fit: contain;
}
</style>
