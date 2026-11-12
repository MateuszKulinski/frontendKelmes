<template>
    <div class="newsletter-subscribe">

        <h3 class="newsletter-title">{{ t("newsletter.title") }}</h3>

        <p class="newsletter-description text-dark">
            {{ t("newsletter.description") }}
        </p>

        <div class="form-group floating">
            <BaseInput v-model="newsletter.state.email" type="email" :placeholder="t('newsletter.email')" />
        </div>

        <BaseCheckbox v-model="newsletter.state.accepted" class="mt-3">
            {{ t("newsletter.accept_terms") }}
        </BaseCheckbox>

        <div class="newsletter-buttons">

            <BaseButton variant="secondary" @click="chooseSubjects" class="d-flex">
                {{ t("newsletter.choose_subjects") }}
            </BaseButton>

            <BaseButton :loading="newsletter.state.loading" @click="subscribe" class="d-flex">
                {{ t("newsletter.subscribe") }}
            </BaseButton>

        </div>

    </div>
</template>

<script setup lang="ts">
import BaseInput from "@shared/ui/BaseInput.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseCheckbox from "@shared/components/BaseCheckbox/BaseCheckbox.vue";

import { useI18n } from "vue-i18n";

import { useModalStore } from "@/core/stores/modalStore";
import { useNewsletterSubscribe } from "@/composables/useNewsletterSubscribe";
import NewsletterModal from "./NewsletterModal.vue";

const { t } = useI18n();

const modal = useModalStore();

const newsletter = useNewsletterSubscribe();

const subscribe = () => {
    newsletter.subscribe(false);
};

const chooseSubjects = () => {
    if (!newsletter.validate()) {
        return;
    }

    modal.openModal(
        NewsletterModal,
        {
            newsletter,
            modalTitle: t("newsletter.choose_subjects"),
        }
    );

};
</script>

<style scoped src="./NewsletterSubscribe.css"></style>