<template>
    <div class="cart-step-summary">
        <h5 class="mb-3">{{ t('cart.checkout_summary.title') }}</h5>


        <!-- <CartProductsTable :is_editable="false" /> -->

        <div class="row mt-3 cart-summary-bottom-data">
            <div class="col-md-6">
                <DeliveryData />
            </div>
            <div class="col-md-6">
                <BillingData />
            </div>
            <div class="col-md-6">
                <ShipmentData @go-to-step="emit('goToStep', $event)" />
            </div>
            <div class="col-md-6">
                <PaymentData @go-to-step="emit('goToStep', $event)" />
            </div>
            <div class="col-md-12">
                <AddedData />
            </div>
            <div class="col-md-12">
                <div id="accept-platform-terms-field" class="form-check terms-field"
                    :class="{ 'terms-field--invalid': showTermsError }">
                    <input id="accept-platform-terms" :checked="acceptedTerms"
                        :aria-invalid="showTermsError" class="form-check-input" type="checkbox"
                        required @change="updateAcceptedTerms" />
                    <label class="form-check-label" :class="{ 'text-danger': showTermsError }"
                        for="accept-platform-terms">
                        <i18n-t keypath="cart.summary_panel.accept_terms" tag="span">
                            <a href="/cms/10-regulamin" target="_blank" @click.stop>{{
                                t('cart.summary_panel.accept_terms_link') }}</a>
                        </i18n-t>
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DeliveryData from './components/summary/DeliveryData.vue'
import BillingData from './components/summary/BillingData.vue'
import ShipmentData from './components/summary/ShipmentData.vue'
import AddedData from './components/summary/AddedData.vue'
import PaymentData from './components/summary/PaymentData.vue'

defineProps<{
    acceptedTerms: boolean
    showTermsError: boolean
}>()

const emit = defineEmits<{
    prev: []
    goToStep: [step: number]
    updateAcceptedTerms: [accepted: boolean]
}>()

const { t } = useI18n()

function updateAcceptedTerms(event: Event) {
    emit('updateAcceptedTerms', (event.target as HTMLInputElement).checked)
}

</script>

<style scoped>
@import './CartStep1Style.css';

.summary-tile {
    background: #f8f9fa;
}

.terms-field {
    border: 1px solid transparent;
    border-radius: 0.375rem;
    padding: 0.5rem 0.75rem 0.5rem calc(0.75rem + 1.5em);
    transition: background-color 0.2s, border-color 0.2s;
}

.terms-field--invalid {
    border-color: var(--bs-danger);
    background-color: rgba(var(--bs-danger-rgb), 0.06);
}

.terms-field--invalid .form-check-input {
    border-color: var(--bs-danger);
}
</style>
