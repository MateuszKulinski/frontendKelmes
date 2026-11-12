import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/core/api/axios";

export function useUnit() {

    const unit = ref<any>(null);
    const loading = ref(true);

    const route = useRoute();
    const unitId = Number(route.params.id);

    const load = async () => {

        loading.value = true;

        try {

            const { data } = await api.get(`/units/${unitId}`);
            unit.value = data.data;

        } catch {

            unit.value = null;

        } finally {

            loading.value = false;

        }

    };

    onMounted(load);

    return {
        unit,
        loading,
        load,
    };

}