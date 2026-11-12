<template>
    <div class="category-tree d-flex flex-column">
        <span class="category-tree-title text-uppercase">
            {{ t('category.title') }}
        </span>

        <div class="category-tree-list">
            <template v-if="tree?.children?.length">
                <div v-for="(child, index) in tree.children" :key="child.id" class="category-tree-item" :class="{
                    'category-tree-item-hidden':
                        !showAll && index >= VISIBLE_ITEMS
                }">
                    <CategoryTreeElementView :element="child" :active-id="activeId" :depth="0" />
                </div>
            </template>

            <!-- JEŻELI JEST > 5 KATEGORII, TEN BUTTON MUSI BYĆ -->
            <ButtomShowMore v-if="(tree?.children?.length ?? 0) > VISIBLE_ITEMS" :expanded="showAll"
                @toggle="showAll = !showAll" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CategoryTreeElement } from './CategoryTree'
import CategoryTreeElementView from './CategoryTreeElementView.vue'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import ButtomShowMore from '@/views/shared/components/ButtonShowMore.vue'

const VISIBLE_ITEMS = 5

const { t } = useI18n()

defineProps<{
    tree: CategoryTreeElement | null
    activeId?: number
}>()

const showAll = ref(false)
</script>

<style scoped>
@import './CategoryTree.css';
</style>