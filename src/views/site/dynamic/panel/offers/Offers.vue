<template>
    <div class="offers-view">
        <h1>{{ t("offer.title") }}</h1>
        <div class="buttons_list_horizontal">
            <BaseButton @click="goToCreate">
                <BaseIcon name="plus" /> {{ t("common.add") }}
            </BaseButton>

            <BaseButton @click="goToCompaniesList">
                {{ t("offer.companies_list") }}
            </BaseButton>
        </div>
        <!-- <OfferList /> -->
    </div>
</template>



<script setup lang="ts">
import BaseButton from "@shared/ui/BaseButton.vue";
import { useNavigation } from "@/composables/useNavigation";
import { useI18n } from "vue-i18n";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";
// import OfferList from "./list/OfferList.vue";

const { t } = useI18n();
const { goTo } = useNavigation();

const goToCreate = () => {
    goTo("offerCreate");
};

const goToCompaniesList = () => {
    goTo("offerCompanies");
};
</script>