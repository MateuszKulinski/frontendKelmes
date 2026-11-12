<template>
    <div class="newsletter-subjects-page">
        <div class="page-header">
            <h1>{{ t("newsletter.subjects") }}</h1>

            <BaseButton @click="goToCreate">
                <BaseIcon name="plus" />
                {{ t("newsletter.add_subject") }}
            </BaseButton>
        </div>

        <NewsletterSubjectList />
    </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseButton from "@shared/ui/BaseButton.vue";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";

import NewsletterSubjectList from "./list/NewsletterSubjectList.vue";

const { t } = useI18n();
const router = useRouter();

const goToCreate = () => {
    router.push({
        name: "admin.newsletterSubjects.create",
    });
};
</script>

<style scoped>
.newsletter-subjects-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.page-header h1 {
    margin: 0;
}
</style>