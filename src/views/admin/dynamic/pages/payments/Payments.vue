<template>
    <div class="users-view">
        <h1>{{ t("payment.title") }}</h1>

        <BaseButton @click="goToCreate">
            <BaseIcon name="plus" /> {{ t("common.add") }}
        </BaseButton>

        <PaymentsList />
    </div>
</template>

<script setup lang="ts">
import BaseButton from "@shared/ui/BaseButton.vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import PaymentsList from "./list/PaymentsList.vue";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";

const { t } = useI18n();
const router = useRouter();

const goToCreate = () => {
    router.push({ name: "admin.payment.create" });
};
</script>