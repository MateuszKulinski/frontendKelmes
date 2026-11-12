import { ref, watch } from 'vue';
import { isAxiosError, isCancel } from 'axios';
import api from '@/core/api/axios';
import { useLangStore } from '@/core/stores/langStore';
import { applyContentDocumentMeta } from '@/core/utils/documentMeta';
import type { PublicSiteMetaData } from '@/composables/types/siteMetaData';

export function usePageMetaData(name: string) {
    const langStore = useLangStore();
    const metadata = ref<PublicSiteMetaData | null>(null);

    watch(() => langStore.current, async (_language, _previous, onCleanup) => {
        const controller = new AbortController();
        onCleanup(() => controller.abort());
        metadata.value = null;
        applyContentDocumentMeta({});

        try {
            const { data } = await api.get<{ data: PublicSiteMetaData }>(
                `/content/site-meta-data/${encodeURIComponent(name)}`,
                { signal: controller.signal },
            );
            if (controller.signal.aborted) return;
            metadata.value = data.data;
            applyContentDocumentMeta(data.data);
        } catch (error) {
            if (isCancel(error) || controller.signal.aborted) return;
            if (!isAxiosError(error) || error.response?.status !== 404) {
                console.warn('Could not load page metadata.');
            }
        }
    }, { immediate: true });

    return { metadata };
}
