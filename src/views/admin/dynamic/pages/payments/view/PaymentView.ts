import { ref, onMounted } from "vue";
import api from "@/core/api/axios";
import { useRoute } from "vue-router";
import type { Payment } from "@/composables/types/payment";



export function usePayment() {
    const payment = ref<Payment | null>(null);
    const loading = ref<boolean>(true);
    const route = useRoute();

    const paymentId = Number(route.params.id);

    const load = async (): Promise<void> => {
        loading.value = true;

        try {
            const { data } = await api.get<{ data: Payment }>(
                `/settings/payments/${paymentId}`
            );

            payment.value = data.data;
        } catch (e) {
            payment.value = null;
        } finally {
            loading.value = false;
        }
    };

    onMounted(load);

    return {
        payment,
        loading,
        load,
    };
}