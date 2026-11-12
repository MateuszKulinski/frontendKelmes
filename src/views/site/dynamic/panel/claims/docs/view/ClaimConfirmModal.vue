<template>

    <div class="p-4">

        <h5 class="mb-3">
            {{ t("claims.confirm_title") }}
        </h5>

        <p class="mb-4">
            {{ t(messageKey) }}
        </p>

        <div class="d-flex justify-content-end gap-2">

            <button type="button" class="btn btn-secondary" @click="close">
                {{ t("claims.no") }}
            </button>

            <button type="button" class="btn btn-primary" @click="confirm">
                {{ t("claims.yes") }}
            </button>

        </div>

    </div>

</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useModalStore } from "@/core/stores/modalStore";

const props = defineProps<{
    claimType: 1 | 2;
    onConfirm: () => Promise<void>;
}>();

const { t } = useI18n();

const modalStore = useModalStore();

const messageKey = computed(() =>
    props.claimType === 2
        ? "claims.confirm_return"
        : "claims.confirm_claim"
);

const close = () => {
    modalStore.closeModal();
};

const confirm = async () => {

    modalStore.lock();

    try {

        await props.onConfirm();

        modalStore.unlock();
        modalStore.closeModal();

    } catch (error) {

        modalStore.unlock();

        throw error;
    }
};
</script>