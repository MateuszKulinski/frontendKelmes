<template>
  <div class="user-create">
    <h1>{{ t("user.create_user") }}</h1>

    <UserForm ref="formRef" @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import api from "@/core/api/axios";
import UserForm from "../form/UserForm.vue";
import { useUiStore } from "@/core/stores/uiStore";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const formRef = ref<any>(null);

const router = useRouter();
const ui = useUiStore();

const handleSubmit = async (form: any) => {
  ui.showLoader();

  try {
    await api.post("/users", form);

    ui.showSuccess("Użytkownik zapisany");

    router.push({ name: t('user.user_saved') });
  } catch (e: any) {
    if (e.response?.status === 422) {
      formRef.value?.handleValidationError(e.response.data.errors);
      ui.showError(t('common.fix_form'));
    } else {
      console.error(e);
      ui.showError(t('common.error_occurred'));
    }
  } finally {
    ui.hideLoader();
  }
};
</script>