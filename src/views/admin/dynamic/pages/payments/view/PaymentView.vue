<template>

    <!-- ⏳ LOADING -->
    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border"></div>
    </div>

    <!-- 📄 DATA -->
    <template v-else-if="payment">

        <!-- 💳 PAYMENT -->
        <BigCard :title="payment.name">

            <template #actions>
                <span class="badge" :class="payment.is_active ? 'bg-success' : 'bg-secondary'">
                    {{ payment.is_active ? t('common.active') : t('common.inactive') }}
                </span>
            </template>

            <div class="row g-3">

                <Info :label="t('payment.name')" :value="payment.name" />
                <Info :label="t('payment.code')" :value="payment.code" />
                <Info :label="t('common.sort_order')" :value="payment.sort_order" />

                <Info :label="t('payment.is_active')"
                    :value="payment.is_active ? t('common.active') : t('common.inactive')" />

                <Info :label="t('payment.commission_percent')" :value="payment.commission_percent" />
                <Info :label="t('payment.created_at')" :value="payment.created_at" />

            </div>

        </BigCard>

        <!-- 🌍 LANGS -->
        <BigCard v-if="payment.langs?.length" :title="t('payment.langs')" class="mt-3">

            <ul class="list-group">
                <li v-for="lang in payment.langs" :key="lang.id" class="list-group-item d-flex justify-content-between">

                    <strong>{{ lang.code.toUpperCase() }}</strong>
                    <span>{{ lang.name }}</span>

                </li>
            </ul>

        </BigCard>

        <!-- 🏦 CONFIGS -->
        <BigCard v-if="payment.configs?.length" :title="t('payment.configs')" class="mt-3">

            <div class="row g-3">

                <template v-for="config in payment.configs" :key="config.id">

                    <!-- separator / nagłówek -->
                    <div class="col-12 mt-2">
                        <div class="col-12 mt-3">
                            <div class="fw-bold text-primary">
                                {{ config.country?.code || '-' }} ({{ config.currency?.code || '-' }})
                            </div>
                        </div>
                    </div>

                    <Info :label="t('payment.currency')" :value="formatCurrency(config.currency)" />

                    <Info v-if="config.account_number" :label="t('payment.account_number')"
                        :value="config.account_number" />

                    <Info v-if="config.iban" :label="t('payment.iban')" :value="config.iban" />

                    <Info v-if="config.swift" :label="t('payment.swift')" :value="config.swift" />

                    <Info v-if="config.bank_name" :label="t('payment.bank_name')" :value="config.bank_name" />

                    <Info v-if="config.account_owner" :label="t('payment.account_owner')"
                        :value="config.account_owner" />

                </template>

            </div>

        </BigCard>

    </template>

    <!-- ❌ BRAK -->
    <div v-else class="alert alert-warning">
        {{ t('payment.not_found') }}
    </div>

</template>

<script setup lang="ts">
import { usePayment } from "./PaymentView";
import Info from "@shared/ui/Info.vue";
import BigCard from "@shared/components/BigCard.vue";
import { useI18n } from "vue-i18n";
import { watch } from "vue";
import { useLangStore } from "@/core/stores/langStore";

const { t } = useI18n();
const { payment, loading, load } = usePayment();
const langStore = useLangStore();

watch(
    () => langStore.current,
    async () => {
        await load();
    }
);

const formatCurrency = (currency?: {
    code: string;
    symbol: string;
} | null): string => {
    if (!currency) return "-";
    return `${currency.code} (${currency.symbol})`;
};
</script>