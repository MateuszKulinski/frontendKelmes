<template>
    <div v-if="items.length" class="d-flex align-items-center gap-3 mt-3">
        <a v-for="item in items" :key="item.name" :href="getUrl(item.value)" target="_blank" rel="noopener noreferrer"
            class="text-reset">
            <BaseIcon :name="item.name" />
        </a>
    </div>
</template>

<script setup lang="ts">
import type { SocialMedia } from '@/core/stores/contentStore';
import BaseIcon from '@/views/shared/ui/BaseIcon.vue';

defineProps<{
    items: SocialMedia[];
}>();

const getUrl = (url: string) => {
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};
</script>

<style scoped>
.text-reset {
    background: var(--secondary-accent);
    width: 30px;
    height: 30px;
    display: flex;
    border-radius: 50%;
    font-size: 16px;
    justify-content: center;
    align-items: center;
    color: #fff !important;
}

.text-reset:hover {
    background-color: var(--accent-strong);
}
</style>