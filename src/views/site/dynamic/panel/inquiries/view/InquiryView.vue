<template>
    <div class="inquiry-view">
        <!-- 📄 DATA -->
        <template v-if="inquiry">

            <!-- 📋 INQUIRY -->
            <BigCard :title="inquiry.name">

                <template #actions>
                    <span class="badge bg-primary">
                        {{ inquiry.status?.name }}
                    </span>
                    <BaseButton class="ml-2" v-if="inquiry.status?.is_edit" @click="goToEdit">
                        <BaseIcon class="pointer" name="edit" />
                    </BaseButton>
                </template>

                <div class="row g-3">

                    <Info :label="t('inquiry.name')" :value="inquiry.name" />

                    <Info :label="t('inquiry.description')" :value="inquiry.description || '-'" />

                    <Info :label="t('common.total_gross')" :value="inquiry.price" />

                    <Info :label="t('common.total_gross')" :value="inquiry.price_tax" />

                    <Info :label="t('common.created_at')" :value="inquiry.created_at" />

                    <Info :label="t('common.updated_at')" :value="inquiry.updated_at" />

                </div>

            </BigCard>

            <!-- 👤 USER -->
            <BigCard v-if="inquiry.user" :title="t('user.user')" class="mt-3">

                <div class="row g-3">

                    <Info :label="t('user.user')" :value="inquiry.user.name" />

                    <Info :label="t('user.email')" :value="inquiry.user.email" />

                    <Info :label="t('user.unit')" :value="inquiry.unit.name" />

                </div>

            </BigCard>

            <!-- 📦 PRODUCTS -->
            <BigCard v-if="inquiry.positions?.length" :title="t('inquiry.products')" class="mt-3">
                <BaseTable :columns="columns" :data="inquiry.positions" :loading="loading">

                    <template #cell-name="{ row }">

                        <a v-if="row.product?.url" :href="resolve(row.product.url)" target="_blank"
                            rel="noopener noreferrer" class="text-primary text-decoration-none" @click.stop>
                            {{ row.product?.name }}
                        </a>

                        <span v-else>
                            {{ row.product?.name }}
                        </span>

                    </template>

                </BaseTable>
            </BigCard>

        </template>

        <!-- ❌ BRAK -->
        <div v-else class="alert alert-warning">
            {{ t('inquiry.not_found') }}
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

import api from "@/core/api/axios";

import Info from "@shared/ui/Info.vue";
import BigCard from "@shared/components/BigCard.vue";

import { useUiStore } from "@/core/stores/uiStore";

import { useI18n } from "vue-i18n";

const { t } = useI18n();

const route = useRoute();

const ui = useUiStore();

const loading = ref(true);

const inquiry = ref<any>(null);

const inquiryId = Number(route.params.id);

const loadInquiry = async () => {

    loading.value = true;

    ui.showLoader();

    try {

        const { data } = await api.get(
            `/inquiries/${inquiryId}`
        );

        inquiry.value = data.data;

    } catch (e) {

        console.error(e);

        ui.showError(
            t("inquiry.download_error")
        );

    } finally {

        loading.value = false;

        ui.hideLoader();
    }
};
import { useNavigation } from "@/composables/useNavigation";
const { goTo } = useNavigation();


import BaseTable from "@shared/components/BaseTable/BaseTable.vue";

import { useUrlResolver } from "@/composables/useUrlResolver";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";
const { resolve } = useUrlResolver();

const goToEdit = () => {
    goTo('inquiryEdit', { id: inquiryId });
};
import { computed } from "vue";

const columns = computed(() => [
    { key: 'lp' },
    {
        key: "name",
        label: t("inquiry.product"),
    },
    {
        key: "quantity",
        label: t("inquiry.quantity"),
    },
    {
        key: "price",
        label: t("common.total_net"),
    },
    {
        key: "price_tax",
        label: t("common.total_gross"),
    },
    {
        key: "total_amount",
        label: t("common.total_net"),
    },
    {
        key: "total_amount_tax",
        label: t("common.total_gross"),
    },
    {
        key: "notes",
        label: t("common.notes"),
    },
]);

onMounted(loadInquiry);
</script>