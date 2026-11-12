<template>
  <div class="users-view">
    <h1>{{ t("user.title") }}</h1>

    <BaseButton @click="goToCreate">
      <BaseIcon name="plus" /> {{ t("user.create_user") }}
    </BaseButton>

    <UserList />
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@shared/ui/BaseButton.vue";
import { useRouter } from "vue-router";
import UserList from "./list/UserList.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();

const goToCreate = () => {
  router.push({ name: "admin.users.create" });
};
</script>