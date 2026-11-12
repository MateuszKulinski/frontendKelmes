<template>
  <form class="admin-form user-form" @submit.prevent="submit">
    <!-- 🏢 GŁÓWNA JEDNOSTKA -->
    <div class="section full">
      <h3>{{ t("user.main_unit") }}</h3>

      <BaseAutocomplete :items="units" :placeholder="t('user.select_main_unit')" labelKey="name" subLabelKey="number"
        @search="onSearch" @select="onSelectMainUnit" />

      <div v-if="errors.unit_id" class="error">
        {{ errors.unit_id }}
      </div>

      <div v-if="selectedMainUnit" class="selected-single">
        {{ selectedMainUnit.name }}
      </div>
    </div>
    <div class="section-column">

      <!-- 👤 DANE PODSTAWOWE -->
      <div class="section">
        <h3>{{ t("user.user_data") }}</h3>

        <div class="user-grid">
          <div class="form-group floating">
            <BaseLabel>{{ t("user.permissions") }}</BaseLabel>
            <BaseSelect v-model="form.permission_id" :options="permissions" labelKey="display_name" valueKey="id"
              :placeholder="t('common.select')" />
            <div v-if="errors.permission_id" class="error">
              {{ errors.permission_id }}
            </div>
          </div>

          <div v-if="agents.length" class="form-group floating">
            <BaseLabel>{{ t("user.assign_agent") }}</BaseLabel>
            <BaseSelect v-model="form.agent_id" :options="agents" valueKey="id"
              :labelFn="(a) => `${a.firstname} ${a.lastname}`" :placeholder="t('common.none')" />
          </div>

          <div class="form-group floating">
            <BaseLabel>{{ t("user.login") }}</BaseLabel>
            <BaseInput v-model="form.name" />
            <div v-if="errors.name" class="error">{{ errors.name }}</div>
          </div>

          <div class="form-group floating">
            <BaseLabel>{{ t("user.email") }}</BaseLabel>
            <BaseInput v-model="form.email" />
            <div v-if="errors.email" class="error">{{ errors.email }}</div>
          </div>

          <div class="form-group floating">
            <BaseLabel>{{ t("user.password") }}</BaseLabel>
            <BaseInput type="password" v-model="form.password" />
            <div v-if="errors.password" class="error">{{ errors.password }}</div>
          </div>

          <div class="form-group floating">
            <BaseLabel>{{ t("user.firstname") }}</BaseLabel>
            <BaseInput v-model="form.firstname" />
            <div v-if="errors.firstname" class="error">{{ errors.firstname }}</div>
          </div>

          <div class="form-group floating">
            <BaseLabel>{{ t("user.lastname") }}</BaseLabel>
            <BaseInput v-model="form.lastname" />
            <div v-if="errors.lastname" class="error">{{ errors.lastname }}</div>
          </div>

          <div class="form-group floating">
            <BaseLabel>{{ t("user.phone") }}</BaseLabel>
            <BaseInput v-model="form.phone" />
          </div>
        </div>

        <!-- checkbox na pełną szerokość -->
        <BaseCheckbox v-model="form.send_email">
          {{ t("user.send_email_to_user") }}
        </BaseCheckbox>
      </div>

      <div class="section">

        <h3>{{ t("user.additional_access") }}</h3>

        <BaseAutocomplete :items="units" :placeholder="t('user.add_unit_access')" labelKey="name" subLabelKey="number"
          @search="onSearch" @select="onSelectUnit" />

        <div class="selected-units">
          <div v-for="unit in selectedUnits" :key="unit.id" class="tag">
            {{ unit.name }}
            <span class="remove" @click="removeUnit(unit.id)">
              <BaseIcon name="remove" class="me-2" />
            </span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>{{ t("user.addresses") }}</h3>

        <p v-if="!addresses.length">
          {{ t("user.no_addresses") }}
        </p>

        <div v-for="address in addresses" :key="address.id" class="address-item">
          <BaseCheckbox :model-value="form.addresses.includes(Number(address.id))"
            @update:model-value="() => toggleAddress(Number(address.id))">
            <strong>
              {{ address.alias || address.company || `${address.street ?? ""} ${address.house_number ?? ""}` }}
            </strong>

            <span>
              {{ address.postcode }} {{ address.city }}
            </span>
          </BaseCheckbox>
        </div>
      </div>
    </div>

    <!-- 🌍 USTAWIENIA -->
    <div class="section-column">
      <div class="section">
        <h3>{{ t("user.settings") }}</h3>
        <div class="form-group floating">
          <BaseLabel>{{ t("user.language") }}</BaseLabel>
          <BaseSelect v-model="form.lang_id" :options="langs" valueKey="id" :labelFn="(a) => `${a.name}`"
            :placeholder="t('common.select')" />
        </div>
        <div v-if="errors.lang_id" class="error">
          {{ errors.lang_id }}
        </div>

        <BaseCheckbox v-model="form.show_net_price">
          {{ t("user.show_net_prices") }}
        </BaseCheckbox>

        <BaseCheckbox v-model="form.show_gross_price">
          {{ t("user.show_gross_prices") }}
        </BaseCheckbox>

        <BaseCheckbox v-model="form.is_active">
          {{ t("user.active_user") }}
        </BaseCheckbox>
      </div>
      <div class="section">

        <h3>{{ t("user.modules") }}</h3>

        <div class="modules-grid">
          <BaseCheckbox v-for="m in modules" :key="m.id" :model-value="form.modules.includes(m.id)"
            :disabled="m.disabled" @update:modelValue="() => toggleModule(m.id)" class="module-item"
            :class="{ disabled: m.disabled }">
            {{ m.name }}
          </BaseCheckbox>
        </div>
      </div>
    </div>


    <!-- 💾 SUBMIT -->
    <div class="full">
      <BaseButton type="submit" class="submit-btn">
        {{ t(props.isEdit ? "user.save_user" : "user.create_user") }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import BaseLabel from "@shared/ui/BaseLabel.vue";
import BaseInput from "@shared/ui/BaseInput.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";
import BaseAutocomplete from "@shared/components/BaseAutocomplete/BaseAutocomplete.vue";
import BaseCheckbox from "@shared/components/BaseCheckbox/BaseCheckbox.vue";
import { useUserForm } from "./UserForm";
import BaseIcon from "@shared/ui/BaseIcon.vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const emit = defineEmits(["submit"]);

const props = defineProps<{
  isEdit?: boolean;
}>();

const {
  form,
  errors,
  units,
  selectedUnits,
  selectedMainUnit,
  langs,
  onSearch,
  onSelectUnit,
  onSelectMainUnit,
  removeUnit,
  permissions,
  agents,
  modules,
  toggleModule,
  submit,
  setBackendErrors,
  setFormData,
  addresses,
  toggleAddress,
} = useUserForm(emit, { isEdit: props.isEdit });

const handleValidationError = (backendErrors: Record<string, string[]>) => {
  setBackendErrors(backendErrors);
};

defineExpose({
  handleValidationError,
  setFormData,
});
</script>

<style scoped src="@admin/assets/Form.css"></style>