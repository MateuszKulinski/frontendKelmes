import { ref, onMounted, onUnmounted, watch } from 'vue';
import api from '@/core/api/axios';

export type FeatureType = 'select' | 'multiselect' | 'range';

export interface FeatureItem {
    id: number;
    name: string;
    type: FeatureType;
    is_filterable: boolean;
    is_visible: boolean;
    is_exact_filter: boolean;
    order: number;
    updating?: boolean;
}

interface FeaturesResponse {
    data: FeatureItem[];
}

type FeatureSettingField =
    | 'type'
    | 'is_visible'
    | 'is_filterable'
    | 'is_exact_filter';

export function useFeaturesList() {
    let controller: AbortController | null = null;
    let searchTimer: ReturnType<typeof setTimeout> | null = null;

    const features = ref<FeatureItem[]>([]);
    const search = ref('');

    const loading = ref(true);
    const fetching = ref(false);

    const fetchFeatures = async () => {
        controller?.abort();
        controller = new AbortController();

        const currentController = controller;

        if (features.value.length === 0) {
            loading.value = true;
        } else {
            fetching.value = true;
        }

        try {
            const { data } = await api.get<FeaturesResponse>(
                '/configuration/features',
                {
                    signal: currentController.signal,
                    params: {
                        search: search.value || undefined,
                    },
                }
            );

            features.value = data.data;
        } catch (e: any) {
            if (e.name !== 'CanceledError') {
                console.error('Fetch features failed', e);
            }
        } finally {
            if (controller === currentController) {
                loading.value = false;
                fetching.value = false;
            }
        }
    };

    watch(search, () => {
        if (searchTimer) {
            clearTimeout(searchTimer);
        }

        searchTimer = setTimeout(() => {
            void fetchFeatures();
        }, 300);
    });

    const updateSetting = async <K extends FeatureSettingField>(
        feature: FeatureItem,
        field: K,
        value: FeatureItem[K]
    ) => {
        const oldValue = feature[field];

        // Optimistic update
        feature[field] = value;
        feature.updating = true;

        try {
            await api.put(
                `/configuration/features/${feature.id}/settings`,
                {
                    [field]: value,
                }
            );
        } catch (e) {
            // Rollback
            feature[field] = oldValue;

            console.error(
                `Update feature ${field} failed`,
                e
            );
        } finally {
            feature.updating = false;
        }
    };

    const reorderFeatures = async (list: FeatureItem[]) => {
        // Aktualizujemy UI od razu
        features.value = list;

        const featureIds = list.map(item => item.id);

        try {
            fetching.value = true;

            await api.put(
                '/configuration/features/order',
                {
                    feature_ids: featureIds,
                }
            );

            // Ustawiamy nowy order lokalnie
            features.value = list.map((item, index) => ({
                ...item,
                order: index + 1,
            }));
        } catch (e) {
            console.error(
                'Reorder features failed',
                e
            );

            // Przy błędzie pobieramy prawdziwy stan z API
            await fetchFeatures();
        } finally {
            fetching.value = false;
        }
    };

    onMounted(fetchFeatures);

    onUnmounted(() => {
        if (searchTimer) {
            clearTimeout(searchTimer);
        }

        controller?.abort();
    });

    return {
        features,
        search,
        loading,
        fetching,
        fetchFeatures,
        updateSetting,
        reorderFeatures,
    };
}
