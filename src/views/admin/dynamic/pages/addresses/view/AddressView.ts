import { ref, onMounted, watch, type Ref } from "vue";
import api from "@/core/api/axios";

export interface AddressViewOptions {
    id?: number;
    address?: any;
}

export function useAddress(options: AddressViewOptions = {}) {
    const address: Ref<any | null> = ref(options.address ?? null);
    const loading = ref(false);

    const load = async (id?: number) => {
        if (!id) {
            address.value = null;
            return;
        }

        loading.value = true;
        try {
            const { data } = await api.get(`/addresses/${id}`);
            address.value = data.data;
        } catch {
            address.value = null;

        } finally {
            loading.value = false;
        }
    };

    onMounted(() => {
        if (!options.address && options.id) {
            load(options.id);
        }
    });

    watch(
        () => options.id,
        (id) => {

            if (!options.address && id) {
                load(id);
            }

        }
    );

    return {
        address,
        loading,
        load,
    };

}