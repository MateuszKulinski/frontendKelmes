import api from "@/core/api/axios";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

export interface Cart {
    id: number;
    unit: { id: number; name: string };
    user: { id: number; name: string };
    address: { id: number; full: string };
    payment_method: string;
    transport_method: string;
    notes: string;
    is_active: boolean;
    delivery_date: string;
    created_at: string;
    summary: {
        total_quantity: string;
        total_price: string;
    };
    products: CartProduct[];
}

export interface CartProduct {
    id: number;
    name: string;
    indeks: string;
    reference: string;
    catalog_number: string;
    ean: string;
    uom: { id: number; name: string };
    url?: any;
    special_data: {
        id: number;
        price: string;
        quantity: number;
        total_price: string;
        indeks: string;
    };
}

export function useCart() {
    const route = useRoute();
    const cartId = Number(route.params.id);

    const cart = ref<Cart | null>(null);
    const loading = ref(false);

    const fetchCart = async () => {
        loading.value = true;
        try {
            const { data } = await api.get<{ data: Cart }>(`/carts/${cartId}`);
            cart.value = data.data;
        } finally {
            loading.value = false;
        }
    };

    onMounted(fetchCart);

    return { cart, loading, fetchCart };
}