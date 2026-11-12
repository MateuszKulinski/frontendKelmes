<template>
    <div class="users-view">
        <h1>{{ t("delivery.title") }}</h1>

        <BaseButton @click="goToCreate">
            <BaseIcon name="plus" /> {{ t("common.add") }}
        </BaseButton>
        <DeliveriesList />
    </div>
</template>

<script setup lang="ts">
import BaseButton from "@shared/ui/BaseButton.vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";
import DeliveriesList from "./list/DeliveriesList.vue";

const { t } = useI18n();
const router = useRouter();

const goToCreate = () => {
    router.push({ name: "admin.delivery.create" });
};
</script>