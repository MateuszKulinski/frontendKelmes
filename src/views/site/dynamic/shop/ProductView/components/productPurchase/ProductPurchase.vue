<template>
    <div class="product-right col-md-3">
        <div class="product-cart-details d-flex flex-column">
            <ProductPrice :product="product" :selected-uom="selectedUom" />

            <template v-if="
                product.stock_status == 1 ||
                (
                    product.stock_status == 0 &&
                    product.stock > 0
                )
            ">
                <ProductAddToCart :product="product" v-model:selected-uom="selectedUom" />

                <DeliveryDetails :product="product" />

                <div class="
                        ask-for-product
                        d-flex
                        justify-content-center
                        align-items-center
                    ">
                    <router-link :to="{
                        path: t(
                            'url.routes.inquiryCreate'
                        ),
                        query: {
                            product_id:
                                product.id,
                        },
                    }" class="
                            d-flex
                            align-items-center
                            text-decoration-none
                        ">
                        <span class="
                                custom-icon
                                icon-chat
                            "></span>

                        <span class="ask-offer-title">
                            {{
                                t(
                                    "inquiry.ask_for_offer"
                                )
                            }}
                        </span>
                    </router-link>
                </div>
            </template>

            <div v-else class="
                    product-cart
                    stock-badge--empty
                ">
                <span class="
                        availability-text
                        brak
                    ">
                    {{
                        t(
                            "products.badge.out_of_stock_permanently"
                        )
                    }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ref,
    watch,
} from "vue";

import { useI18n } from "vue-i18n";

import ProductPrice from "./ProductPrice.vue";

import ProductAddToCart from
    "./ProductAddToCart.vue";

import DeliveryDetails from
    "./DeliveryDetails.vue";

const { t } = useI18n();

const props = defineProps<{
    product: any;
}>();

const selectedUom = ref(
    props.product.uoms?.[0] ?? null
);

watch(
    () => props.product,
    (product) => {
        selectedUom.value =
            product.uoms?.[0] ?? null;
    },
    {
        immediate: true,
    }
);
</script>

<style scoped>
@import "./ProductPurchase.css";
</style>