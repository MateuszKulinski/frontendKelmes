<template>
    <form @submit.prevent="handleSubmit">
        <div class="rating-form">
            <div class="rating-section">
                <BaseLabel>
                    {{ t("products.details.rate") }}
                    <span class="required">*</span>
                </BaseLabel>

                <div class="rating-stars" @mouseleave="hoveredRating = 0">
                    <button v-for="star in 5" :key="star" type="button" class="star-button"
                        :aria-label="`Ocena ${star} na 5`" :disabled="props.submitting"
                        @mouseenter="hoveredRating = star" @click="form.rate = star">
                        <i class="fa-star" :class="star <= displayedRating
                                ? 'fas active'
                                : 'far'
                            "></i>
                    </button>
                </div>

                <div v-if="form.rate > 0" class="rating-value">
                    {{ form.rate }}/5
                </div>

                <div v-if="errors.rate" class="field-error">
                    {{ errors.rate }}
                </div>
            </div>

            <div class="comment-section">
                <BaseLabel for="product-rating-comment">
                    {{ t("products.details.comment") }}
                </BaseLabel>

                <textarea id="product-rating-comment" v-model="form.comment" class="rating-textarea" :class="{
                    'has-error': !!errors.comment,
                }" :disabled="props.submitting" rows="5"></textarea>

                <div v-if="errors.comment" class="field-error">
                    {{ errors.comment }}
                </div>
            </div>

            <div class="form-actions">
                <BaseButton type="submit" :disabled="props.submitting ||
                    form.rate === 0
                    ">
                    {{ t("common.save") }}
                </BaseButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import {
    computed,
    reactive,
    ref,
} from "vue";
import { useI18n } from "vue-i18n";

import BaseButton from "@shared/ui/BaseButton.vue";
import BaseLabel from "@shared/ui/BaseLabel.vue";

export interface ProductRatingFormData {
    rate: number;
    comment: string;
}

export interface ProductRatingFormExpose {
    setFormData: (
        data: ProductRatingFormData
    ) => void;

    setBackendErrors: (
        errors: Record<string, string[]>
    ) => void;

    resetForm: () => void;
}

const props = withDefaults(
    defineProps<{
        submitting?: boolean;
    }>(),
    {
        submitting: false,
    }
);

const emit = defineEmits<{
    submit: [
        payload: ProductRatingFormData
    ];
}>();

const { t } = useI18n();

const form = reactive<ProductRatingFormData>({
    rate: 0,
    comment: "",
});

const errors = reactive<Record<string, string>>({});

const hoveredRating = ref(0);

const displayedRating = computed(() => {
    return hoveredRating.value || form.rate;
});

const clearErrors = () => {
    Object.keys(errors).forEach((key) => {
        delete errors[key];
    });
};

const handleSubmit = () => {
    if (props.submitting) {
        return;
    }

    clearErrors();

    if (!form.rate) {
        errors.rate = t(
            "products.details.rate_required"
        );

        return;
    }

    emit("submit", {
        rate: form.rate,
        comment: form.comment,
    });
};

const setFormData = (
    data: ProductRatingFormData
) => {
    form.rate = data.rate ?? 0;
    form.comment = data.comment ?? "";

    clearErrors();
    hoveredRating.value = 0;
};

const setBackendErrors = (
    backendErrors: Record<string, string[]>
) => {
    clearErrors();

    Object.entries(backendErrors).forEach(
        ([key, messages]) => {
            errors[key] = messages?.[0] ?? "";
        }
    );
};

const resetForm = () => {
    form.rate = 0;
    form.comment = "";

    clearErrors();
    hoveredRating.value = 0;
};

defineExpose<ProductRatingFormExpose>({
    setFormData,
    setBackendErrors,
    resetForm,
});
</script>

<style scoped>
.rating-form {
    display: flex;
    flex-direction: column;
    gap: var(--gap-lg);
}

.rating-section {
    display: flex;
    flex-direction: column;
    gap: var(--gap-sm);
}

.required {
    color: var(--danger);
}

.rating-stars {
    display: flex;
    align-items: center;
    gap: calc(var(--gap-ex-sm) / 2);
}

.star-button {
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    line-height: 1;
}

.star-button:disabled {
    cursor: default;
}

.star-button .fa-star {
    color: var(--border-light);
    font-size: var(--font-size-xl);
    transition:
        color 0.15s ease,
        transform 0.15s ease;
}

.star-button:hover:not(:disabled) .fa-star,
.star-button .fa-star.active {
    color: var(--warning);
}

.star-button:hover:not(:disabled) .fa-star {
    transform: scale(1.1);
}

.rating-value {
    color: var(--secondary-accent);
    font-size: var(--font-size-sm);
}

.comment-section {
    display: flex;
    flex-direction: column;
    gap: var(--gap-sm);
}

.rating-textarea {
    width: 100%;
    min-height: 120px;
    padding: var(--padding-sm) var(--padding-md);
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius);
    background: var(--background);
    color: var(--text-primary);
    font-family: inherit;
    font-size: var(--font-size-sm-plus);
    line-height: 1.5;
    resize: vertical;
    transition: border-color 0.15s ease;
    box-sizing: border-box;
}

.rating-textarea:focus {
    outline: none;
    border-color: var(--primary);
}

.rating-textarea.has-error {
    border-color: var(--danger);
}

.field-error {
    color: var(--danger);
    font-size: var(--font-size-sm);
}

.form-actions {
    display: flex;
    justify-content: flex-end;
}
</style>