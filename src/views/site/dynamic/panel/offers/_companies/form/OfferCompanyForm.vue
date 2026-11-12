<template>

    <form class="admin-form" @submit.prevent>

        <div class="section full">

            <h3>{{ t("offer.company_data") }}</h3>

            <div class="row g-4">

                <div class="col-12 col-lg-6">
                    <div class="form-group floating">
                        <BaseLabel>{{ t("offer.company_name") }}</BaseLabel>
                        <BaseInput v-model="form.name" />
                        <div v-if="errors.name" class="error">
                            {{ errors.name }}
                        </div>
                    </div>
                </div>

                <div class="col-12 col-lg-6">
                    <div class="form-group floating">
                        <BaseLabel>{{ t("offer.authorized_person") }}</BaseLabel>
                        <BaseInput v-model="form.authorized_person" />
                    </div>
                </div>

                <div class="col-12 col-lg-8">
                    <div class="form-group floating">
                        <BaseLabel>{{ t("address.street") }}</BaseLabel>
                        <BaseInput v-model="form.street" />
                    </div>
                </div>

                <div class="col-6 col-lg-2">
                    <div class="form-group floating">
                        <BaseLabel>{{ t("address.house_number") }}</BaseLabel>
                        <BaseInput v-model="form.house_number" />
                    </div>
                </div>

                <div class="col-6 col-lg-2">
                    <div class="form-group floating">
                        <BaseLabel>{{ t("address.apartment") }}</BaseLabel>
                        <BaseInput v-model="form.apartment" />
                    </div>
                </div>

                <div class="col-6 col-lg-3">
                    <div class="form-group floating">
                        <BaseLabel>{{ t("address.zip_code") }}</BaseLabel>
                        <BaseInput v-model="form.zip_code" />
                    </div>
                </div>

                <div class="col-6 col-lg-9">
                    <div class="form-group floating">
                        <BaseLabel>{{ t("address.city") }}</BaseLabel>
                        <BaseInput v-model="form.city" />
                    </div>
                </div>

                <div class="col-12 col-lg-6">
                    <div class="form-group floating">
                        <BaseLabel>{{ t("common.phone") }}</BaseLabel>
                        <BaseInput v-model="form.phone_1" />
                    </div>
                </div>

                <div class="col-12 col-lg-6">
                    <div class="form-group floating">
                        <BaseLabel>{{ t("common.phone_2") }}</BaseLabel>
                        <BaseInput v-model="form.phone_2" />
                    </div>
                </div>

                <div class="col-12 col-lg-6">
                    <div class="form-group floating">
                        <BaseLabel>{{ t("common.email") }}</BaseLabel>
                        <BaseInput v-model="form.email_1" />
                    </div>
                </div>

                <div class="col-12 col-lg-6">
                    <div class="form-group floating">
                        <BaseLabel>{{ t("common.email_2") }}</BaseLabel>
                        <BaseInput v-model="form.email_2" />
                    </div>
                </div>

            </div>

        </div>

        <div class="section full">
            <div class="row">
                <div class="col-12 col-md-6">
                    <BaseSwitch v-model="form.is_for_others" :label="t('offer.is_for_others')" />
                </div>

                <div class="col-12 col-md-6">
                    <BaseSwitch v-model="form.is_archive" :label="t('offer.is_archive')" />
                </div>

            </div>

        </div>

        <div class="submit-actions">

            <BaseButton type="button" @click="submit">

                {{ t("common.save") }}

            </BaseButton>

        </div>

    </form>

</template>

<script setup lang="ts">

import BaseButton from "@shared/ui/BaseButton.vue";
import BaseInput from "@shared/ui/BaseInput.vue";

import { useOfferCompanyForm } from "./OfferCompanyForm";

import type {
    OfferCompanyFormExpose
} from "@/composables/types/offerCompany";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const emit = defineEmits(["submit"]);

const {
    form,
    submit,
    errors,
    setBackendErrors,
    setFormData
} = useOfferCompanyForm(emit);

defineExpose<OfferCompanyFormExpose>({ setBackendErrors, setFormData });

</script>