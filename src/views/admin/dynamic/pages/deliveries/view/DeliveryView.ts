import { ref, onMounted } from "vue";

import api from "@/core/api/axios";

import { useRoute } from "vue-router";

import type { Delivery } from "@/composables/types/delivery";

export function useDelivery() {

    const delivery = ref<Delivery | null>(null);

    const loading = ref<boolean>(true);

    const route = useRoute();

    const deliveryId = Number(route.params.id);

    const load = async (): Promise<void> => {

        loading.value = true;

        try {

            const { data } = await api.get<{ data: Delivery }>(
                `/settings/deliveries/${deliveryId}`
            );

            delivery.value = data.data;

        } catch (e) {

            delivery.value = null;

        } finally {

            loading.value = false;
        }
    };

    onMounted(load);

    return {
        delivery,
        loading,
        load,
    };
}