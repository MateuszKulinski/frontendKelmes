<template>
    <div class="product-card" :class="viewType === 'list' ? 'list-view' : 'grid-view'">
        <Tile :product="product" v-if="viewType != 'list'" />
        <List :product="product" v-else />

    </div>
</template>

<script setup lang="ts">
import type { ProductItem } from '@/composables/indexStore'
import Tile from './tile/Tile.vue';
import List from './list/List.vue';


defineProps<{
    product: ProductItem
    viewType: string
}>()
</script>
