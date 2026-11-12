<template>
    <div class="reviews">
        <div class="tab-header d-flex justify-content-between align-items-center" :class="{ 'is-open': isOpen }"
            @click="toggle">
            <div class="tab-title-container">
                <BaseIcon class="tab-icon" name="comment" />

                <span class="tab-title">
                    {{ t("products.section.reviews") }}
                </span>
            </div>

            <BaseIcon :name="isOpen ? 'minus' : 'plus'" />
        </div>

        <div class="wrapper-content" :class="{ 'is-open': isOpen }">
            <div class="content-wrapper-inside">
                <!-- Add / edit form -->
                <div v-if="showForm" class="review-form-wrapper">
                    <ProductRatingForm ref="ratingForm" :submitting="submitting" @submit="handleRatingSubmit" />
                </div>

                <!-- Reviews -->
                <template v-if="localReviews.length">
                    <div v-for="review in localReviews" :key="review.id" class="review">
                        <div class="review-header">
                            <div>
                                <div class="review-author">
                                    {{ review.user.name }}
                                </div>

                                <div class="review-date">
                                    {{ review.created_at }}
                                </div>
                            </div>

                            <div class="review-header-right">
                                <ProductRating :rating="{
                                    average: review.rate,
                                }" :show-text="false" />

                                <div v-if="review.mine && review.editable" class="review-actions">
                                    <button type="button" class="review-action" :title="t('common.edit')"
                                        :disabled="submitting" @click.stop="
                                            editReview(review)
                                            ">
                                        <BaseIcon name="edit" />
                                    </button>

                                    <button type="button" class="review-action" :title="t('common.delete')"
                                        :disabled="submitting" @click.stop="
                                            deleteReview(review)
                                            ">
                                        <BaseIcon name="remove" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <p v-if="review.comment" class="review-comment">
                            {{ review.comment }}
                        </p>
                    </div>
                </template>

                <div v-else class="no-reviews">
                    {{ t("products.details.reviews_empty") }}
                </div>
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

import api from "@/core/api/axios";
import { useModalStore } from "@/core/stores/modalStore";
import ConfirmDeleteModal from "@/views/modals/ConfirmDeleteModal.vue";

import BaseIcon from "@/views/shared/ui/BaseIcon.vue";
import ProductRating from "./../ProductRating.vue";
import ProductRatingForm, {
    type ProductRatingFormData,
    type ProductRatingFormExpose,
} from "./../ProductRatingForm.vue";

interface ProductReview {
    id: number;
    rate: number;
    comment: string | null;
    created_at: string;
    mine: boolean;
    editable: boolean;
    user: {
        name: string;
    };
}

const props = defineProps<{
    product: {
        id: number;
        reviews?: ProductReview[];
    };
}>();

const { t } = useI18n();

const modal = useModalStore();

const isOpen = ref(false);

const localReviews = ref<ProductReview[]>([]);

const ratingForm =
    ref<ProductRatingFormExpose | null>(null);

const editingReview =
    ref<ProductReview | null>(null);

const submitting = ref(false);

const showForm = ref(true);

/**
 * Synchronize initial state from the product.
 */
const syncReviewsFromProduct = () => {
    localReviews.value = [
        ...(props.product.reviews ?? []),
    ];

    /*
     * The user may have a review even when it is
     * no longer editable.
     *
     * Therefore we check `mine`, NOT `editable`.
     */
    const hasOwnReview =
        localReviews.value.some(
            (review) => review.mine
        );

    showForm.value = !hasOwnReview;
};

watch(
    () => props.product.reviews,
    () => {
        if (!submitting.value) {
            syncReviewsFromProduct();
        }
    },
    {
        immediate: true,
    }
);

const toggle = () => {
    isOpen.value = !isOpen.value;
};

const editReview = (
    review: ProductReview
) => {
    if (!review.mine || !review.editable) {
        return;
    }

    editingReview.value = review;

    showForm.value = true;

    ratingForm.value?.setFormData({
        rate: review.rate,
        comment: review.comment ?? "",
    });
};

const handleRatingSubmit = async (
    payload: ProductRatingFormData
) => {
    if (submitting.value) {
        return;
    }

    submitting.value = true;

    try {
        /*
         * EDIT
         */
        if (editingReview.value) {
            const response = await api.put(
                `/product-ratings/${editingReview.value.id}`,
                payload
            );

            const updatedReview =
                response.data as ProductReview;

            const index =
                localReviews.value.findIndex(
                    (review) =>
                        review.id ===
                        updatedReview.id
                );

            if (index !== -1) {
                localReviews.value[index] =
                    updatedReview;
            }

            editingReview.value = null;

            ratingForm.value?.resetForm();

            showForm.value = false;

            return;
        }

        /*
         * CREATE
         */
        const response = await api.post(
            "/product-ratings",
            {
                product_id: props.product.id,
                ...payload,
            }
        );

        const createdReview =
            response.data as ProductReview;

        localReviews.value = [
            createdReview,
            ...localReviews.value,
        ];

        editingReview.value = null;

        ratingForm.value?.resetForm();

        /*
         * User now has a review, so the add form
         * disappears.
         */
        showForm.value = false;
    } catch (error: any) {
        const responseData =
            error?.response?.data;

        /*
         * Backend can return an existing rating
         * with HTTP 409.
         *
         * This is especially useful if the product
         * state on the frontend was stale.
         */
        if (
            error?.response?.status === 409 &&
            responseData?.rating
        ) {
            const existingReview =
                responseData.rating as ProductReview;

            const existingIndex =
                localReviews.value.findIndex(
                    (review) =>
                        review.id ===
                        existingReview.id
                );

            if (existingIndex === -1) {
                localReviews.value = [
                    existingReview,
                    ...localReviews.value,
                ];
            } else {
                localReviews.value[
                    existingIndex
                ] = existingReview;
            }

            /*
             * We already have a review, so the form
             * must disappear.
             */
            showForm.value = false;

            editingReview.value = null;

            ratingForm.value?.resetForm();

            return;
        }

        const backendErrors =
            responseData?.errors;

        if (backendErrors) {
            ratingForm.value?.setBackendErrors(
                backendErrors
            );
        }

        console.error(
            "Save product rating failed",
            error
        );
    } finally {
        submitting.value = false;
    }
};
const deleteReview = (review: ProductReview) => {
    if (
        submitting.value ||
        !review.mine ||
        !review.editable
    ) {
        return;
    }

    modal.openModal(ConfirmDeleteModal, {
        title: t("products.details.delete"),
        message: t("products.details.delete_confirm"),
        itemName: review.comment || t("products.section.reviews"),
        confirmText: t("common.delete"),
        cancelText: t("common.cancel"),
        loadingText: t("common.loading"),

        onConfirm: async () => {
            submitting.value = true;

            try {
                await api.delete(
                    `/product-ratings/${review.id}`,
                );

                localReviews.value =
                    localReviews.value.filter(
                        (item) => item.id !== review.id,
                    );

                if (
                    editingReview.value?.id === review.id
                ) {
                    editingReview.value = null;
                }

                ratingForm.value?.resetForm();

                // Użytkownik usunął swoją opinię,
                // więc może dodać nową.
                showForm.value = true;
            } catch (error) {
                console.error(
                    "Delete product rating failed",
                    error,
                );

                throw error;
            } finally {
                submitting.value = false;
            }
        },
    });
};
</script>

<style scoped>
@import "./ProductTabs.css";

.review-form-wrapper {
    margin-bottom: var(--gap-lg);
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--gap-md);
}

.review-header-right {
    display: flex;
    align-items: center;
    gap: var(--gap-md);
}

.review-actions {
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
}

.review-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--secondary-accent);
    cursor: pointer;
}

.review-action:hover:not(:disabled) {
    color: var(--primary);
}

.review-action:disabled {
    opacity: 0.5;
    cursor: default;
}

.review-action :deep(svg) {
    width: 16px;
    height: 16px;
}
</style>