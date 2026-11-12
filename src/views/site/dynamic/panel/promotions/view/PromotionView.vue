<template>
    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border"></div>
    </div>

    <template v-else-if="promotion">

        <BigCard :title="promotion.description">

            <template #actions>
                <span class="badge" :class="promotion.active ? 'bg-success' : 'bg-secondary'">
                    {{ promotion.active ? t("common._yes") : t("common._no") }}
                </span>
            </template>

            <div class="row g-3">
                <Info :label="t('promotions.id')" :value="promotion.id" />

                <Info :label="t('promotions.description')" :value="promotion.description" />

                <Info :label="t('promotions.type')" :value="promotionType" />

                <Info :label="t('promotions.value_type')" :value="promotionValueType" />

                <Info :label="t('promotions.percentage')" :value="`${promotion.percentage ?? 0}%`" />

                <Info :label="t('promotions.date_from')" :value="promotion.date_from || '-'" />

                <Info :label="t('promotions.date_to')" :value="promotion.date_to || '-'" />

                <Info :label="t('promotions.active')" :value="promotion.active ? t('common._yes') : t('common._no')" />
            </div>

        </BigCard>

        <BigCard :title="t('promotions.products')" class="mt-3">
            <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
                :lastPage="pagination.last_page" :disabled="fetchingProducts" @change="goToProductsPage" />

            <BaseTable :columns="productColumns" :data="products" :loading="loadingProducts" rowKey="id"
                :currentPage="pagination.page" :perPage="pagination.per_page" @row-click="goToProduct" />

            <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
                :lastPage="pagination.last_page" :disabled="fetchingProducts" @change="goToProductsPage" />
        </BigCard>

    </template>

    <div v-else class="alert alert-warning">
        {{ t("promotions.not_found") }}
    </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";

import BigCard from "@shared/components/BigCard.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@shared/components/BasePagination/BasePagination.vue";
import Info from "@shared/ui/Info.vue";

import { usePromotion } from "./PromotionView";
import { useLangStore } from "@/core/stores/langStore";

import type { PromotionProduct } from "@/composables/types/promotion";

import { useUrlResolver } from "@/composables/useUrlResolver";

const { resolve } = useUrlResolver();

const goToProduct = (row: PromotionProduct) => {
    if (!row.product?.url) {
        return;
    }

    window.location.href = resolve(row.product.url);
};

const { t } = useI18n();
const langStore = useLangStore();

const {
    promotion,
    products,
    loading,
    loadingProducts,
    fetchingProducts,
    pagination,
    fetchPromotion,
    goToProductsPage,
} = usePromotion();

const promotionType = computed(() => {
    if (!promotion.value?.type) {
        return "-";
    }

    return t(
        `promotions.${promotion.value.type}`,
        promotion.value.type
    );
});

const promotionValueType = computed(() => {
    if (!promotion.value?.value_type) {
        return "-";
    }

    if (promotion.value.value_type === "percentage") {
        return t("promotions.percentage");
    }

    return t(
        `promotions.${promotion.value.value_type}`,
        promotion.value.value_type
    );
});

const productColumns = computed(() => [
    {
        key: "name",
        label: t("products.details.name"),
        sortable: true,
        formatter: (row: PromotionProduct) =>
            row.product?.name ?? "",
    },
    {
        key: "indeks",
        label: t("products.details.indeks"),
        sortable: true,
        formatter: (row: PromotionProduct) =>
            row.product?.indeks ?? "",
    },
    {
        key: "catalog_number",
        label: t("products.details.nr_katalogowy"),
        sortable: true,
        formatter: (row: PromotionProduct) =>
            row.product?.catalog_number ?? "",
    },
    {
        key: "ean",
        label: "EAN",
        sortable: true,
        formatter: (row: PromotionProduct) =>
            row.product?.ean ?? "",
    },
]);

watch(
    () => langStore.current,
    async () => {
        await fetchPromotion();
    }
);
</script>