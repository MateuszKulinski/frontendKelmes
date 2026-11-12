<template>
    <div class="limits-view">
        <h1>{{ t("limits.title") }}</h1>

        <BaseButton @click="goToCreate">
            <BaseIcon name="plus" />
            {{ t("limits.create_limit") }}
        </BaseButton>

        <LimitList />
    </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseButton from "@shared/ui/BaseButton.vue";
import BaseIcon from "@shared/ui/BaseIcon.vue";

import LimitList from "./list/LimitList.vue";

const router = useRouter();
const { t } = useI18n();

const goToCreate = () => {
    router.push({ name: "admin.limits.create" });
};
</script>
