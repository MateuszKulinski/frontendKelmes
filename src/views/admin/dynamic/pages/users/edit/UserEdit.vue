<template>
  <div class="user-edit">
    <h1>{{ t("user.edit_user") }}</h1>

    <UserForm ref="formRef" :isEdit="true" @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/core/api/axios";
import UserForm from "../form/UserForm.vue";
import { useUiStore } from "@/core/stores/uiStore";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const formRef = ref<any>(null);
const userId = Number(route.params.id);

// 🔥 LOAD USER DATA
const loadUser = async () => {
  ui.showLoader();

  try {
    const { data } = await api.get(`/users/${userId}`);

    formRef.value?.setFormData(data.data);
  } catch (e) {
    console.error(e);
    ui.showError(t('user.download_error'));
  } finally {
    ui.hideLoader();
  }
};

// 🔥 SUBMIT
const handleSubmit = async (form: any) => {
  ui.showLoader();

  try {
    await api.put(`/users/${userId}`, form);

    ui.showSuccess(t('user.user_updated'));

    router.push({ name: "admin.users" });
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

onMounted(loadUser);
</script>