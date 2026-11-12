<template>
    <div>
        <h1>{{ t("outlet.admin_title") }}</h1>

        <form class="admin-form" @submit.prevent="save">
            <div class="section full">
                <h3>{{ t("outlet.admin_description") }}</h3>

                <div class="configuration-grid">
                    <div v-for="field in fields" :key="field.key" class="form-group floating">
                        <BaseLabel>{{ t(field.label) }}</BaseLabel>

                        <div v-if="selected[field.key]" class="selected-outlet">
                            <span>{{ selected[field.key]?.name }}</span>
                            <button type="button" class="selected-outlet__remove"
                                :aria-label="t('outlet.admin_remove')" @click="clearSelection(field.key)">
                                ×
                            </button>
                        </div>

                        <div v-else class="search-wrapper">
                            <BaseInput v-model="searches[field.key]" :placeholder="t('outlet.admin_search')"
                                autocomplete="off" @input="search(field)" />

                            <div v-if="loading[field.key]" class="search-loading">
                                {{ t("common.loading") }}
                            </div>
                            <div v-else-if="options[field.key].length" class="search-options">
                                <button v-for="option in options[field.key]" :key="option.id" type="button"
                                    class="search-option" @click="selectOption(field.key, option)">
                                    {{ option.name }}
                                    <span class="search-option-secondary">#{{ option.id }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="full">
                <BaseButton type="submit" class="submit-btn" :disabled="saving">
                    {{ saving ? t("common.loading") : t("outlet.admin_save") }}
                </BaseButton>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseInput from "@shared/ui/BaseInput.vue";
import BaseLabel from "@shared/ui/BaseLabel.vue";

type OutletFieldKey =
    | "outlet_cms_id_top"
    | "outlet_cms_id_bottom"
    | "outlet_category_id"
    | "outlet_banner_id";
type SearchType = "cms" | "categoriesAll" | "banners";
type SearchOption = { id: number; name: string };
type OutletField = { key: OutletFieldKey; label: string; type: SearchType };

const fields: OutletField[] = [
    { key: "outlet_cms_id_top", label: "outlet.admin_cms_top", type: "cms" },
    { key: "outlet_cms_id_bottom", label: "outlet.admin_cms_bottom", type: "cms" },
    { key: "outlet_category_id", label: "outlet.admin_category", type: "categoriesAll" },
    { key: "outlet_banner_id", label: "outlet.admin_banner", type: "banners" },
];

const { t } = useI18n();
const ui = useUiStore();
const selected = reactive<Record<OutletFieldKey, SearchOption | null>>({
    outlet_cms_id_top: null,
    outlet_cms_id_bottom: null,
    outlet_category_id: null,
    outlet_banner_id: null,
});
const searches = reactive<Record<OutletFieldKey, string>>({
    outlet_cms_id_top: "",
    outlet_cms_id_bottom: "",
    outlet_category_id: "",
    outlet_banner_id: "",
});
const options = reactive<Record<OutletFieldKey, SearchOption[]>>({
    outlet_cms_id_top: [],
    outlet_cms_id_bottom: [],
    outlet_category_id: [],
    outlet_banner_id: [],
});
const loading = reactive<Record<OutletFieldKey, boolean>>({
    outlet_cms_id_top: false,
    outlet_cms_id_bottom: false,
    outlet_category_id: false,
    outlet_banner_id: false,
});
const timers: Record<OutletFieldKey, ReturnType<typeof setTimeout> | null> = {
    outlet_cms_id_top: null,
    outlet_cms_id_bottom: null,
    outlet_category_id: null,
    outlet_banner_id: null,
};
const searchTokens = reactive<Record<OutletFieldKey, number>>({
    outlet_cms_id_top: 0,
    outlet_cms_id_bottom: 0,
    outlet_category_id: 0,
    outlet_banner_id: 0,
});
const saving = ref(false);

async function load() {
    try {
        const { data } = await api.get<Record<OutletFieldKey, SearchOption | null>>("/configuration/outlet");
        for (const field of fields) {
            selected[field.key] = data[field.key];
        }
    } catch {
        ui.showError(t("outlet.admin_load_error"));
    }
}

function search(field: OutletField) {
    if (timers[field.key]) clearTimeout(timers[field.key]!);
    const token = ++searchTokens[field.key];
    const query = searches[field.key].trim();
    options[field.key] = [];
    if (query.length < 2) {
        loading[field.key] = false;
        return;
    }

    timers[field.key] = setTimeout(async () => {
        loading[field.key] = true;
        try {
            const { data } = await api.get<SearchOption[]>(`/searchData/${field.type}`, {
                params: { search: query },
            });
            if (searchTokens[field.key] === token) options[field.key] = data;
        } catch {
            if (searchTokens[field.key] === token) ui.showError(t("outlet.admin_search_error"));
        } finally {
            if (searchTokens[field.key] === token) loading[field.key] = false;
        }
    }, 250);
}

function selectOption(key: OutletFieldKey, option: SearchOption) {
    selected[key] = option;
    searches[key] = "";
    options[key] = [];
}

function clearSelection(key: OutletFieldKey) {
    selected[key] = null;
    searches[key] = "";
    options[key] = [];
}

async function save() {
    saving.value = true;
    try {
        await api.put("/configuration/outlet", Object.fromEntries(
            fields.map(({ key }) => [key, selected[key]?.id ?? null]),
        ));
        ui.showSuccess(t("outlet.admin_saved"));
    } catch {
        ui.showError(t("outlet.admin_save_error"));
    } finally {
        saving.value = false;
    }
}

onMounted(load);
onBeforeUnmount(() => {
    for (const timer of Object.values(timers)) {
        if (timer) clearTimeout(timer);
    }
});
</script>

<style scoped>
.admin-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--margin-lg);
}

.full {
    grid-column: 1 / -1;
    margin-top: var(--margin-lg);
}

.submit-btn {
    width: 100%;
    background-color: var(--submit-bgr) !important;
    border-color: var(--submit-bgr) !important;
    color: #fff;
}

.submit-btn:hover {
    filter: var(--filter-default);
}

.search-wrapper {
    position: relative;
}

.search-options {
    position: absolute;
    z-index: 10;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 260px;
    overflow-y: auto;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.search-option {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 0;
    border-bottom: 1px solid #eee;
    background: #fff;
    text-align: left;
    cursor: pointer;
}

.search-option:hover {
    background: #f5f5f5;
}

.search-option-secondary {
    color: #777;
    font-size: 0.85rem;
}

.search-loading {
    position: absolute;
    z-index: 10;
    top: 100%;
    left: 0;
    right: 0;
    padding: 0.6rem 0.75rem;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    color: #777;
    font-size: 0.85rem;
}

.selected-outlet {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 40px;
    padding: 0.4rem 0.75rem;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.selected-outlet__remove {
    border: 0;
    background: transparent;
    color: #555;
    cursor: pointer;
    font-size: 1.2rem;
}

@media (max-width: 768px) {
    .admin-form {
        grid-template-columns: 1fr;
    }
}
</style>
