<template>

    <!-- ⏳ LOADING -->
    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border"></div>
    </div>

    <!-- 📄 DATA -->
    <template v-else-if="delivery">

        <!-- 🚚 DELIVERY -->
        <BigCard :title="delivery.name">

            <template #actions>

                <span class="badge" :class="delivery.is_active ? 'bg-success' : 'bg-secondary'">
                    {{
                        delivery.is_active
                            ? t('common.active')
                            : t('common.inactive')
                    }}
                </span>

            </template>

            <div class="row g-3">

                <Info :label="t('delivery.name')" :value="delivery.name" />

                <Info :label="t('delivery.code')" :value="delivery.code" />

                <Info :label="t('delivery.sort_order')" :value="delivery.sort_order" />

                <Info :label="t('delivery.is_active')" :value="delivery.is_active
                    ? t('common.active')
                    : t('common.inactive')
                    " />

                <Info :label="t('common.created_at')" :value="delivery.created_at" />

            </div>

        </BigCard>

        <!-- 🌍 LANGS -->
        <BigCard v-if="delivery.langs?.length" :title="t('delivery.langs')" class="mt-3">

            <ul class="list-group">

                <li v-for="lang in delivery.langs" :key="lang.lang_id" class="list-group-item">

                    <div class="fw-bold mb-1">
                        {{ lang.code?.toUpperCase() ?? "-" }}
                    </div>

                    <div>
                        {{ lang.name }}
                    </div>

                    <div v-if="lang.description" class="text-muted small mt-1">
                        {{ lang.description }}
                    </div>

                    <div v-if="lang.instructions" class="small mt-1">
                        {{ lang.instructions }}
                    </div>

                </li>

            </ul>

        </BigCard>

        <!-- ⚖️ RANGES -->
        <BigCard v-if="delivery.ranges?.length" :title="t('delivery.ranges')" class="mt-3">

            <div class="row g-3">

                <template v-for="range in delivery.ranges" :key="range.id">

                    <div class="col-12">
                        <hr>
                    </div>

                    <Info :label="t('delivery.min_weight')" :value="range.min_weight" />

                    <Info :label="t('delivery.max_weight')" :value="range.max_weight" />

                    <Info :label="t('delivery.price')" :value="range.price" />

                    <Info :label="t('payment.currency')" :value="getCurrency(range.currency_id)" />

                </template>

            </div>

        </BigCard>

    </template>

    <div v-else class="alert alert-warning">
        {{ t('delivery.not_found') }}
    </div>

</template>

<script setup lang="ts">

import { watch } from 'vue'
import { useI18n } from "vue-i18n";
import BigCard from "@shared/components/BigCard.vue";
import Info from "@shared/ui/Info.vue";
import { useDelivery } from "./DeliveryView";
import { useCurrencyStore } from "@/core/stores/currencyStore";
import { useLangStore } from "@/core/stores/langStore";

const { t } = useI18n();

const currencyStore = useCurrencyStore();

const {
    delivery,
    loading,
    load
} = useDelivery();
const langStore = useLangStore();

watch(
    () => langStore.current,
    async () => {
        await load();
    }
);

const getCurrency = (currencyId: number): string => {

    const currency = currencyStore.currencies.find(
        c => c.id === currencyId
    );

    if (!currency) {
        return String(currencyId);
    }

    return `${currency.code} (${currency.symbol})`;
};

</script>