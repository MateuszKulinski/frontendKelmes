<template>
    <div class="inquries-view">
        <h1>{{ t("inquiry.title") }}</h1>

        <BaseButton @click="goToCreate">
            <BaseIcon name="plus" /> {{ t("common.add") }}
        </BaseButton>

        <InquiriesList />
    </div>
</template>



<script setup lang="ts">
import BaseButton from "@shared/ui/BaseButton.vue";
import { useNavigation } from "@/composables/useNavigation";
import { useI18n } from "vue-i18n";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";
import InquiriesList from "./list/InquiriesList.vue";

const { t } = useI18n();
const { goTo } = useNavigation();

const goToCreate = () => {
    goTo("inquiryCreate");
};
</script>