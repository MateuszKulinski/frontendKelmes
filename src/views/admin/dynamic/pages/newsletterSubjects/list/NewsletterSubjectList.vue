<template>
    <NewsletterSubjectTable :items="subjects" :loading="loading" @refresh="loadSubjects" />
</template>

<script setup lang="ts">
import { onMounted } from "vue";

import NewsletterSubjectTable from "../table/NewsletterSubjectTable.vue";
import { useNewsletterSubjectList } from "./NewsletterSubjectList";

const {
    subjects,
    loading,
    loadSubjects,
} = useNewsletterSubjectList();

onMounted(loadSubjects);
</script>