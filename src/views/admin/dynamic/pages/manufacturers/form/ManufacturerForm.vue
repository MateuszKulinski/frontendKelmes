<template>
    <form class="admin-form" @submit.prevent="submit">

        <div class="section">
            <h3>{{ t('common.basic') }}</h3>

            <div class="user-grid">
                <div class="form-group floating">
                    <BaseLabel>{{ t('manufacturer.name') }} <span style="color:red">*</span></BaseLabel>
                    <BaseInput v-model="form.name" />
                    <div class="error" v-if="errors.name">{{ errors.name }}</div>
                </div>

                <div class="form-group floating">
                    <BaseLabel>{{ t('manufacturer.website') }} <span style="color:red">*</span></BaseLabel>
                    <BaseInput v-model="form.website" />
                    <div class="error" v-if="errors.website">{{ errors.website }}</div>
                </div>

                <div class="form-group floating">
                    <BaseLabel>{{ t('manufacturer.erp_id') }} <span style="color:red">*</span></BaseLabel>
                    <BaseInput :modelValue="form.erp_id_producent ?? ''" @update:modelValue="form.erp_id_producent = $event === '' ? null : Number($event)" type="number" />
                    <div class="error" v-if="errors.erp_id_producent">{{ errors.erp_id_producent }}</div>
                </div>
            </div>

            <BaseCheckbox v-model="form.is_active">
                {{ t('common.active') }}
            </BaseCheckbox>
        </div>

        <div class="section">
            <h3>{{ t('manufacturer.logo') }}</h3>
            <div v-if="currentLogoUrl" class="mb-2">
                <img :src="currentLogoUrl" :alt="t('manufacturer.logo')" style="max-height: 80px; object-fit: contain;" />
            </div>
            <div v-else class="text-muted mb-2">{{ t('manufacturer.no_logo') }}</div>
            <input ref="logoInputRef" type="file" accept="image/*" @change="handleLogoChange" style="display: none" />
            <BaseButton type="button" variant="secondary" @click="logoInputRef?.click()">
                {{ t('manufacturer.upload_logo') }}
            </BaseButton>
        </div>

        <div class="section full">
            <TranslationFields :items="form.langs" :errors="errors" v-slot="{ item: lang }">
                <div class="form-group floating mt-2">
                    <BaseLabel>{{ t('manufacturer.description') }}</BaseLabel>
                    <RichTextEditor v-model="lang.description" />
                </div>
            </TranslationFields>
        </div>

        <div class="full">
            <BaseButton type="submit" class="submit-btn">
                {{ props.isEdit ? t('manufacturer.save') : t('manufacturer.create') }}
            </BaseButton>
        </div>

    </form>
</template>

<script setup lang="ts">
import TranslationFields from '@admin/components/TranslationFields.vue';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseInput from '@shared/ui/BaseInput.vue';
import BaseButton from '@shared/ui/BaseButton.vue';
import BaseCheckbox from '@shared/components/BaseCheckbox/BaseCheckbox.vue';
import BaseLabel from '@shared/ui/BaseLabel.vue';
import RichTextEditor from '@shared/ui/RichTextEditor.vue';
import { useLangStore } from '@/core/stores/langStore';
import { useManufacturerStore } from '@/core/stores/manufacturerStore';
import { useManufacturerForm } from './ManufacturerForm';

const emit = defineEmits(['submit']);
const props = defineProps<{ isEdit?: boolean; manufacturerId?: number }>();

const { t } = useI18n();
const langStore = useLangStore();
const manufacturerStore = useManufacturerStore();

const logoInputRef = ref<HTMLInputElement | null>(null);
const currentLogoUrl = ref<string | null>(null);
const pendingLogoFile = ref<File | null>(null);

const {
    form,
    errors,
    ensureLangs,
    setFormData,
    handleValidationError,
    submit,
} = useManufacturerForm(emit);

// W trybie edycji: wgraj od razu. W trybie tworzenia: zapamiętaj plik lokalnie.
const handleLogoChange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (props.isEdit && props.manufacturerId) {
        try {
            const url = await manufacturerStore.uploadLogo(props.manufacturerId, file);
            currentLogoUrl.value = url;
        } catch {
            alert(t('common.error_occurred'));
        }
    } else {
        pendingLogoFile.value = file;
        currentLogoUrl.value = URL.createObjectURL(file);
    }
};

onMounted(async () => {
    if (!langStore.langs.length) await langStore.fetchLangs();
    ensureLangs();
});

defineExpose({
    setFormData: (data: any) => {
        currentLogoUrl.value = data.logo_url ?? null;
        setFormData(data);
    },
    handleValidationError,
    getPendingLogoFile: () => pendingLogoFile.value,
});
</script>
