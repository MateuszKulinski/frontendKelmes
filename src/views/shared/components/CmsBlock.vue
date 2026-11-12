<template>
    <template v-if="!loading && page">
        <h2 v-if="showTitle" class="cms-block__title">{{ page.title }}</h2>
        <CmsContent :content="page.content ?? ''" />
    </template>
</template>

<script setup lang="ts">
import { watch, onMounted, computed, createStaticVNode, defineComponent } from 'vue';
import { useCmsStore } from '@/core/stores/cmsStore';
import { useLangStore } from '@/core/stores/langStore';

// v-html na <template> nie renderuje jego zawartości; statyczny fragment nie dodaje wrappera.
const CmsContent = defineComponent({
    props: { content: String },
    setup(props) {
        const fragment = computed(() => {
            if (!props.content) return null;

            const template = document.createElement('template');
            template.innerHTML = props.content;

            const vnode = createStaticVNode(props.content, template.content.childNodes.length);
            vnode.key = props.content;
            return vnode;
        });

        return () => fragment.value;
    },
});

const props = defineProps<{
    cmsId: number;
    showTitle?: boolean;
}>();

const store = useCmsStore();
const langStore = useLangStore();

const page = computed(() => store.pagesById[props.cmsId] ?? null);
const title = computed(() => page.value?.title?.trim() ?? '');
const loading = computed(() => store.loadingById[props.cmsId] ?? false);

const load = () => {
    if (props.cmsId) {
        delete store.pagesById[props.cmsId];
        store.fetchById(props.cmsId);
    }
};

onMounted(load);
watch(() => props.cmsId, load);
watch(() => langStore.current, load);

defineExpose({ title });
</script>
