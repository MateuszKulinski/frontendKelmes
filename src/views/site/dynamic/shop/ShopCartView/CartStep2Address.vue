<template>
    <div class="cart-step-address">
        <div v-if="cartStore.addressesLoading" class="text-center text-muted">
            {{ t("cart.loading") }}
        </div>

        <template v-else>
            <div class="adress-info">
                <h5>
                    {{ t("cart.steps.address") }}
                </h5>

                <!-- Selected address -->
                <div v-if="cartStore.selectedAddress" class="address-readonly">
                    <div class="row adress-table">
                        <div class="col-md-12">
                            <div class="notched-field">
                                <BaseLabel for-id="alias">
                                    {{ t("cart.address_step.fields.address_name") }}
                                </BaseLabel>

                                <BaseInput id="alias" :model-value="cartStore.selectedAddress.alias ?? ''
                                    " placeholder=" " disabled />
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="notched-field">
                                <BaseLabel for-id="firstname">
                                    {{ t("cart.address_step.fields.firstname") }}
                                </BaseLabel>

                                <BaseInput id="firstname" :model-value="cartStore.selectedAddress.firstname ?? ''
                                    " placeholder=" " disabled />
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="notched-field">
                                <BaseLabel for-id="lastname">
                                    {{ t("cart.address_step.fields.lastname") }}
                                </BaseLabel>

                                <BaseInput id="lastname" :model-value="cartStore.selectedAddress.lastname ?? ''
                                    " placeholder=" " disabled />
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="notched-field">
                                <BaseLabel for-id="phone" required>
                                    {{ t("cart.address_step.fields.phone") }}
                                </BaseLabel>

                                <BaseInput id="phone" :model-value="cartStore.selectedAddress.phone ?? ''
                                    " placeholder=" " disabled />
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="notched-field">
                                <BaseLabel for-id="email" required>
                                    {{ t("cart.address_step.fields.email") }}
                                </BaseLabel>

                                <BaseInput id="email" :model-value="cartStore.selectedAddress.email ?? ''
                                    " placeholder=" " disabled />
                            </div>
                        </div>

                        <div class="col-md-8">
                            <div class="notched-field">
                                <BaseLabel for-id="company">
                                    {{ t("cart.address_step.fields.company") }}
                                </BaseLabel>

                                <BaseInput id="company" :model-value="cartStore.selectedAddress.company ?? ''
                                    " placeholder=" " disabled />
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="notched-field">
                                <BaseLabel for-id="country" required>
                                    {{ t("cart.address_step.fields.country") }}
                                </BaseLabel>

                                <BaseInput id="country" :model-value="cartStore.selectedAddress.country ?? ''
                                    " placeholder=" " disabled />
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="notched-field">
                                <BaseLabel for-id="street" required>
                                    {{ t("cart.address_step.fields.street") }}
                                </BaseLabel>

                                <BaseInput id="street" :model-value="[
                                    cartStore.selectedAddress.street,
                                    cartStore.selectedAddress.house_number,
                                ]
                                    .filter(Boolean)
                                    .join(' ')
                                    " placeholder=" " disabled />
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="notched-field">
                                <BaseLabel for-id="apartment">
                                    {{ t("cart.address_step.fields.apartment") }}
                                </BaseLabel>

                                <BaseInput id="apartment" :model-value="cartStore.selectedAddress.apartment ?? ''
                                    " placeholder=" " disabled />
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="notched-field">
                                <BaseLabel for-id="postcode" required>
                                    {{ t("cart.address_step.fields.postcode") }}
                                </BaseLabel>

                                <BaseInput id="postcode" :model-value="cartStore.selectedAddress.postcode ?? ''
                                    " placeholder=" " disabled />
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="notched-field">
                                <BaseLabel for-id="city" required>
                                    {{ t("cart.address_step.fields.city") }}
                                </BaseLabel>

                                <BaseInput id="city" :model-value="cartStore.selectedAddress.city ?? ''
                                    " placeholder=" " disabled />
                            </div>
                        </div>
                    </div>

                    <div class="change-adress-section">
                        <BaseButton variant="secondary" size="sm" @click="openAddressModal">
                            {{ t("cart.address_step.change_address") }}
                        </BaseButton>

                        <BaseButton variant="secondary" size="sm" class="ms-2" @click="openEditAddressModal">
                            {{ t("cart.address_step.edit_address") }}
                        </BaseButton>
                    </div>
                </div>

                <!-- No addresses -->
                <div v-else-if="cartStore.addresses.length === 0" class="no-addresses">
                    <div class="text-muted mb-3">
                        {{ t("cart.address_step.no_addresses") }}
                    </div>

                    <BaseButton variant="primary" size="sm" @click="openCreateAddressModal">
                        {{ t("cart.address_step.add_address") }}
                    </BaseButton>
                </div>

                <!-- Addresses available, but none selected -->
                <div v-else>
                    <BaseButton variant="secondary" size="sm" @click="openAddressModal">
                        {{ t("cart.address_step.select") }}
                        &rsaquo;
                    </BaseButton>

                    <BaseButton variant="secondary" size="sm" class="ms-3" @click="openCreateAddressModal">
                        {{ t("cart.address_step.add_address") }}
                        &rsaquo;
                    </BaseButton>
                </div>
            </div>
        </template>

        <!-- Cart actions -->
        <div class="cart-actions col-md-12 d-flex justify-content-between">
            <div class="col-md-3">
                <BaseButton variant="secondary" size="lg" class="shop" @click="emit('prev')">
                    <BaseIcon name="chLeft" />

                    {{ t("cart.steps.comeback_to_cart") }}
                </BaseButton>
            </div>

            <div class="col-md-3">
                <BaseButton variant="primary" size="lg" class="shop" :disabled="!isAddressValid" @click="emit('next')">
                    {{ t("cart.steps.next") }}:
                    {{ t("cart.steps.delivery") }}
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";

import { useCartStore } from "@/core/stores/cartStore";
import { useModalStore } from "@/core/stores/modalStore";

import BaseIcon from "@/views/shared/ui/BaseIcon.vue";
import BaseButton from "@/views/shared/ui/BaseButton.vue";
import BaseLabel from "@/views/shared/ui/BaseLabel.vue";
import BaseInput from "@/views/shared/ui/BaseInput.vue";

import AddressSelectionModal from "./modals/AddressSelectionModal.vue";
import CreateAddressModal from "./modals/CreateAddressModal.vue";

const emit = defineEmits<{
    next: [];
    prev: [];
}>();

const { t } = useI18n();

const cartStore = useCartStore();
const modal = useModalStore();

const openAddressModal = () => {
    modal.openModal(AddressSelectionModal);
};

const openCreateAddressModal = () => {
    modal.openModal(CreateAddressModal);
};

const openEditAddressModal = () => {
    if (!cartStore.selectedAddress) {
        return;
    }

    modal.openModal(CreateAddressModal, {
        editMode: true,
        address: cartStore.selectedAddress,
    });
};

onMounted(() => {
    if (cartStore.addresses.length === 0) {
        cartStore.fetchAddresses();
    }
});

const isAddressValid = computed(() => {
    const address = cartStore.selectedAddress;

    if (!address) {
        return false;
    }

    const requiredFields = [
        address.phone,
        address.email,
        address.country,
        address.street,
        address.house_number,
        address.postcode,
        address.city,
    ];

    return requiredFields.every(
        (field) =>
            field !== null &&
            field !== undefined &&
            String(field).trim() !== "",
    );
});
</script>

<style scoped>
@import "./CartStep2Style.css";
</style>