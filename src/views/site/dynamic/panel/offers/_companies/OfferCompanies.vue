<template>

    <div class="offer-companies-view">

        <h1>{{ t("offer.company_list") }}</h1>

        <BaseButton @click="goToCreate">

            <BaseIcon name="plus" />

            {{ t("common.add") }}

        </BaseButton>

        <OfferCompaniesList />

    </div>

</template>

<script setup lang="ts">

import OfferCompaniesList from "./list/OfferCompaniesList.vue";
import BaseButton from "@/views/shared/ui/BaseButton.vue";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";

import { useNavigation } from "@/composables/useNavigation";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { goTo } = useNavigation();

const goToCreate = () => {
    goTo("offerCompanyCreate");
};

</script>