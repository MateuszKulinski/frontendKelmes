<template>
    <div class="address-modal">
        <div class="address-modal-header">
            <span>
                {{ t("cart.address_step.modal_title") }}
            </span>
        </div>

        <div class="address-modal-body d-flex flex-column">
            <div class="address-search">

                <BaseInput v-model="searchQuery" type="search" :placeholder="t('cart.address_step.search')" size="sm"
                    class="address-search-input" />
            </div>

            <label v-for="addr in filteredAddresses" :key="addr.id" class="address-modal-item" :class="{
                'is-selected': pendingAddressId === addr.id,
            }">
                <div class="address-modal-item-content">
                    <div class="adres-data d-flex justify-content-between">
                        {{ addr.alias }}

                        <BaseRadio :model-value="pendingAddressId === addr.id" :name="`address-${addr.id}`"
                            @update:model-value="
                                pendingAddressId = addr.id
                                " />
                    </div>

                    <div class="adres-data">
                        {{ addr.street }}
                        {{ addr.house_number }}

                        <span v-if="addr.apartment">
                            /{{ addr.apartment }}
                        </span>
                    </div>

                    <div class="adres-data">
                        {{ addr.postcode }},
                        {{ addr.city }}
                    </div>

                    <div v-if="addr.alias" class="adres-data">
                        {{ addr.country }}
                    </div>
                </div>
            </label>

            <div v-if="searchQuery && !filteredAddresses.length" class="address-search-empty">
                {{ t("cart.address_step.no_results") }}
            </div>
        </div>

        <div class="address-modal-footer d-flex justify-content-between">
            <BaseButton variant="secondary" size="sm" :disabled="saving" @click="close">
                {{ t("cart.address_step.cancel") }}
            </BaseButton>

            <div class="d-flex gap-2">
                <BaseButton variant="secondary" size="sm" :disabled="saving" @click="openCreateAddressModal">
                    {{ t("cart.address_step.add_address") }}
                </BaseButton>

                <BaseButton variant="primary" size="sm" :disabled="!pendingAddressId || saving"
                    @click="confirmSelection">
                    {{ t("cart.address_step.confirm") }}
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useCartStore } from "@/core/stores/cartStore";
import { useModalStore } from "@/core/stores/modalStore";

import BaseButton from "@/views/shared/ui/BaseButton.vue";
import BaseRadio from "@/views/shared/ui/BaseRadio.vue";
import BaseInput from "@/views/shared/ui/BaseInput.vue";
import CreateAddressModal from "./CreateAddressModal.vue";

const { t } = useI18n();

const cartStore = useCartStore();
const modal = useModalStore();

const saving = ref(false);
const searchQuery = ref("");

const pendingAddressId = ref<number | null>(
    cartStore.selectedAddressId
);
const filteredAddresses = computed(() => {
    const query = searchQuery.value.trim().toLocaleLowerCase();

    if (!query) {
        return cartStore.addresses;
    }

    const searchTerms = query
        .split(/\s+/)
        .filter(Boolean);

    return cartStore.addresses.filter((address) => {
        const searchableData = [
            address.country,
            address.street,
            address.house_number,
            address.apartment,
            address.postcode,
            address.city,
            address.company,
            address.alias,
        ]
            .filter(
                (value) =>
                    value !== null &&
                    value !== undefined
            )
            .map((value) =>
                String(value).toLocaleLowerCase()
            );

        return searchTerms.every((term) =>
            searchableData.some((value) =>
                value.includes(term)
            )
        );
    });
});

const close = () => {
    if (saving.value) {
        return;
    }

    modal.closeModal();
};

const openCreateAddressModal = () => {
    modal.openModal(CreateAddressModal);
};

const confirmSelection = async () => {
    if (!pendingAddressId.value || saving.value) {
        return;
    }

    saving.value = true;
    modal.lock();

    try {
        await cartStore.selectAddress(pendingAddressId.value);
    } finally {
        saving.value = false;
        modal.unlock();
        modal.closeModal();

    }
};
</script>

<style scoped>
@import "./AddressSelectionModal.css";
</style>