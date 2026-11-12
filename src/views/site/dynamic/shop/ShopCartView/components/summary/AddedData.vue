<template>
    <div class="summary-container">
        <div class="summary-title">
            <BaseIcon name="comment" class="summary-icon" />

            <h6>
                {{ t('cart.summary_panel.additional_data') }}
            </h6>
        </div>

        <div class="summary-content">
            <!-- Uwagi -->
            <div class="summary-content-part">
                <BaseLabel for-id="notes">
                    {{ t('cart.checkout_summary.notes_label') }}
                </BaseLabel>

                <textarea v-model="localNotes" class="form-control" rows="3" :placeholder="t('cart.checkout_summary.notes_placeholder')
                    " @blur="onNotesSave" />
            </div>

            <div class="row g-3">
                <!-- Osoba kontaktowa -->
                <div class="col-md-6 summary-content-part">
                    <BaseLabel for-id="contact_person">
                        {{
                            t(
                                'cart.address_step.fields.contact_person'
                            )
                        }}
                    </BaseLabel>

                    <BaseInput id="contact_person" v-model="localPerson" :placeholder="t(
                        'cart.address_step.fields.contact_person'
                    )
                        " @blur="onContactSave" />
                </div>

                <!-- Data dostawy -->
                <div class="col-md-6 summary-content-part">
                    <BaseLabel for-id="delivery_date">
                        {{
                            t(
                                'cart.address_step.fields.delivery_date'
                            )
                        }}
                    </BaseLabel>

                    <BaseInput id="delivery_date" v-model="deliveryDate" type="date" :min="minDeliveryDate"
                        :placeholder="t(
                            'cart.address_step.fields.delivery_date'
                        )
                            " @change="onDeliveryDateSave" />
                </div>

                <div class="col-md-12 summary-content-part">
                    <BaseLabel for-id="customer_own_order_number">
                        {{
                            t(
                                'cart.address_step.fields.customer_own_order_number'
                            )
                        }}
                    </BaseLabel>

                    <BaseInput id="customer_own_order_number" v-model="localCustomerOwnOrderNumber" :placeholder="t(
                        'cart.address_step.fields.customer_own_order_number'
                    )
                        " @blur="onOwnNumberSave" />
                </div>

            </div>

            <!-- MPK / Cost Center -->
            <div v-if="hasCostCenters" class="summary-content-part">
                <BaseLabel for-id="cost_center" :required="isCostCenterRequired">
                    {{
                        t(
                            'cart.checkout_summary.cost_center'
                        )
                    }}
                </BaseLabel>

                <BaseSelect id="cost_center" :model-value="cartStore.costCenterId" :options="cartStore.centerCosts"
                    label-key="name" value-key="id" :placeholder="t(
                        'cart.checkout_summary.select_cost_center'
                    )
                        " :searchable="true" @update:model-value="onCostCenterChange" />

                <div v-if="
                    isCostCenterRequired &&
                    !cartStore.costCenterId
                " class="text-danger small mt-1">
                    {{
                        t(
                            'cart.checkout_summary.cost_center_required'
                        )
                    }}
                </div>
            </div>

            <!-- Podział dostawy -->
            <div v-if="hasSplitDeliveryOption" class="summary-content-part">
                <BaseLabel for-id="split_delivery">
                    {{
                        t(
                            'cart.summary_panel.delivery_method'
                        )
                    }}
                </BaseLabel>

                <div class="split-delivery-option">
                    <BaseRadio :model-value="splitDelivery" name="split_delivery" @update:model-value="
                        onSingleDeliveryChange
                    ">
                        {{ t('cart.delivery_single') }}
                    </BaseRadio>

                    <BaseRadio :model-value="!splitDelivery" name="split_delivery" @update:model-value="
                        onSplitDeliveryChange
                    ">
                        {{ t('cart.delivery_split') }}
                    </BaseRadio>
                </div>

                <div v-if="splitDeliveryLoading" class="text-muted small mt-1">
                    {{ t('common.saving') }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    computed,
    onMounted,
    ref,
    watch,
} from 'vue'
import { useI18n } from 'vue-i18n'

import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import BaseLabel from '@/views/shared/ui/BaseLabel.vue'
import BaseInput from '@/views/shared/ui/BaseInput.vue'
import BaseRadio from '@/views/shared/ui/BaseRadio.vue'
import BaseSelect from '@/views/shared/ui/BaseSelect.vue'

import {
    useCartStore,
    type CartProduct,
} from '@/core/stores/cartStore'
import { useAuthStore } from '@/core/stores/authStore'
import { useUiStore } from '@/core/stores/uiStore'

const { t } = useI18n()
const cartStore = useCartStore()
const authStore = useAuthStore()
const ui = useUiStore()

/**
 * --------------------------------------------------------------------------
 * Local values
 * --------------------------------------------------------------------------
 */

const localNotes = ref(cartStore.notes)
const localPerson = ref(cartStore.contactPerson || authStore.fullName)
const localCustomerOwnOrderNumber = ref(cartStore.customerOwnOrderNumber)
const deliveryDate = ref(cartStore.deliveryDate)

/**
 * --------------------------------------------------------------------------
 * Cost center / MPK
 * --------------------------------------------------------------------------
 */

/**
 * Pokazujemy MPK tylko wtedy, kiedy backend zwróci
 * przynajmniej jeden cost center.
 */
const hasCostCenters = computed(() => {
    return cartStore.centerCosts.length > 0
})

/**
 * Zakładamy, że informacja o wymaganym MPK przychodzi
 * razem z danymi dotyczącymi daty dostawy.
 *
 * Jeżeli u Ciebie pole nazywa się inaczej, zmieniamy
 * tylko tę jedną linijkę.
 */
const isCostCenterRequired = computed(() => {
    return Boolean(
        cartStore.centerCosts.length > 0
    )
})

async function onCostCenterChange(
    id: string | number | null
) {
    if (id === null) {
        return
    }

    if (id === cartStore.selectedCenterCost?.id) {
        return
    }

    if (typeof id === 'number') {
        await cartStore.selectCostCenter(id)
    }
}

/**
 * --------------------------------------------------------------------------
 * Split delivery
 * --------------------------------------------------------------------------
 */

/**
 * Backend zwraca split_delivery.
 *
 * Dzięki Boolean(...) jesteśmy bezpieczni również wtedy,
 * gdy API zwróci 0/1 zamiast true/false.
 */
const splitDelivery = ref(
    Boolean(cartStore.cart?.split_delivery)
)

const splitDeliveryLoading = ref(false)

const onSingleDeliveryChange = async (
    value: boolean
) => {
    if (!value) {
        return
    }

    await setSplitDelivery(true)
}

const onSplitDeliveryChange = async (
    value: boolean
) => {
    if (!value) {
        return
    }

    await setSplitDelivery(false)
}

const setSplitDelivery = async (
    value: boolean
) => {
    if (splitDelivery.value === value) {
        return
    }

    splitDelivery.value = value

    if (!cartStore.cart?.id) {
        return
    }

    splitDeliveryLoading.value = true

    try {
        await cartStore.updateSplitDelivery(value)
    } finally {
        splitDeliveryLoading.value = false
    }
}

/**
 * --------------------------------------------------------------------------
 * Watchers
 * --------------------------------------------------------------------------
 */

watch(
    () => cartStore.notes,
    value => {
        localNotes.value = value
    }
)

watch(
    () => cartStore.contactPerson,
    value => {
        if (value) {
            localPerson.value = value
        } else if (!localPerson.value.trim()) {
            localPerson.value = authStore.fullName
        }
    }
)
watch(
    () => cartStore.customerOwnOrderNumber,
    value => {
        localCustomerOwnOrderNumber.value = value
    }
)

watch(
    () => cartStore.deliveryDate,
    value => {
        deliveryDate.value = value
    }
)

/**
 * Jeżeli koszyk zostanie odświeżony i backend zwróci
 * inną wartość split_delivery, aktualizujemy radio.
 */
watch(
    () => cartStore.cart?.split_delivery,
    value => {
        splitDelivery.value = Boolean(value)
    }
)

/**
 * Jeżeli backend po fetchu ustawi/zmieni wybrane MPK,
 * synchronizujemy lokalny model przez store.
 *
 * Tutaj nie potrzebujemy osobnego refa, ponieważ
 * BaseSelect korzysta bezpośrednio z cartStore.costCenterId.
 */

/**
 * --------------------------------------------------------------------------
 * Split delivery availability
 * --------------------------------------------------------------------------
 */

/**
 * Sprawdzamy, czy koszyk faktycznie ma różne sposoby /
 * terminy dostępności.
 */
const hasSplitDeliveryOption = computed(() => {
    const items = cartStore.cart?.items ?? []

    if (items.length <= 1) {
        return false
    }

    const groups = new Set(
        items.map(item => getDeliveryGroup(item))
    )

    return groups.size > 1
})

function getDeliveryGroup(
    item: CartProduct
): string {
    const isPartial =
        item.stock_quantity > 0 &&
        item.stock_quantity < item.quantity

    if (isPartial) {
        return `partial:${item.delivery_text}`
    }

    if (item.stock_quantity <= 0) {
        return `unavailable:${item.delivery_text}`
    }

    return `available:${item.delivery_text}`
}

/**
 * --------------------------------------------------------------------------
 * Save handlers
 * --------------------------------------------------------------------------
 */

async function onNotesSave() {
    if (localNotes.value !== cartStore.notes) {
        await cartStore.saveNotes(
            localNotes.value
        )
    }
}

async function onContactSave() {
    if (
        localPerson.value !==
        cartStore.contactPerson
    ) {
        await cartStore.saveContactPerson(
            localPerson.value
        )
    }
}

async function onOwnNumberSave() {
    if (
        localCustomerOwnOrderNumber.value !==
        cartStore.customerOwnOrderNumber
    ) {
        await cartStore.saveCustomerOwnOrderNumber(
            localCustomerOwnOrderNumber.value
        )
    }
}

async function onDeliveryDateSave() {
    if (
        deliveryDate.value !==
        cartStore.deliveryDate
    ) {
        await cartStore.saveDeliveryDate(
            deliveryDate.value
        )
    }
}

/**
 * --------------------------------------------------------------------------
 * Delivery date
 * --------------------------------------------------------------------------
 */

function formatLocalDate(date: Date): string {
    const year = date.getFullYear()

    const month = String(
        date.getMonth() + 1
    ).padStart(2, '0')

    const day = String(
        date.getDate()
    ).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const tomorrow = new Date()

tomorrow.setDate(
    tomorrow.getDate() + 1
)

const minDeliveryDate =
    formatLocalDate(tomorrow)

/**
 * --------------------------------------------------------------------------
 * Initial data
 * --------------------------------------------------------------------------
 */

onMounted(async () => {
    if (!authStore.fullName && !authStore.initialized) {
        await authStore.fetchMe()
    }

    if (!cartStore.contactPerson && authStore.fullName) {
        localPerson.value = authStore.fullName
        const savedCart = await cartStore.saveContactPerson(authStore.fullName)
        if (!savedCart) {
            ui.showError(t('common.error_occurred'))
        }
    }

    if (cartStore.addresses.length === 0) {
        await cartStore.fetchAddresses()
    }

    if (cartStore.deliveryMethods.length === 0) {
        await cartStore.fetchDeliveryMethods()
    }

    if (cartStore.paymentMethods.length === 0) {
        await cartStore.fetchPaymentMethods()
    }

    /**
     * MPK / Cost Centers
     *
     * Jeżeli jeszcze ich nie mamy, pobieramy.
     */
    if (cartStore.centerCosts.length === 0) {
        await cartStore.fetchCheckoutData()
    }
})
</script>

<style scoped>
.split-delivery-option {
    display: flex;
    gap: var(--gap-lg);
}

.summary-content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-lg);
}
</style>