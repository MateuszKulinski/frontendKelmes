<template>
    <div class="confirm-delete-modal">
        <div class="confirm-delete-icon">
            <BaseIcon name="remove" />
        </div>

        <h3>
            {{ props.title }}
        </h3>

        <p>
            {{ props.message }}
        </p>

        <strong v-if="props.itemName" class="confirm-delete-item">
            {{ props.itemName }}
        </strong>

        <div class="confirm-delete-actions">
            <BaseButton variant="secondary" :disabled="loading" @click="cancel">
                {{ props.cancelText }}
            </BaseButton>

            <BaseButton variant="danger" :disabled="loading" @click="confirm">
                {{
                    loading
                        ? props.loadingText
                        : props.confirmText
                }}
            </BaseButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import BaseButton from "@shared/ui/BaseButton.vue";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";

import { useModalStore } from "@/core/stores/modalStore";

const modal = useModalStore();

const props = withDefaults(
    defineProps<{
        title?: string;
        message?: string;
        itemName?: string;
        confirmText?: string;
        cancelText?: string;
        loadingText?: string;
        onConfirm: () => void | Promise<void>;
        onError?: (error: unknown) => void;
    }>(),
    {
        title: "Usuń dane",
        message: "Czy na pewno chcesz usunąć ten element?",
        itemName: "",
        confirmText: "Usuń",
        cancelText: "Anuluj",
        loadingText: "Usuwanie...",
    }
);

const loading = ref(false);

const cancel = () => {
    if (loading.value) {
        return;
    }

    modal.closeModal();
};

const confirm = async () => {
    if (loading.value) {
        return;
    }

    loading.value = true;
    modal.lock();

    try {
        await props.onConfirm();
        modal.unlock();
        modal.closeModal();
    } catch (error) {
        modal.unlock();
        if (props.onError) {
            props.onError(error);
        } else {
            throw error;
        }
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.confirm-delete-modal {
    width: 100%;
    /* max-width: 460px; */
    padding: 30px;
    text-align: center;
}

.confirm-delete-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 18px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;
    background: #f8d7da;
    color: #dc3545;
}

.confirm-delete-icon :deep(svg) {
    width: 26px;
    height: 26px;
}

.confirm-delete-modal h3 {
    margin: 0 0 10px;
}

.confirm-delete-modal p {
    margin: 0 0 8px;
    color: #6c757d;
}

.confirm-delete-item {
    display: block;
    margin-bottom: 24px;
}

.confirm-delete-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
}
</style>