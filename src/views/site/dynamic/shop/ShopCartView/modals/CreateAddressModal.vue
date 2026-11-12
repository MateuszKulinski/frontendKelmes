<template>
    <div class="address-modal">
        <div class="address-modal-header">
            <span>
                {{
                    editMode
                        ? t("cart.address_step.edit_address")
                        : t("cart.address_step.add_address")
                }}
            </span>
        </div>

        <div class="address-modal-body">
            <form @submit.prevent="saveAddress">
                <div class="row">
                    <div class="col-md-6">
                        <BaseLabel class-name="small text-muted mb-0 mt-1">
                            {{ t("cart.address_step.fields.firstname") }}
                        </BaseLabel>

                        <BaseInput v-model="form.firstname" />
                    </div>

                    <div class="col-md-6">
                        <BaseLabel class-name="small text-muted mb-0 mt-1">
                            {{ t("cart.address_step.fields.lastname") }}
                        </BaseLabel>

                        <BaseInput v-model="form.lastname" />
                    </div>

                    <div class="col-md-6">
                        <BaseLabel class-name="small text-muted mb-0 mt-1">
                            {{ t("cart.address_step.fields.phone") }} *
                        </BaseLabel>

                        <BaseInput v-model="form.phone" required />
                    </div>

                    <div class="col-md-6">
                        <BaseLabel class-name="small text-muted mb-0 mt-1">
                            {{ t("cart.address_step.fields.email") }} *
                        </BaseLabel>

                        <BaseInput v-model="form.email" type="email" required />
                    </div>

                    <div class="col-md-8">
                        <BaseLabel class-name="small text-muted mb-0 mt-1">
                            {{ t("cart.address_step.fields.company") }}
                        </BaseLabel>

                        <BaseInput v-model="form.company" :disabled="editMode" />
                    </div>

                    <div class="col-md-4">
                        <BaseLabel class-name="small text-muted mb-0 mt-1">
                            {{ t("cart.address_step.fields.vat_number") }}
                        </BaseLabel>

                        <BaseInput v-model="form.vat_number" />
                    </div>

                    <div class="col-md-4">
                        <BaseLabel class-name="small text-muted mb-0 mt-1">
                            {{ t("cart.address_step.fields.postcode") }} *
                        </BaseLabel>

                        <BaseInput v-model="form.postcode" required />
                    </div>

                    <div class="col-md-8">
                        <BaseLabel class-name="small text-muted mb-0 mt-1">
                            {{ t("cart.address_step.fields.city") }} *
                        </BaseLabel>

                        <BaseInput v-model="form.city" required />
                    </div>

                    <div class="col-md-8">
                        <BaseLabel class-name="small text-muted mb-0 mt-1">
                            {{ t("cart.address_step.fields.street") }} *
                        </BaseLabel>

                        <BaseInput v-model="form.street" required />
                    </div>

                    <div class="col-md-4">
                        <BaseLabel class-name="small text-muted mb-0 mt-1">
                            {{ t("cart.address_step.fields.house_number") }} *
                        </BaseLabel>

                        <BaseInput v-model="form.house_number" required />
                    </div>

                    <div class="col-md-4">
                        <BaseLabel class-name="small text-muted mb-0 mt-1">
                            {{ t("cart.address_step.fields.apartment") }}
                        </BaseLabel>

                        <BaseInput v-model="form.apartment" />
                    </div>

                    <div class="col-md-6">
                        <BaseLabel class-name="small text-muted mb-0 mt-1">
                            {{ t("cart.address_step.fields.country") }} *
                        </BaseLabel>

                        <select v-model="form.country_id" class="form-select" required>
                            <option v-for="country in countryStore.countries" :key="country.id" :value="country.id">
                                {{ country.name }}
                            </option>
                        </select>
                    </div>

                    <!-- Only for new addresses -->
                    <div v-if="!editMode" class="col-md-6 d-flex align-items-end pb-1">
                        <BaseCheckbox v-model="isOneTime">
                            {{ t("cart.address_step.one_time_address") }}
                        </BaseCheckbox>
                    </div>
                </div>
            </form>
        </div>

        <div class="address-modal-footer">
            <BaseButton variant="secondary" size="sm" :disabled="saving" @click="close">
                {{ t("cart.address_step.cancel") }}
            </BaseButton>

            <BaseButton variant="primary" size="sm" :disabled="saving || !isValid" @click="saveAddress">
                {{
                    editMode
                        ? t("cart.address_step.save_address")
                        : t("cart.address_step.add_address")
                }}
            </BaseButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

import {
    useCartStore,
    type CreateAddressPayload,
} from "@/core/stores/cartStore";

import { useCountryStore } from "@/core/stores/countryStore";
import { useModalStore } from "@/core/stores/modalStore";

import BaseButton from "@/views/shared/ui/BaseButton.vue";
import BaseInput from "@/views/shared/ui/BaseInput.vue";
import BaseLabel from "@/views/shared/ui/BaseLabel.vue";
import BaseCheckbox from "@/views/shared/ui/BaseCheckbox.vue";
import { useAuthStore } from "@/core/stores/authStore";
const auth = useAuthStore();

const props = withDefaults(
    defineProps<{
        editMode?: boolean;
        address?: any;
    }>(),
    {
        editMode: false,
        address: undefined,
    },
);

const { t } = useI18n();

const cartStore = useCartStore();
const countryStore = useCountryStore();
const modal = useModalStore();

const saving = ref(false);

const isOneTime = ref(false);

const form = reactive({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    company: "",
    vat_number: "",
    country_id: 0,
    postcode: "",
    city: "",
    street: "",
    house_number: "",
    apartment: "",
    save_to_address_book: false,
});

const editMode = computed(() => props.editMode);

const isValid = computed(() => {
    return Boolean(
        form.phone?.trim() &&
        form.email?.trim() &&
        form.country_id &&
        form.postcode?.trim() &&
        form.city?.trim() &&
        form.street?.trim() &&
        form.house_number?.trim(),
    );
});

const fillFormFromAddress = () => {
    if (!props.address) {
        return;
    }

    form.firstname = props.address.firstname ?? auth.firstname;
    form.lastname = props.address.lastname ?? auth.lastname;
    form.phone = props.address.phone ?? auth.phone;
    form.email = props.address.email ?? "";
    form.company = props.address.company ?? "";
    form.vat_number = props.address.vat_number ?? "";

    /*
     * Najważniejsze:
     * backend/store powinien zwracać country_id.
     *
     * Jeżeli address.country_id istnieje, wybieramy ten kraj.
     */
    form.country_id = Number(props.address.country_id ?? 0);

    form.postcode = props.address.postcode ?? "";
    form.city = props.address.city ?? "";
    form.street = props.address.street ?? "";
    form.house_number = props.address.house_number ?? "";
    form.apartment = props.address.apartment ?? "";

    form.save_to_address_book = true;
};

if (editMode.value) {
    fillFormFromAddress();
}

onMounted(async () => {
    if (!countryStore.countries.length) {
        await countryStore.fetchCountries();
    }

    if (!form.country_id) {
        const poland = countryStore.countries.find(
            (country) => country.code.toUpperCase() === "PL",
        );

        if (poland) {
            form.country_id = poland.id;
        }
    }
});

const close = () => {
    if (saving.value) {
        return;
    }

    modal.closeModal();
};

const buildPayload = (): CreateAddressPayload => {
    return {
        cart_id: cartStore.cartId,
        ...(editMode.value && props.address?.id ? { address_id: props.address.id, } : {}),
        country_id: form.country_id,
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        ...(!editMode.value
            ? { company: form.company.trim() || undefined }
            : {}),
        vat_number: form.vat_number.trim() || undefined,
        postcode: form.postcode.trim(),
        city: form.city.trim(),
        street: form.street.trim(),
        house_number: form.house_number.trim(),
        apartment: form.apartment.trim() || undefined,
        save_to_address_book: editMode.value
            ? true
            : !isOneTime.value,
    };
};

const createAddress = async () => {
    const payload = buildPayload();

    const address = await cartStore.createAddress(payload);

    if (address?.id) {
        await cartStore.selectAddress(address.id);
    }

    await cartStore.fetchAddresses();
};

const updateAddress = async () => {
    if (!props.address?.id) {
        return;
    }
    modal.lock();

    const payload = buildPayload();

    /*
     * Aktualizujemy TEN SAM adres.
     */
    await cartStore.updateAddressData(
        payload,
    );

    /*
     * Odświeżamy listę, żeby selectedAddress
     * zawierał już nowe dane.
     */
    await cartStore.fetchAddresses();
    modal.unlock();
    modal.closeModal();
};

const saveAddress = async () => {
    if (!isValid.value || saving.value) {
        return;
    }

    saving.value = true;
    modal.lock();

    try {
        if (editMode.value) {
            await updateAddress();
        } else {
            await createAddress();
        }

        modal.closeModal();
    } catch (error) {
        console.error(
            editMode.value
                ? "updateAddress"
                : "createAddress",
            error,
        );
    } finally {
        saving.value = false;
        modal.unlock();
    }
};
</script>