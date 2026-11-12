<template>
    <router-link class="nav-link" :to="{ name: 'admin.newsletterSubjects' }">
        <BaseButton>{{ t('newsletter.subjects') }}</BaseButton>
    </router-link>
    <div class="list-view newsletter-view">

        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" @change="goToPage" />

        <ActiveFilters :filters="activeFilters" @remove="clearSingleFilter" @removeAll="resetFilters" />
        <div class="list-toolbar">

            <div class="list-toolbar__filters">

                <BaseMultiSelect v-model="filters.subjects" :options="subjects" labelKey="name" valueKey="id"
                    :placeholder="t('newsletter.choose_subjects')" />

            </div>

        </div>

        <BaseTable :columns="columns" :data="subscribers" rowKey="id" :loading="loading" :currentPage="pagination.page"
            :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir" @sort="handleSort">

            <template #cell-subjects="{ row }">

                {{row.subjects.map((x: NewsletterSubject) => x.name).join(", ")}}

            </template>

        </BaseTable>

        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" @change="goToPage" />



        <div class="list-toolbar__actions d-flex gap-2">

            <BaseButton variant="secondary" @click="exportSubscribers('emails')" class="d-flex">

                {{ t("newsletter.export_emails") }}

            </BaseButton>

            <BaseButton @click="exportSubscribers('advanced')" class="d-flex">

                {{ t("newsletter.export_advanced") }}

            </BaseButton>

        </div>

    </div>

</template>

<script setup lang="ts">

import { computed } from "vue";
import { useI18n } from "vue-i18n";

import BasePagination from "@shared/components/BasePagination/BasePagination.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import ActiveFilters from "@shared/components/ActiveFilters/ActiveFilters.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseMultiSelect from "@/views/shared/ui/BaseMultiSelect.vue";

import { useNewsletterSubscribers } from "./NewsletterSubscribers";
import type { NewsletterSubject } from "@/composables/types/newsletter";

const { t } = useI18n();

const {

    subscribers,
    subjects,
    loading,
    pagination,
    filters,
    goToPage,
    sortBy,
    sortDir,
    handleSort,
    activeFilters,
    clearSingleFilter,
    resetFilters, exportSubscribers

} = useNewsletterSubscribers();

const columns = computed(() => [

    {
        key: "email",
        label: t("common.email"),
        sortable: true
    },
    {
        key: "subjects",
        label: t("newsletter.subjects")
    },
    {
        key: "subscribed_at",
        label: t("newsletter.subscribed_at"),
        sortable: true
    }

]);

</script>