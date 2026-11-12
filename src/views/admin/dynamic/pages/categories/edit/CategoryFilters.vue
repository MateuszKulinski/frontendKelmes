<template>
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Edytuj wyświetlane filtry</h1>
        <BaseButton type="button" @click="backToCategory">
            Powrót do edycji kategorii
        </BaseButton>
    </div>

    <div v-if="loading" class="section">
        Ładowanie...
    </div>

    <div v-else class="section full features-section">
        <h3>
            {{ t("features.title") }}
        </h3>

        <div v-if="!form.features.length" class="text-muted">
            Brak cech
        </div>

        <div v-for="feature in form.features" :key="feature.id" class="config-box">
            <div class="config-header">
                <BaseCheckbox :model-value="feature.is_filterable"
                    @update:model-value="value => updateFeatureFilterable(feature.id, Boolean(value))" />
                <BaseLabel>
                    {{ feature.name || `#${feature.id}` }}
                </BaseLabel>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseButton from "@shared/ui/BaseButton.vue";
import BaseCheckbox from "@shared/components/BaseCheckbox/BaseCheckbox.vue";
import BaseLabel from "@shared/ui/BaseLabel.vue";

import { useCategoryEdit } from "./CategoryEdit";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const {
    form,
    loading,
    fetchCategory,
    updateFeatureFilterable,
} = useCategoryEdit();

const backToCategory = () => router.push({
    name: "admin.category.edit",
    params: { id: route.params.id },
});

onMounted(async () => {
    const id = route.params.id;

    if (!id) {
        return;
    }

    await fetchCategory(Number(id));
});
</script>

<style scoped src="@admin/assets/Form.css"></style>

<style scoped>
.config-header {
    display: flex;
}
</style>
