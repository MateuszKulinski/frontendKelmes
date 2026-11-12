<template>
    <div class="cache-page">
        <h1>{{ t("cache.title") }}</h1>
        <p>{{ t("cache.description") }}</p>

        <section class="cache-section">
            <h2>{{ t("cache.bulk_title") }}</h2>
            <div class="cache-actions">
                <BaseButton
                    v-for="resource in resources"
                    :key="resource.type"
                    type="button"
                    :disabled="busy !== null"
                    @click="clear(resource.type, resource.label)"
                >
                    {{ t("cache.clear_type", { type: t(resource.label) }) }}
                </BaseButton>
                <BaseButton
                    type="button"
                    :disabled="busy !== null"
                    @click="clear('all', 'cache.all')"
                >
                    {{ t("cache.clear_all") }}
                </BaseButton>
            </div>
        </section>

        <section class="cache-section">
            <h2>{{ t("cache.indexing_title") }}</h2>
            <div class="cache-actions">
                <BaseButton
                    type="button"
                    :disabled="busy !== null || indexingSearch || indexingFilters"
                    @click="reindexSearch"
                >
                    {{ indexingSearch ? t("cache.search_running") : t("cache.reindex_search") }}
                </BaseButton>
                <BaseButton
                    type="button"
                    variant="secondary"
                    :disabled="busy !== null || indexingSearch || indexingFilters"
                    @click="reindexFilters"
                >
                    {{ indexingFilters ? t("cache.filters_running") : t("cache.reindex_filters") }}
                </BaseButton>
            </div>
        </section>

        <section class="cache-section">
            <h2>{{ t("cache.single_title") }}</h2>
            <form class="cache-single" @submit.prevent="clearSingle">
                <label>
                    <span>{{ t("cache.resource") }}</span>
                    <select v-model="singleType">
                        <option v-for="resource in resources" :key="resource.type" :value="resource.type">
                            {{ t(resource.label) }}
                        </option>
                    </select>
                </label>
                <label>
                    <span>{{ t("cache.item_id") }}</span>
                    <BaseInput v-model="singleId" type="number" min="1" required />
                </label>
                <BaseButton type="submit" :disabled="busy !== null || !singleId">
                    {{ t("cache.clear_item") }}
                </BaseButton>
            </form>
        </section>

        <p class="cache-note">{{ t("cache.news_note") }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseInput from "@shared/ui/BaseInput.vue";

type CacheType = "product" | "category" | "cms" | "banner";

const resources: { type: CacheType; label: string }[] = [
    { type: "product", label: "cache.products" },
    { type: "category", label: "cache.categories" },
    { type: "cms", label: "cache.cms" },
    { type: "banner", label: "cache.banners" },
];

const { t } = useI18n();
const ui = useUiStore();
const busy = ref<string | null>(null);
const indexingSearch = ref(false);
const indexingFilters = ref(false);
const singleType = ref<CacheType>("product");
const singleId = ref("");

async function clear(type: CacheType | "all", label: string, id?: number) {
    const task = id ? `${type}-${id}` : type;
    busy.value = task;
    try {
        await api.post("/settings/cache/clear", { type, id });
        ui.showSuccess(t("cache.cleared", { type: t(label) }));
    } catch {
        ui.showError(t("cache.clear_error"));
    } finally {
        busy.value = null;
    }
}

async function reindexSearch() {
    indexingSearch.value = true;
    try {
        await api.post("/searchProduct/reindex/all");
        ui.showSuccess(t("cache.search_success"));
    } catch (error) {
        console.error("Search index rebuild failed", error);
        ui.showError(t("common.error_occurred"));
    } finally {
        indexingSearch.value = false;
    }
}

async function reindexFilters() {
    indexingFilters.value = true;
    try {
        await api.post("/searchProduct/filters", { type: "categories" });
        await api.post("/searchProduct/filters", { type: "manufacturers" });
        ui.showSuccess(t("cache.filters_success"));
    } catch (error) {
        console.error("Catalog filter indexes rebuild failed", error);
        ui.showError(t("common.error_occurred"));
    } finally {
        indexingFilters.value = false;
    }
}

function clearSingle() {
    const id = Number(singleId.value);
    if (!Number.isInteger(id) || id < 1) {
        ui.showError(t("cache.invalid_id"));
        return;
    }

    return clear(singleType.value, `cache.${singleType.value}`, id);
}
</script>

<style scoped>
.cache-page {
    display: grid;
    gap: 1rem;
}

.cache-page h1,
.cache-page h2,
.cache-page p {
    margin: 0;
}

.cache-section {
    display: grid;
    gap: 1rem;
    padding: 1.25rem;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 0.5rem;
}

.cache-actions,
.cache-single {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 0.75rem;
}

.cache-single label {
    display: grid;
    gap: 0.35rem;
}

.cache-single select {
    min-width: 12rem;
    min-height: 2.5rem;
}

.cache-note {
    opacity: 0.8;
}
</style>
