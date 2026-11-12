
<template>
  <form class="admin-form limit-form" @submit.prevent="submit">
    <div class="section">
      <h3>{{ t("limits.basic_data") }}</h3>

      <div class="form-group floating">
        <BaseLabel>{{ t("limits.name") }}</BaseLabel>
        <BaseInput v-model="form.name" />
        <div v-if="errors.name" class="error">
          {{ errors.name }}
        </div>
      </div>

      <div class="form-group floating">
        <BaseLabel>{{ t("limits.limit_type") }}</BaseLabel>
        <BaseSelect
          v-model="form.limit_type"
          :options="limitTypes"
          labelKey="label"
          valueKey="value"
          :placeholder="t('common.select')"
        />
        <div v-if="errors.limit_type" class="error">
          {{ errors.limit_type }}
        </div>
      </div>

      <div class="form-group floating">
        <BaseLabel>{{ t("limits.time_limit") }}</BaseLabel>
        <BaseSelect
          v-model="form.time_limit"
          :options="timeLimits"
          labelKey="label"
          valueKey="value"
          :placeholder="t('common.select')"
        />
        <div v-if="errors.time_limit" class="error">
          {{ errors.time_limit }}
        </div>
      </div>

      <div
        v-if="[1, 3, 4].includes(Number(form.limit_type))"
        class="form-group floating"
      >
        <BaseLabel>{{ t("limits.max_quantity") }}</BaseLabel>
        <BaseInput
          :model-value="form.quantity ?? ''"
          type="number"
          @update:model-value="setQuantity"
        />
        <div v-if="errors.quantity" class="error">
          {{ errors.quantity }}
        </div>
      </div>

      <div
        v-if="[2, 3, 4].includes(Number(form.limit_type))"
        class="form-group floating"
      >
        <BaseLabel>{{ t("limits.max_price") }}</BaseLabel>
        <BaseInput
          :model-value="form.price ?? ''"
          type="number"
          @update:model-value="setPrice"
        />
        <div v-if="errors.price" class="error">
          {{ errors.price }}
        </div>
      </div>

      <div class="form-group floating">
        <BaseLabel>{{ t("limits.approval_mode") }}</BaseLabel>
        <BaseSelect
          v-model="form.approval_mode"
          :options="approvalModes"
          labelKey="label"
          valueKey="value"
          :placeholder="t('common.select')"
        />
      </div>

      <div
        v-if="Number(form.time_limit) === 5"
        class="date-grid"
      >
        <div class="form-group floating">
          <BaseLabel>{{ t("limits.date_start") }}</BaseLabel>
          <BaseInput
            v-model="form.date_start"
            type="date"
          />
          <div v-if="errors.date_start" class="error">
            {{ errors.date_start }}
          </div>
        </div>

        <div class="form-group floating">
          <BaseLabel>{{ t("limits.date_end") }}</BaseLabel>
          <BaseInput
            v-model="form.date_end"
            type="date"
          />
          <div v-if="errors.date_end" class="error">
            {{ errors.date_end }}
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>{{ t("limits.settings") }}</h3>

      <BaseCheckbox v-model="form.is_exceedable">
        {{ t("limits.is_exceedable") }}
      </BaseCheckbox>

      <BaseCheckbox v-model="form.is_tax">
        {{ t("limits.include_tax") }}
      </BaseCheckbox>
    </div>

    <div class="full">
      <BaseButton type="submit" class="submit-btn">
        {{ isEdit ? t("limits.save_changes") : t("limits.create_limit") }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import BaseLabel from "@shared/ui/BaseLabel.vue";
import BaseInput from "@shared/ui/BaseInput.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";
import BaseCheckbox from "@shared/components/BaseCheckbox/BaseCheckbox.vue";

import {
  useLimitForm,
  type LimitFormData,
} from "./LimitForm";

const props = defineProps<{
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  submit: [form: LimitFormData];
}>();

const { t } = useI18n();
const setQuantity = (value: string | number) => {
  form.quantity = value === "" ? null : Number(value);
};
const setPrice = (value: string | number) => {
  form.price = value === "" ? null : Number(value);
};

const {
  form,
  errors,
  submit,
  setFormData,
  setBackendErrors,
} = useLimitForm((event, data) => emit(event, data));

const limitTypes = computed(() => [
  { value: 1, label: t("limits.type_quantity") },
  { value: 2, label: t("limits.type_financial") },
  { value: 3, label: t("limits.type_both") },
  { value: 4, label: t("limits.type_either") },
]);

const timeLimits = computed(() => [
  { value: 1, label: t("limits.week") },
  { value: 2, label: t("limits.month") },
  { value: 3, label: t("limits.quarter") },
  { value: 4, label: t("limits.year") },
  { value: 5, label: t("limits.custom_period") },
]);

const approvalModes = computed(() => [
  { value: "sequential", label: t("limits.approval_sequential") },
  { value: "parallel", label: t("limits.approval_parallel") },
]);

defineExpose({
  setFormData,
  handleValidationError: setBackendErrors,
});
</script>

<style scoped src="@admin/assets/Form.css"></style>

<style scoped>
.date-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 640px) {
  .date-grid {
    grid-template-columns: 1fr;
  }
}
</style>
