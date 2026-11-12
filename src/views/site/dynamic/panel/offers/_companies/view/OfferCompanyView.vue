<template>
    <div class="offer-company-view">

        <template v-if="company">

            <BigCard :title="company.name">

                <template #actions>
                    <BaseButton @click="goToEdit">
                        <BaseIcon name="edit" />
                    </BaseButton>
                </template>

                <div class="row g-3">

                    <Info :label="t('offer.company_name')" :value="company.name" />

                    <Info :label="t('offer.authorized_person')" :value="company.authorized_person || '-'" />

                    <Info :label="t('offer.city')" :value="`${company.zip_code} ${company.city}`" />

                    <Info :label="t('offer.address')"
                        :value="`${company.street} ${company.house_number}${company.apartment ? '/' + company.apartment : ''}`" />

                    <Info :label="t('common.phone')" :value="company.phone_1 || '-'" />

                    <Info :label="t('common.phone_2')" :value="company.phone_2 || '-'" />

                    <Info :label="t('common.email')" :value="company.email_1 || '-'" />

                    <Info :label="t('common.email_2')" :value="company.email_2 || '-'" />

                    <Info :label="t('offer.is_for_others')"
                        :value="company.is_for_others ? t('common.yes') : t('common.no')" />

                    <Info :label="t('offer.is_archive')"
                        :value="company.is_archive ? t('common.yes') : t('common.no')" />

                    <Info :label="t('common.created_at')" :value="company.created_at" />

                    <Info :label="t('common.updated_at')" :value="company.updated_at" />

                </div>

            </BigCard>

            <BigCard v-if="company.user" :title="t('user.user')" class="mt-3">

                <div class="row g-3">

                    <Info :label="t('user.user')" :value="company.user.fullname" />

                </div>

            </BigCard>

        </template>

        <div v-else class="alert alert-warning">
            {{ t('offer.company_not_found') }}
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import api from "@/core/api/axios";

import BigCard from "@shared/components/BigCard.vue";
import Info from "@shared/ui/Info.vue";

import BaseButton from "@shared/ui/BaseButton.vue";
import BaseIcon from "@shared/ui/BaseIcon.vue";

import { useUiStore } from "@/core/stores/uiStore";
import { useNavigation } from "@/composables/useNavigation";
import type { OfferCompany } from "@/composables/types/offerCompany";

const { t } = useI18n();

const route = useRoute();

const ui = useUiStore();

const { goTo } = useNavigation();

const loading = ref(false);

const company = ref<OfferCompany | null>(null);

const companyId = Number(route.params.id);

const loadCompany = async () => {

    loading.value = true;

    ui.showLoader();

    try {

        const { data } = await api.get(`/offers/company/${companyId}`);

        company.value = data.data;

    } catch (e) {

        console.error(e);

        ui.showError(
            t("offer.download_error")
        );

    } finally {

        loading.value = false;

        ui.hideLoader();

    }

};

const goToEdit = () => {

    goTo("offerCompanyEdit", {
        id: companyId
    });

};

onMounted(loadCompany);
</script>