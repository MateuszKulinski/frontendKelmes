<template>
    <button type="button" class="button-show-more" :aria-expanded="expanded" @click="emit('toggle')">
        {{ expanded ? t('category.show_less') : t('category.show_more') }}
    </button>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
    expanded: boolean
}>()

const emit = defineEmits<{
    toggle: []
}>()

const { t } = useI18n()
</script>

<style scoped>
.button-show-more {
    display: block;
    width: 100%;
    margin-top: var(--margin-sm);
    padding: var(--padding-sm);

    border: 0;
    background: transparent;

    color: var(--accent);
    text-align: left;
    font-weight: 600;

    cursor: pointer;


    font-size: var(--font-size-sm);
}

.button-show-more:hover {
    text-decoration: underline;
}

.button-show-more:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
}
</style>