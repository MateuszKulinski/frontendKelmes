<template>

    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border"></div>
    </div>

    <template v-else-if="address">

        <BigCard :title="address.alias || t('address.address')">

            <template #actions>

                <span v-if="address.is_main !== undefined" class="badge"
                    :class="address.is_main ? 'bg-success' : 'bg-secondary'">
                    {{ address.is_main ? t("address.main") : t("address.additional") }}
                </span>

            </template>

            <div class="row g-3">

                <Info :label="t('address.company')" :value="address.company" />

                <Info :label="t('address.firstname')" :value="address.firstname" />

                <Info :label="t('address.lastname')" :value="address.lastname" />

                <Info :label="t('address.street')" :value="`${address.street ?? ''} ${address.house_number ?? ''}`" />

                <Info :label="t('address.apartment')" :value="address.apartment" />

                <Info :label="t('address.postcode')" :value="address.postcode" />

                <Info :label="t('address.city')" :value="address.city" />

                <Info :label="t('address.country')" :value="address.country" />

                <Info :label="t('address.phone')" :value="address.phone" />

                <Info :label="t('address.email')" :value="address.email" />

                <Info :label="t('address.vat')" :value="address.vat_number" />

            </div>

        </BigCard>

    </template>

    <div v-else class="alert alert-warning">
        {{ t("address.not_found") }}
    </div>

</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import BigCard from "@shared/components/BigCard.vue";
import Info from "@shared/ui/Info.vue";

import { useAddress } from "./AddressView";

const props = defineProps<{
    id?: number;
    address?: any;
}>();

const route = useRoute();
const { t } = useI18n();

const addressId = computed(() => {

    if (props.id) {
        return props.id;
    }

    if (route.params.id) {
        return Number(route.params.id);
    }

    return undefined;

});

const {
    address,
    loading,
} = useAddress({
    id: addressId.value,
    address: props.address,
});
</script>