<template>

    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border"></div>
    </div>

    <template v-else-if="cart">

        <!-- 🔹 Dane koszyka -->
        <BigCard :title="t('cart.title') + ' #' + cart.id">

            <template #actions>
                <span class="badge" :class="cart.is_active ? 'bg-success' : 'bg-secondary'">
                    {{ cart.is_active ? 'Aktywny' : 'Nieaktywny' }}
                </span>
            </template>

            <div class="row g-3">
                <Info :label="t('common.contractor')" :value="cart.unit?.name" />
                <Info :label="t('user.user')" :value="cart.user?.name" />
                <Info :label="t('cart.address')" :value="cart.address?.full" />

                <Info :label="t('cart.address')" :value="cart.payment_method" />
                <Info :label="t('cart.transport')" :value="cart.transport_method" />

                <Info :label="t('common.delivery_date')" :value="cart.delivery_date" />
                <Info :label="t('common.created_at')" :value="cart.created_at" />

                <Info :label="t('common.quantity')" :value="cart.summary?.total_quantity" />
                <Info :label="t('common.total_net')" :value="cart.summary?.total_price" />
            </div>

            <div v-if="cart.notes" class="mt-3">
                <strong>{{ t('common.comments') }}:</strong>
                <div class="text-muted">{{ cart.notes }}</div>
            </div>

        </BigCard>

        <!-- 🔹 Produkty -->
        <BigCard :title="t('common.products')" class="mt-3">

            <BaseTable :columns="columns" :data="cart.products || []" :loading="loading">


                <!-- 🔹 Nazwa -->
                <template #cell-name="{ row }">
                    <a v-if="row.url" :href="resolve(row.url)" target="_blank" class="text-primary text-decoration-none"
                        @click.stop>
                        {{ row.name }}
                    </a>
                    <span v-else>{{ row.name }}</span>
                </template>

            </BaseTable>

        </BigCard>

    </template>

    <div v-else class="alert alert-warning">
        {{ t('cart.cart_not_found') }}
    </div>

</template>

<script setup lang="ts">
import { watch, computed } from "vue";
import { useCart } from "./CartView";
import BigCard from "@shared/components/BigCard.vue";
import Info from "@shared/ui/Info.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import { useUrlResolver } from "@/composables/useUrlResolver";
import { useI18n } from "vue-i18n";
import { useLangStore } from "@/core/stores/langStore";
const langStore = useLangStore();

const { t } = useI18n();

const { cart, loading, fetchCart } = useCart();
const { resolve } = useUrlResolver();


watch(
    () => langStore.current,
    async () => {
        await fetchCart();
    }
);


const columns = computed(() => [
    {
        key: 'lp',
        label: t('common.no'),
    },
    {
        key: 'name',
        label: t('products.details.no'),
        sortable: true,
    },
    {
        key: 'indeks',
        label: t('products.details.indeks'),
        sortable: true,
    },
    {
        key: 'quantity',
        label: t('common.quantity'),
        formatter: (row: any) => {
            return `${row.special_data.quantity} ${row.uom?.name ?? ''}`;
        }
    },
    {
        key: 'price',
        label: t('products.details.price_net'),
        formatter: (row: any) => row.special_data.price
    },
    {
        key: 'total_price',
        label: t('products.details.total_net'),
        formatter: (row: any) => row.special_data.total_price
    }
]);
</script>