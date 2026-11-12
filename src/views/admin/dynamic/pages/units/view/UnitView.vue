<template>

    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border"></div>
    </div>

    <template v-else-if="unit">

        <!-- KONTRAHENT -->
        <BigCard :title="unit.name">

            <template #actions>
                <span class="badge" :class="unit.is_active ? 'bg-success' : 'bg-danger'">
                    {{ unit.is_active ? t("common.active") : t("common.inactive") }}
                </span>
            </template>

            <div class="row g-3">

                <Info :label="t('unit.number')" :value="unit.number" />

                <Info :label="t('unit.description')" :value="unit.description" />

                <Info :label="t('unit.logisticsMin')" :value="unit.logistics_min" />

                <Info :label="t('unit.merchantLimit')" :value="unit.merchant_limit" />

                <Info :label="t('unit.receivables')" :value="unit.receivables" />

                <Info :label="t('unit.overdueReceivables')" :value="unit.overdue_receivables" />

            </div>

        </BigCard>

        <BigCard :title="t('unit.checkoutDefaults')" class="mt-3">
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">{{ t("unit.defaultDelivery") }}</label>
                    <BaseSelect v-model="defaultDeliveryId" :options="deliveryOptions" labelKey="name" valueKey="id"
                        :placeholder="t('unit.useConfiguration')" />
                </div>
                <div class="col-md-6">
                    <label class="form-label">{{ t("unit.defaultPayment") }}</label>
                    <BaseSelect v-model="defaultPaymentId" :options="paymentOptions" labelKey="name" valueKey="id"
                        :placeholder="t('unit.useConfiguration')" />
                </div>
                <div v-if="defaultsMessage" class="col-12" :class="defaultsError ? 'text-danger' : 'text-success'">
                    {{ defaultsMessage }}
                </div>
                <div class="col-12">
                    <BaseButton :disabled="defaultsLoading || defaultsSaving" :loading="defaultsSaving"
                        @click="saveDefaults">
                        {{ t("unit.saveDefaults") }}
                    </BaseButton>
                </div>
            </div>
        </BigCard>


        <!-- GŁÓWNY ADRES -->

        <AddressView v-if="unit.main_address" :address="unit.main_address" class="mt-3" />


        <!-- HANDLOWIEC -->

        <BigCard v-if="unit.agent" :title="t('unit.agent')" class="mt-3">

            <div class="row g-3">

                <Info :label="t('user.firstname')" :value="unit.agent.firstname" />

                <Info :label="t('user.lastname')" :value="unit.agent.lastname" />

                <Info :label="t('user.email')" :value="unit.agent.email" />

                <Info :label="t('user.phone')" :value="unit.agent.phone" />

            </div>

        </BigCard>


        <!-- ADRESY -->

        <BigCard v-if="unit.addresses?.length" :title="t('unit.addresses')" class="mt-3">
            <ul class="list-group">
                <router-link v-for="address in unit.addresses" :key="address.id"
                    :to="{ name: 'admin.address', params: { id: address.id } }"
                    class="list-group-item list-group-item-action text-decoration-none text-reset">
                    <strong>{{ address.alias }}</strong>
                    <br>
                    {{ address.street }}, {{ address.postcode }} {{ address.city }}
                </router-link>
            </ul>
        </BigCard>


        <!-- UŻYTKOWNICY -->
        <BigCard :title="t('unit.users')" class="mt-3">
            <UserTable :users="unit.users" />
        </BigCard>


        <!-- ODDZIAŁY -->

        <BigCard v-if="unit.children?.length" :title="t('unit.children')" class="mt-3">

            <ul class="list-group">

                <li v-for="child in unit.children" :key="child.id" class="list-group-item">
                    {{ child.name }}
                </li>

            </ul>

        </BigCard>

    </template>

    <div v-else class="alert alert-warning">
        {{ t("unit.not_found") }}
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import api from "@/core/api/axios";
import { useUnit } from "./UnitView";
import { useI18n } from "vue-i18n";

import BigCard from "@shared/components/BigCard.vue";
import Info from "@shared/ui/Info.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import AddressView from "../../addresses/view/AddressView.vue";
import UserTable from "../../users/table/UserTable.vue";

const { t } = useI18n();

const {
    unit,
    loading,
} = useUnit();

type MethodOption = { id: number; name: string | null };
const deliveryOptions = ref<{ id: number | null; name: string }[]>([]);
const paymentOptions = ref<{ id: number | null; name: string }[]>([]);
const defaultDeliveryId = ref<number | null>(null);
const defaultPaymentId = ref<number | null>(null);
const defaultsLoading = ref(true);
const defaultsSaving = ref(false);
const defaultsError = ref(false);
const defaultsMessage = ref("");

watch(unit, value => {
    defaultDeliveryId.value = value?.default_delivery ?? null;
    defaultPaymentId.value = value?.default_payment ?? null;
}, { immediate: true });

onMounted(async () => {
    defaultsLoading.value = true;
    try {
        const { data } = await api.get<{
            deliveries: MethodOption[];
            payments: MethodOption[];
        }>("/units/checkout-default-options");
        deliveryOptions.value = [
            { id: null, name: t("unit.useConfiguration") },
            ...data.deliveries.map(option => ({ ...option, name: option.name ?? "" })),
        ];
        paymentOptions.value = [
            { id: null, name: t("unit.useConfiguration") },
            ...data.payments.map(option => ({ ...option, name: option.name ?? "" })),
        ];
    } catch (error) {
        defaultsError.value = true;
        defaultsMessage.value = t("unit.defaultsSaveError");
        console.error("load checkout default options", error);
    } finally {
        defaultsLoading.value = false;
    }
});

async function saveDefaults() {
    if (!unit.value) return;

    defaultsSaving.value = true;
    defaultsMessage.value = "";
    defaultsError.value = false;

    try {
        await api.put(`/units/${unit.value.id}/checkout-defaults`, {
            default_delivery: defaultDeliveryId.value,
            default_payment: defaultPaymentId.value,
        });
        unit.value.default_delivery = defaultDeliveryId.value;
        unit.value.default_payment = defaultPaymentId.value;
        defaultsMessage.value = t("unit.defaultsSaved");
    } catch (error) {
        defaultsError.value = true;
        defaultsMessage.value = t("unit.defaultsSaveError");
        console.error("save checkout defaults", error);
    } finally {
        defaultsSaving.value = false;
    }
}
</script>
