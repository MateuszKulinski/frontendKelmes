<template>
    <div v-if="rating" class="product-rating">
        <div class="stars">
            <i v-for="star in 5" :key="star" class="fa-star" :class="star <= roundedRating ? 'fas active' : 'far'" />
        </div>

        <span class="rating-text">
            {{ formattedRating }}
            <template v-if="rating.count !== undefined">
                ({{ rating.count }} opinii)
            </template>
        </span>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    rating: {
        type: Object,
        default: null
    }
})

const roundedRating = computed(() => {
    return Math.round(props.rating?.average ?? 0)
})

const formattedRating = computed(() => {
    return (props.rating?.average ?? 0).toFixed(1).replace('.', ',')
})
</script>

<style scoped>
.product-rating {
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
}

.stars {
    display: flex;
    gap: calc(var(--gap-ex-sm) / 2);
}

.stars .fa-star {
    color: var(--border-light);
    font-size: var(--font-size-lg);
}

.stars .fa-star.active {
    color: var(--warning);
}

.rating-text {
    color: var(--secondary-accent);
    font-size: var(--font-size-sm-plus);
}
</style>
