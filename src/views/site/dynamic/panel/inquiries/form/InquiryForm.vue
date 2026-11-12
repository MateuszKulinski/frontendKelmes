<template>
    <form class="admin-form inquiry-form" @submit.prevent>
        <!-- 📝 BASIC DATA -->
        <div class="section full">
            <h3>
                {{ t("inquiry.basic_data") }}
            </h3>

            <div class="inquiry-grid">
                <div class="form-group floating">
                    <BaseLabel>
                        {{ t("inquiry.name") }}
                    </BaseLabel>

                    <BaseInput v-model="form.name" />

                    <div v-if="errors.name" class="error">
                        {{ errors.name }}
                    </div>
                </div>
            </div>

            <div class="form-group floating">
                <BaseLabel>
                    {{ t("inquiry.description") }}
                </BaseLabel>

                <textarea v-model="form.description" class="base-textarea" rows="5" />
            </div>
        </div>

        <!-- 📦 PRODUCTS -->
        <div class="section full">
            <h3>
                {{ t("inquiry.products") }}
            </h3>

            <ProductSearch :label="t('inquiry.add_product')" :on-select="addProduct" />

            <div v-if="errors.items" class="error mt-2">
                {{ errors.items }}
            </div>

            <div class="table-wrapper">
                <BaseTable :columns="columns" :data="form.items" rowKey="local_id">
                    <template #cell-product="{ row }">
                        <div class="product-cell">
                            <div class="product-name">
                                {{ row.product?.name }}
                            </div>
                        </div>
                    </template>

                    <template #cell-quantity="{ row }">
                        <BaseInput v-model="row.quantity" type="number" min="1" />
                    </template>

                    <template #cell-net_price="{ row }">
                        <BaseInput v-model="row.price" type="number" min="0" step="0.01" />
                    </template>

                    <template #cell-notes="{ row }">
                        <BaseInput v-model="row.notes" />
                    </template>

                    <template #cell-total="{ row }">
                        <BaseInput :model-value="formatCurrency(
                            Number(row.quantity) *
                            Number(row.price)
                        )
                            " readonly />
                    </template>

                    <template #cell-actions="{ index }">
                        <button type="button" class="remove-btn" @click="removeItem(index)">
                            <BaseIcon name="remove" />
                        </button>
                    </template>
                </BaseTable>
            </div>

            <div class="flex justify-end mt-6">
                <div class="w-full max-w-xs">
                    <BaseLabel>
                        {{ t("common.total_net") }}
                    </BaseLabel>

                    <BaseInput :model-value="formatCurrency(totalNet)" readonly />
                </div>
            </div>
        </div>

        <!-- 💾 SUBMIT -->
        <div class="submit-actions full">
            <BaseButton class="w-100" type="button" variant="secondary" @click="submit('draft')">
                {{ t("inquiry.save_draft") }}
            </BaseButton>

            <BaseButton type="button" class="submit-btn" @click="submit('send')">
                {{ t("inquiry.send_inquiry") }}
            </BaseButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import api from "@/core/api/axios";
import { formatCurrency } from "@/core/utils/formatCurrency";

import { useInquiryForm } from "./InquiryForm";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseLabel from "@shared/ui/BaseLabel.vue";
import BaseIcon from "@shared/ui/BaseIcon.vue";

import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import ProductSearch from "@shared/components/SearchProduct/SearchProduct.vue";

import type { InquiryFormExpose } from "@/composables/types/inquiry";
import type { ProductSearchItem } from "@entities/productSearch";

const { t } = useI18n();

const route = useRoute();

const emit = defineEmits([
    "submit",
]);

defineProps<{
    isEdit?: boolean;
}>();

const {
    form,
    errors,
    columns,
    addProduct,
    removeItem,
    submit,
    setBackendErrors,
    setFormData,
    totalNet,
} = useInquiryForm(
    emit
);

defineExpose<InquiryFormExpose>({
    setBackendErrors,
    setFormData,
});

/**
 * Add product from URL
 *
 * /inquiry/create?product_id=4913
 */
const addProductFromQuery = async () => {
    const productId = Number(
        route.query.product_id
    );

    if (!productId || productId <= 0) {
        return;
    }

    /**
     * Nie dodawaj produktu ponownie,
     * jeśli formularz został już zasilony tym produktem.
     */
    const alreadyExists = form.items.some(
        (item) =>
            Number(item.product_id) === productId
    );

    if (alreadyExists) {
        return;
    }

    try {
        const { data } = await api.get(
            "/searchProduct",
            {
                params: {
                    id: productId,
                },
            }
        );

        const product =
            data?.data?.[0] as
            | ProductSearchItem
            | undefined;

        if (!product) {
            console.warn(
                `Product ${productId} not found`
            );

            return;
        }

        addProduct(product);
    } catch (error) {
        console.error(
            "Failed to load product from URL:",
            error
        );
    }
};

onMounted(() => {
    addProductFromQuery();
});
</script>

<style scoped src="@admin/assets/Form.css"></style>

<style scoped>
.inquiry-form {
    grid-template-columns: 1fr;
}

.inquiry-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--margin-lg);
}

.table-wrapper {
    overflow-x: auto;
    margin-top: var(--margin-md);
}

.product-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.product-name {
    font-weight: 600;
    color: var(--text-primary);
}

.product-index {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
}

.remove-btn {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    background: transparent;
    color: #d32f2f;
    cursor: pointer;
    transition: all 0.2s ease;
}

.remove-btn:hover {
    background: rgba(211, 47, 47, 0.08);
    border-color: rgba(211, 47, 47, 0.2);
}

.remove-btn i {
    font-size: 14px;
}

@media (max-width: 768px) {
    .inquiry-grid {
        grid-template-columns: 1fr;
    }
}
</style>