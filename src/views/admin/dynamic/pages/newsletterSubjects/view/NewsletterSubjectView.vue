<template>
    <div class="newsletter-subject-view">
        <h1>{{ t("newsletter.subject_details") }}</h1>

        <div class="section">
            <p>{{ t("common.not_implemented") }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style scoped src="@admin/assets/Form.css"></style>