<template>
    <div class="newsletter-modal">
        <p class="newsletter-modal-description">{{ t("newsletter.description") }}</p>

        <div v-if="newsletter.state.subjectsLoading" class="loader-box">
            <div class="spinner"></div>
        </div>

        <div v-else class="newsletter-modal-form">
            <div v-if="newsletter.state.subjects.length" class="subjects-list">
                <label
                    v-for="subject in newsletter.state.subjects"
                    :key="subject.id"
                    class="subject-option"
                    :class="{ 'is-selected': newsletter.state.selectedSubjects.includes(subject.id) }"
                >
                    <input
                        type="checkbox"
                        :checked="newsletter.state.selectedSubjects.includes(subject.id)"
                        @change="toggleSubject(subject.id, $event)"
                    />
                    <span class="subject-option-check" aria-hidden="true"></span>
                    <span class="subject-option-name">{{ subject.name }}</span>
                </label>
            </div>
            <p v-else class="subjects-empty">{{ t("newsletter.no_subjects") }}</p>

            <div class="form-group floating mt-4">
                <BaseLabel>{{ t("newsletter.email") }}</BaseLabel>
                <BaseInput v-model="newsletter.state.email" type="email" />
            </div>

            <BaseCheckbox v-model="newsletter.state.accepted" class="newsletter-terms">
                {{ t("newsletter.accept_terms") }}
            </BaseCheckbox>

            <div class="newsletter-modal-actions">
                <BaseButton variant="secondary" :disabled="newsletter.state.loading" @click="close">
                    {{ t("common.cancel") }}
                </BaseButton>
                <BaseButton :loading="newsletter.state.loading" @click="submit">
                    {{ t("newsletter.subscribe") }}
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import BaseCheckbox from "@shared/components/BaseCheckbox/BaseCheckbox.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseInput from "@shared/ui/BaseInput.vue";
import BaseLabel from "@shared/ui/BaseLabel.vue";

import type { NewsletterComposable } from "@/composables/types/newsletter";
import { useNewsletterModal } from "./NewsletterModal";

const props = defineProps<{
    newsletter: NewsletterComposable;
}>();

const {
    t,
    newsletter,
    submit,
    close,
    toggleSubject,
} = useNewsletterModal(props.newsletter);
</script>

<style scoped src="./NewsletterModal.css"></style>