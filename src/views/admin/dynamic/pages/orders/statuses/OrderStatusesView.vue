<template>
    <div class="order-statuses-view">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h1 class="mb-0">{{ t("order.statuses_title") }}</h1>
            <BaseButton variant="secondary" @click="router.push({ name: 'admin.orders' })">
                {{ t("common.back") }}
            </BaseButton>
        </div>

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border" role="status"></div>
        </div>

        <div v-else-if="loadError" class="alert alert-danger" role="alert">
            {{ t("order.statuses_load_error") }}
            <BaseButton size="sm" variant="secondary" @click="loadStatuses">
                {{ t("order.retry") }}
            </BaseButton>
        </div>

        <div v-else class="d-flex flex-column gap-3">
            <BigCard v-for="status in statuses" :key="status.id" :title="statusPreview(status)">
                <form class="row g-3" @submit.prevent="saveStatus(status)">
                    <div class="col-md-6">
                        <BaseLabel>{{ t("order.status_color") }}</BaseLabel>
                        <div class="d-flex align-items-center gap-2">
                            <input v-model="status.color" class="form-control form-control-color" type="color"
                                :aria-label="t('order.status_color')" />
                            <code>{{ status.color }}</code>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <BaseLabel>{{ t("order.status_background") }}</BaseLabel>
                        <div class="d-flex align-items-center gap-2">
                            <input v-model="status.background" class="form-control form-control-color" type="color"
                                :aria-label="t('order.status_background')" />
                            <code>{{ status.background }}</code>
                        </div>
                    </div>

                    <div v-for="translation in status.langs" :key="translation.lang_id" class="col-md-6">
                        <BaseLabel :for-id="`order-status-${status.id}-lang-${translation.lang_id}`">
                            {{ translation.language_name }} ({{ translation.code.toUpperCase() }})
                        </BaseLabel>
                        <BaseInput :id="`order-status-${status.id}-lang-${translation.lang_id}`"
                            v-model="translation.name" required maxlength="255" />
                    </div>

                    <div class="col-12 d-flex justify-content-end">
                        <BaseButton type="submit" :loading="savingId === status.id"
                            :disabled="savingId !== null">
                            {{ t("order.save_statuses") }}
                        </BaseButton>
                    </div>
                </form>
            </BigCard>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { isAxiosError } from "axios";
import api from "@/core/api/axios";
import { useI18n } from "vue-i18n";
import { useUiStore } from "@/core/stores/uiStore";
import BigCard from "@shared/components/BigCard.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseInput from "@shared/ui/BaseInput.vue";
import BaseLabel from "@shared/ui/BaseLabel.vue";

interface StatusTranslation {
    lang_id: number;
    code: string;
    language_name: string;
    name: string;
}

interface OrderStatusSetting {
    id: number;
    color: string;
    background: string;
    langs: StatusTranslation[];
}

const { t } = useI18n();
const router = useRouter();
const ui = useUiStore();
const statuses = ref<OrderStatusSetting[]>([]);
const loading = ref(true);
const loadError = ref(false);
const savingId = ref<number | null>(null);

async function loadStatuses() {
    loading.value = true;
    loadError.value = false;
    try {
        const { data } = await api.get<{ data: OrderStatusSetting[] }>("/orders/status-settings");
        statuses.value = data.data;
    } catch (error) {
        loadError.value = true;
        console.error("load order status settings", error);
    } finally {
        loading.value = false;
    }
}

function statusPreview(status: OrderStatusSetting) {
    const currentLanguageId = Number(localStorage.getItem("lang_id"));
    return status.langs.find(lang => lang.lang_id === currentLanguageId)?.name
        ?? status.langs[0]?.name
        ?? `${t("order.status_name")} #${status.id}`;
}

async function saveStatus(status: OrderStatusSetting) {
    savingId.value = status.id;
    try {
        await api.put(`/orders/status-settings/${status.id}`, {
            color: status.color,
            background: status.background,
            langs: status.langs.map(({ lang_id, name }) => ({ lang_id, name })),
        });
        ui.showSuccess(t("order.statuses_saved"));
    } catch (error) {
        ui.showError(
            isAxiosError(error)
                ? error.response?.data?.message ?? t("order.statuses_save_error")
                : t("order.statuses_save_error")
        );
        console.error("save order status settings", error);
    } finally {
        savingId.value = null;
    }
}

onMounted(loadStatuses);
</script>
