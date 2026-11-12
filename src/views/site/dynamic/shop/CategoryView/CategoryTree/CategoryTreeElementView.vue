<template>
    <ul class="tree-node" :class="{
        'tree-node-active': isActive,
        [`tree-node-depth-${props.depth}`]: false,
        children: props.depth > 0,
    }">
        <li class="tree-node-row">
            <router-link v-if="props.element.url" :to="resolve(props.element.url)" class="tree-node-link" :class="{
                active: isActive,
                open:
                    open &&
                    props.element.children.length,
            }" @click.stop>
                {{ props.element.name }}
            </router-link>

            <span v-else class="tree-node-label">
                {{ props.element.name }}
            </span>

            <button v-if="props.element.children.length" type="button" class="tree-node-toggle" :aria-expanded="open"
                :aria-label="`${open
                    ? t('category.collapse_category')
                    : t('category.expand_category')}: ${props.element.name
                    }`
                    " @click="toggle">
                {{ open ? '−' : '+' }}
            </button>
        </li>

        <template v-if="
            props.element.children.length &&
            open
        ">
            <CategoryTreeElementView v-for="child in props.element.children" :key="child.id" :element="child"
                :active-id="props.activeId" :depth="props.depth + 1" />
        </template>
    </ul>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CategoryTreeElement } from './CategoryTree'
import { useUrlResolver } from '@/composables/useUrlResolver'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    element: CategoryTreeElement
    activeId?: number
    depth: number
}>()

const { resolve } = useUrlResolver()
const { t } = useI18n()

const isActive = computed(
    () => props.element.id === props.activeId
)

const hasActiveDescendant = (
    element: CategoryTreeElement,
    targetId?: number
): boolean => {
    if (!targetId) {
        return false
    }

    return element.children.some(
        (child) =>
            child.id === targetId ||
            hasActiveDescendant(child, targetId)
    )
}

const open = ref(
    isActive.value ||
    hasActiveDescendant(
        props.element,
        props.activeId
    )
)

function toggle() {
    if (props.element.children.length) {
        open.value = !open.value
    }
}
</script>

<style scoped>
@import './CategoryTree.css';
</style>