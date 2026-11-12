import { ref, onMounted } from "vue";
import api from "@/core/api/axios"; // dopasuj do siebie
import { useRoute } from "vue-router";

export function useUser() {
    const user = ref<any>(null);
    const loading = ref(true);
    const route = useRoute();
    const userId = Number(route.params.id);


    const load = async () => {
        loading.value = true;

        try {
            const { data } = await api.get(`/users/${userId}`);
            user.value = data.data;
        } catch (e) {
            user.value = null;
        } finally {
            loading.value = false;
        }
    };

    onMounted(load);

    return {
        user,
        loading,
        load,
    };
}