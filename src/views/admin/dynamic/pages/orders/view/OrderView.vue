<template>

    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border"></div>
    </div>

    <template v-else-if="order">

        <section v-if="route.query.placed === '1'" class="order-placed-notice mb-3">
            <h2 class="h4 mb-1">{{ t('cart.order_success.thank_you') }}</h2>
            <p class="mb-0">{{ t('cart.order_success.message') }}</p>
        </section>

        <section v-if="approvalRows.length" class="order-approvals">
            <header class="order-approvals__header">
                <div>
                    <h2>{{ t('orderApproval.title') }}</h2>
                    <p>{{ t(approvalMode ? 'orderApproval.order_notice' : 'orderApproval.customer_notice') }}</p>
                </div>
                <span class="order-approvals__order-state" :class="approvalStatusClass(order.approval_status === 'rejected' ? -1 : order.approval_status === 'approved' ? 1 : 0)">
                    {{ t(`orderApproval.order_states.${order.approval_status}`) }}
                </span>
            </header>

            <div class="order-approvals__table-wrap">
                <table class="order-approvals__table">
                    <thead>
                        <tr>
                            <th>{{ t('orderApproval.limit') }}</th>
                            <th>{{ t('orderApproval.level') }}</th>
                            <th>{{ t('orderApproval.usage') }}</th>
                            <th>{{ t('orderApproval.acceptor') }}</th>
                            <th>{{ t('orderApproval.status') }}</th>
                            <th>{{ t('orderApproval.decision_date') }}</th>
                            <th v-if="approvalMode">{{ t('orderApproval.actions') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="approval in approvalRows" :key="approval.id">
                            <td>
                                <strong>{{ approval.limit_name }}</strong>
                                <small v-if="approval.unit_name">{{ approval.unit_name }}</small>
                            </td>
                            <td>
                                {{ approval.level_order }}
                                <small>{{ t('orderApproval.required_count', { count: approval.required_approvals }) }}</small>
                            </td>
                            <td class="order-approvals__usage">
                                <span v-if="[1, 3, 4].includes(approval.limit_type)">
                                    {{ formatQuantity(approval.used_quantity) }}
                                    / {{ formatQuantity(approval.quantity_limit) }} {{ t('orderApproval.quantity_unit')
                                    }}
                                </span>
                                <span v-if="[2, 3, 4].includes(approval.limit_type)">
                                    {{ formatAmount(approval.used_amount) }}
                                    / {{ formatAmount(approval.price_limit) }} zł
                                </span>
                            </td>
                            <td>{{ approval.acceptor_name || '—' }}</td>
                            <td>
                                <span class="order-approvals__status" :class="approvalStatusClass(approval.status)">
                                    {{ approvalStatusLabel(approval.status) }}
                                </span>
                            </td>
                            <td>{{ approval.updated_at || '—' }}</td>
                            <td v-if="approvalMode">
                                <div v-if="approval.can_act" class="order-approvals__actions">
                                    <button type="button" class="order-approvals__button is-approve"
                                        :disabled="respondingId !== null" @click="respond(approval.id, 'accept')">
                                        {{ t('orderApproval.accept') }}
                                    </button>
                                    <button type="button" class="order-approvals__button is-reject"
                                        :disabled="respondingId !== null" @click="respond(approval.id, 'reject')">
                                        {{ t('orderApproval.reject') }}
                                    </button>
                                </div>
                                <span v-else class="text-muted">—</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <BigCard :title="t('order.title') + ' #' + order.number">

            <template #actions>
                <span v-if="order.status?.current" class="badge" :style="{
                    background: order.status.current.status.background,
                    color: order.status.current.status.color
                }">
                    {{ order.status.current.status.name }}
                </span>
            </template>

            <section class="order-totals" :aria-label="t('common.total_gross')">
                <div class="order-total-card order-total-card--net">
                    <span class="order-total-label">{{ t('common.total_net') }}</span>
                    <strong class="order-total-value">{{ order.price || '—' }}</strong>
                </div>
                <div class="order-total-card order-total-card--gross">
                    <span class="order-total-label">{{ t('common.total_gross') }}</span>
                    <strong class="order-total-value">{{ order.price_tax || '—' }}</strong>
                </div>
            </section>

            <div class="row g-3">
                <Info :label="t('common.name')" :value="order.name" />

                <Info :label="t('common.delivery_date')" :value="order.delivery_date" />
                <Info :label="t('common.created_at')" :value="order.created_at" />

                <Info :label="t('common.contractor')" :value="order.cart.unit?.name" />
                <Info :label="t('user.user')" :value="order.cart.user?.name" />
                <Info :label="t('cart.address')" :value="order.cart.address?.full" />
                <Info :label="t('cart.address_step.fields.contact_person')" :value="order.cart.contact_person" />
                <Info :label="t('cart.address_step.fields.customer_own_order_number')"
                    :value="order.cart.customer_own_order_number" />

                <Info :label="t('cart.payment')" :value="order.cart.payment_method" />
                <Info :label="t('cart.transport')" :value="order.cart.transport_method" />
                <Info :label="t('order.delivery_preference')" :value="deliveryPreference" />
            </div>
            <div v-if="order.cart.notes" class="mt-3">
                <strong>{{ t('cart.comments') }}:</strong>
                <div class="text-muted">{{ order.cart.notes }}</div>
            </div>

        </BigCard>

        <BigCard v-if="isAdmin" :title="t('order.change_status')" class="mt-3">
            <div class="row g-3 align-items-end">
                <div class="col-md-6">
                    <BaseSelect v-model="selectedStatusId" :options="orderStatuses" labelKey="name" valueKey="id"
                        :placeholder="t('order.select_status')" />
                </div>
                <div class="col-md-auto">
                    <BaseButton :disabled="savingStatus || !selectedStatusId" :loading="savingStatus"
                        @click="saveStatus">
                        {{ t('order.save_status') }}
                    </BaseButton>
                </div>
            </div>
        </BigCard>

        <BigCard :title="t('common.delivery')" class="mt-3" v-if="order.tracking?.number">

            <div class="row g-3">
                <Info :label="t('common.delivery_number')" :value="order.tracking.number" />

                <div class="col-12">
                    <a v-if="order.tracking.url" :href="resolve(order.tracking.url)" target="_blank"
                        class="btn btn-outline-primary btn-sm">
                        {{ t("order.track_package") }}
                    </a>
                </div>
            </div>

        </BigCard>
        <BigCard v-if="order.cart.payment_method_code === 'prepayment'"
            :title="t('cart.order_success.prepayment_title')" class="mt-3">
            <div class="row g-3 order-payment-fields">
                <div class="col-12 col-md-6 col-lg-4 order-payment-field">
                    <BaseLabel for-id="payment-term" class-name="order-payment-field__label">
                        {{ t('cart.order_success.payment_term') }}
                    </BaseLabel>
                    <BaseInput id="payment-term" class="order-payment-field__input" :model-value="paymentTerm"
                        readonly />
                </div>
                <div class="col-12 col-md-6 col-lg-4 order-payment-field">
                    <BaseLabel for-id="bank-account" class-name="order-payment-field__label">
                        {{ t('cart.order_success.bank_account') }}
                    </BaseLabel>
                    <BaseInput id="bank-account" class="order-payment-field__input"
                        :model-value="order.cart.payment_instructions?.bank_account || '—'" readonly />
                </div>
                <div class="col-12 col-md-6 col-lg-4 order-payment-field">
                    <BaseLabel for-id="bank-name" class-name="order-payment-field__label">
                        {{ t('cart.order_success.bank_name') }}
                    </BaseLabel>
                    <BaseInput id="bank-name" class="order-payment-field__input"
                        :model-value="order.cart.payment_instructions?.bank_name || '—'" readonly />
                </div>
                <div class="col-12 col-md-6 col-lg-4 order-payment-field">
                    <BaseLabel for-id="bank-address" class-name="order-payment-field__label">
                        {{ t('cart.order_success.bank_address') }}
                    </BaseLabel>
                    <BaseInput id="bank-address" class="order-payment-field__input"
                        :model-value="order.cart.payment_instructions?.bank_address || '—'" readonly />
                </div>
                <div class="col-12 col-md-6 col-lg-8 order-payment-field">
                    <BaseLabel for-id="transfer-title" class-name="order-payment-field__label">
                        {{ t('cart.order_success.transfer_title') }}
                    </BaseLabel>
                    <BaseInput id="transfer-title" class="order-payment-field__input" :model-value="transferTitle"
                        readonly />
                </div>
            </div>
        </BigCard>
        <BigCard v-if="false" :title="t('common.status_history')" class="mt-3">
            <StatusHistory :items="order.status?.history" emptyText="Brak historii" />
        </BigCard>

        <BigCard :title="t('common.products')" class="mt-3">

            <BaseTable :columns="columns" :data="order.cart.products || []" :loading="loading">

                <template #cell-name="{ row }">
                    <a v-if="row.url" :href="resolve(row.url)" target="_blank" class="text-primary text-decoration-none"
                        @click.stop>
                        {{ row.name }}
                    </a>
                    <span v-else>{{ row.name }}</span>
                </template>

            </BaseTable>

        </BigCard>

        <p v-if="hasMadeToOrderProducts" class="order-made-to-order-notice mt-3">
            {{ t('cart.order_success.made_to_order_notice') }}
        </p>

    </template>

    <div v-else class="alert alert-warning">
        {{ t("order.order_not_found") }}
    </div>

</template>

<script setup lang="ts">
import api from "@/core/api/axios";
import { watch, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { isAxiosError } from "axios";

import BigCard from "@shared/components/BigCard.vue";
import StatusHistory from "./StatusHistory.vue";
import Info from "@shared/ui/Info.vue";
import BaseLabel from "@/views/shared/ui/BaseLabel.vue";
import BaseInput from "@/views/shared/ui/BaseInput.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import { useUrlResolver } from "@/composables/useUrlResolver";
import { useI18n } from "vue-i18n";
import { useLangStore } from "@/core/stores/langStore";
import { useUiStore } from "@/core/stores/uiStore";
const { t } = useI18n();
const langStore = useLangStore();
const ui = useUiStore();

const route = useRoute();
const { resolve } = useUrlResolver();
const props = withDefaults(defineProps<{
    approvalMode?: boolean
    isAdmin?: boolean
}>(), {
    approvalMode: false,
    isAdmin: false,
});

const order = ref<any>(null);
const approvalRows = computed(() => props.approvalMode
    ? order.value?.limit_approvals ?? []
    : order.value?.approval_progress ?? []);
const loading = ref(false);
const respondingId = ref<number | null>(null);
const orderStatuses = ref<{ id: number; name: string }[]>([]);
const selectedStatusId = ref<number | null>(null);
const savingStatus = ref(false);

const hasMadeToOrderProducts = computed(() =>
    order.value?.cart?.products?.some(
        (product: { is_made_to_order?: boolean }) => product.is_made_to_order
    ) ?? false
);

const paymentTerm = computed(() => {
    const days = order.value?.cart?.payment_instructions?.payment_days ?? 0;
    return days > 0
        ? t('cart.order_success.payment_due_days', { days })
        : t('cart.order_success.payment_due_on_document');
});

const transferTitle = computed(() =>
    t('cart.order_success.transfer_title_value', {
        number: order.value?.number ?? '',
    })
);

const deliveryPreference = computed(() => {
    if (order.value?.split_delivery === true) {
        return t('order.delivery_several_shipments');
    }

    if (order.value?.split_delivery === false) {
        return t('order.delivery_together_later');
    }

    return t('order.delivery_preference_unknown');
});

const fetchOrder = async () => {
    const orderId = Number(route.params.id);
    if (!Number.isInteger(orderId) || orderId < 1) {
        order.value = null;
        return;
    }

    loading.value = true;
    try {
        const url = props.approvalMode
            ? `/limit-approvals/orders/${orderId}`
            : `/orders/${orderId}`;
        const { data } = await api.get(url);
        order.value = data.data;
        selectedStatusId.value = order.value?.status?.current?.status?.id ?? null;
    } catch (error) {
        order.value = null;
        ui.showError(
            isAxiosError(error)
                ? error.response?.data?.message ?? t('orderApproval.load_error')
                : t('orderApproval.load_error')
        );
    } finally {
        loading.value = false;
    }
};

watch(
    [() => route.params.id, () => langStore.current, () => props.approvalMode],
    fetchOrder,
    { immediate: true }
);

watch(
    [() => route.params.id, () => langStore.current, () => props.isAdmin],
    async () => {
        if (!props.isAdmin) return;

        try {
            const { data } = await api.get<{ data: { id: number; name: string }[] }>("/orders/statuses");
            orderStatuses.value = data.data;
        } catch (error) {
            ui.showError(
                isAxiosError(error)
                    ? error.response?.data?.message ?? t('order.statuses_load_error')
                    : t('order.statuses_load_error')
            );
        }
    },
    { immediate: true }
);

async function saveStatus() {
    if (!props.isAdmin || !order.value || !selectedStatusId.value) return;

    savingStatus.value = true;
    try {
        await api.patch(`/orders/${order.value.id}/status`, {
            status_id: selectedStatusId.value,
        });
        ui.showSuccess(t('order.status_saved'));
        await fetchOrder();
    } catch (error) {
        ui.showError(
            isAxiosError(error)
                ? error.response?.data?.message ?? t('order.status_save_error')
                : t('order.status_save_error')
        );
    } finally {
        savingStatus.value = false;
    }
}

function formatQuantity(value: number | null) {
    return value === null ? '—' : new Intl.NumberFormat(langStore.current, {
        maximumFractionDigits: 3,
    }).format(value)
}

function formatAmount(value: number | null) {
    return value === null ? '—' : new Intl.NumberFormat(langStore.current, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}

function approvalStatusLabel(status: number) {
    const key = status === 1
        ? 'approved'
        : status === 2
            ? 'completed_by_others'
            : status === -1
                ? 'rejected'
                : status === -2
                    ? 'not_required'
                    : 'pending'
    return t(`orderApproval.statuses.${key}`)
}

function approvalStatusClass(status: number) {
    return status === 1
        ? 'is-approved'
        : status === 2
            ? 'is-completed-by-others'
            : status === -1
                ? 'is-rejected'
                : status === -2
                    ? 'is-inactive'
                    : 'is-pending'
}

async function respond(acceptationId: number, decision: 'accept' | 'reject') {
    respondingId.value = acceptationId
    try {
        await api.post(`/limit-approvals/${acceptationId}/${decision}`)
        ui.showSuccess(t(
            decision === 'accept'
                ? 'orderApproval.accept_success'
                : 'orderApproval.reject_success'
        ))
        window.dispatchEvent(new Event('limit-approval-updated'))
        await fetchOrder()
    } catch (error) {
        ui.showError(
            isAxiosError(error)
                ? error.response?.data?.message ?? t('orderApproval.action_error')
                : t('orderApproval.action_error')
        )
    } finally {
        respondingId.value = null
    }
}

const columns = computed(() => [
    {
        key: 'lp',
    },
    {
        key: 'name',
        label: t('products.details.name'),
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
        label: t('common.total_net'),
        formatter: (row: any) => row.special_data.total_price
    }
]);
</script>

<style scoped>
.order-payment-field {
    position: relative;
}

.order-payment-fields :deep(.order-payment-field__label) {
    position: absolute;
    top: -8px;
    left: 10px;
    z-index: 1;
    width: max-content;
    padding: 0 var(--padding-ex-sm);
    background: var(--bg-surface);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.2;
    pointer-events: none;
}

.order-payment-fields :deep(.order-payment-field__input) {
    min-height: 42px;
    padding: var(--padding-sm);
    border-color: var(--border-default);
    border-radius: var(--radius-sm);
    background-color: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--font-size-md);
}

.order-placed-notice {
    padding: var(--padding-md);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    background-color: var(--bg-surface);
    color: var(--text-primary);
}

.order-totals {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--gap-md);
    margin-bottom: var(--gap-lg);
}

.order-total-card {
    display: flex;
    min-width: 0;
    flex-direction: column;
    justify-content: center;
    gap: var(--gap-ex-sm);
    padding: var(--padding-md) var(--padding-lg);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
}

.order-total-card--gross {
    border-color: var(--accent);
    background: var(--accent-bg);
}

.order-total-label {
    color: var(--text-secondary);
    font-size: var(--font-size-sm-plus);
    font-weight: 600;
}

.order-total-value {
    color: var(--text-primary);
    font-size: clamp(1.35rem, 3vw, 1.8rem);
    line-height: 1.2;
    overflow-wrap: anywhere;
}

.order-total-card--gross .order-total-value {
    color: var(--accent-strong, var(--accent));
}

.order-made-to-order-notice {
    margin-bottom: 0;
    padding: var(--padding-md);
    border-left: 4px solid var(--accent);
    border-radius: var(--radius-sm);
    background: var(--accent-bg);
    color: var(--text-secondary);
    font-size: var(--font-size-sm-plus);
    line-height: 1.6;
}

@media (max-width: 575px) {
    .order-totals {
        grid-template-columns: 1fr;
    }
}
</style>

<style scoped>
.order-approvals {
    margin: 0 0 18px;
    overflow: hidden;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    box-shadow: var(--shadow-sm);
}

.order-approvals__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 17px 20px;
    border-bottom: 1px solid var(--border-light);
    background: var(--accent-bg);
}

.order-approvals__header h2 {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--font-size-lg);
    font-weight: 700;
}

.order-approvals__header p {
    margin: 4px 0 0;
    color: var(--text-secondary);
    font-size: var(--font-size-sm-plus);
}

.order-approvals__order-state,
.order-approvals__status {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 5px 10px;
    font-size: var(--font-size-sm);
    font-weight: 700;
    white-space: nowrap;
}

.is-approved {
    background: var(--success-bg, #e7f5ec);
    color: var(--success, #167344);
}

.is-completed-by-others {
    background: var(--accent-muted);
    color: var(--accent-strong, #143060);
}

.is-pending {
    background: var(--warning-bg, #fff4d6);
    color: var(--warning-text, #805b00);
}

.is-rejected {
    background: var(--error-bg, #fdeaea);
    color: var(--error, #b42318);
}

.is-inactive {
    background: var(--accent-bg);
    color: var(--text-secondary);
}

.order-approvals__table-wrap {
    overflow-x: auto;
}

.order-approvals__table {
    width: 100%;
    border-collapse: collapse;
}

.order-approvals__table thead {
    background: var(--accent-bg);
}

.order-approvals__table th {
    color: var(--text-primary);
    font-size: var(--font-size-sm-plus);
    font-weight: 600;
    text-align: left;
    white-space: nowrap;
}

.order-approvals__table th,
.order-approvals__table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-light);
    vertical-align: middle;
}

.order-approvals__table tbody tr:last-child td {
    border-bottom: 0;
}

.order-approvals__table td:first-child {
    min-width: 150px;
}

.order-approvals__table td:first-child small {
    display: block;
    margin-top: 3px;
    color: var(--text-secondary);
}

.order-approvals__usage {
    min-width: 170px;
    color: var(--text-secondary);
    font-size: var(--font-size-sm-plus);
}

.order-approvals__usage span {
    display: block;
    white-space: nowrap;
}

.order-approvals__actions {
    display: flex;
    gap: 7px;
}

.order-approvals__button {
    padding: 6px 10px;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: 700;
    white-space: nowrap;
}

.order-approvals__button:disabled {
    opacity: .6;
}

.order-approvals__button.is-approve {
    border-color: var(--success, #167344);
    background: var(--success-bg, #e7f5ec);
    color: var(--success, #167344);
}

.order-approvals__button.is-reject {
    border-color: var(--error, #b42318);
    background: var(--error-bg, #fdeaea);
    color: var(--error, #b42318);
}

@media (max-width: 767px) {
    .order-approvals__header {
        align-items: flex-start;
        flex-direction: column;
    }

    .order-approvals__table {
        min-width: 860px;
    }
}
</style>