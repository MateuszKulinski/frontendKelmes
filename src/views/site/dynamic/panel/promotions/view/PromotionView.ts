import api from "@/core/api/axios";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import type {
    Promotion,
    PromotionProduct,
    PromotionViewResponse,
} from "@/composables/types/promotion";

export function usePromotion() {
    const route = useRoute();

    const promotionId = Number(route.params.id);

    const promotion = ref<Promotion | null>(null);
    const products = ref<PromotionProduct[]>([]);

    const loading = ref(false);
    const loadingProducts = ref(false);
    const fetchingProducts = ref(false);

    const pagination = ref({
        page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
    });

    const fetchPromotion = async () => {
        loading.value = true;
        loadingProducts.value = true;

        try {
            const { data } = await api.get<PromotionViewResponse>(
                `promotions/${promotionId}`,
                {
                    params: {
                        page: pagination.value.page,
                    },
                }
            );

            promotion.value = data.promotion;

            products.value = data.promotion.products;

            pagination.value = {
                page: data.meta.current_page,
                per_page: data.meta.per_page,
                total: data.meta.total,
                last_page: data.meta.last_page,
            };
        } catch (e) {
            console.error("Fetch promotion failed", e);

            promotion.value = null;
            products.value = [];
        } finally {
            loading.value = false;
            loadingProducts.value = false;
            fetchingProducts.value = false;
        }
    };

    const goToProductsPage = async (page: number) => {
        if (page === pagination.value.page) {
            return;
        }

        fetchingProducts.value = true;

        try {
            const { data } = await api.get<PromotionViewResponse>(
                `promotions/${promotionId}`,
                {
                    params: {
                        page,
                    },
                }
            );

            promotion.value = data.promotion;
            products.value = data.promotion.products;

            pagination.value = {
                page: data.meta.current_page,
                per_page: data.meta.per_page,
                total: data.meta.total,
                last_page: data.meta.last_page,
            };
        } catch (e) {
            console.error(
                "Fetch promotion products failed",
                e
            );
        } finally {
            fetchingProducts.value = false;
        }
    };

    onMounted(fetchPromotion);

    return {
        promotion,
        products,

        loading,
        loadingProducts,
        fetchingProducts,

        pagination,

        fetchPromotion,
        goToProductsPage,
    };
}