import api from "@/core/api/axios";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { Document } from "@entities/document";

export function useDoc() {
    const route = useRoute();
    const userId = Number(route.params.id);

    const doc = ref<Document | null>(null);
    const loading = ref(false);

    const fetchDoc = async () => {
        loading.value = true;
        try {
            const { data } = await api.get<{ data: Document }>(`documents/${userId}`);
            doc.value = data.data;
        } finally {
            loading.value = false;
        }
    };

    onMounted(fetchDoc);

    return { doc, loading, fetchDoc };
}