import api from "@/core/api/axios";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import type { Cart } from "../../carts/view/CartView";


interface Order {
    id: number;
    number: string;
    name: string;

    price: string;
    price_tax: string;

    delivery_date: string | null;
    created_at: string;

    tracking: {
        number: string | null;
        url: string | null;
    };

    status: {
        current: OrderStatus | null;
        history: OrderStatus[];
    };

    cart: Cart;
}

interface OrderStatus {
    id: number;
    status: {
        id: number;
        name: string;
        color: string | null;
        background: string | null;
    };
    created_at: string;
}

export function useOrder() {
    const route = useRoute();
    const orderId = Number(route.params.id);

    const order = ref<Order | null>(null);
    const loading = ref(false);

    const fetchOrder = async () => {
        loading.value = true;
        try {
            const { data } = await api.get<{ data: Order }>(`/orders/${orderId}`);
            order.value = data.data;
        } finally {
            loading.value = false;
        }
    };

    onMounted(fetchOrder);

    return { order, loading, fetchOrder };
}