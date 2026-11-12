<template>
    <div class="seo-view">
        <div class="seo-heading">
            <div>
                <h1>{{ t('seo.page_title') }}</h1>
                <p class="text-muted mb-0">{{ t('seo.intro') }}</p>
            </div>
            <details class="seo-language-picker">
                <summary class="btn btn-outline-primary">{{ t('seo.languages') }} ({{ selectedLangIds.length }})</summary>
                <div class="seo-language-picker__options">
                    <label v-for="lang in langStore.langs" :key="lang.id">
                        <input type="checkbox" :checked="selectedLangIds.includes(lang.id)"
                            @change="toggleLanguage(lang.id)" />
                        {{ lang.name }} ({{ lang.code.toUpperCase() }})
                    </label>
                </div>
            </details>
        </div>

        <section class="section seo-filters">
            <div class="seo-filter">
                <BaseLabel for-id="seo-type">{{ t('seo.entity_type') }}</BaseLabel>
                <select id="seo-type" v-model="entityType" class="form-select">
                    <option value="product">{{ t('seo.products') }}</option>
                    <option value="category">{{ t('seo.categories') }}</option>
                </select>
            </div>

            <div class="seo-filter seo-filter--search">
                <BaseLabel for-id="seo-search">{{ t('seo.search') }}</BaseLabel>
                <BaseInput
                    id="seo-search"
                    v-model="search"
                    type="search"
                    :placeholder="t('seo.search_placeholder')"
                />
            </div>

            <div class="seo-filter">
                <BaseLabel for-id="seo-status">{{ t('seo.seo_status') }}</BaseLabel>
                <select id="seo-status" v-model="seoStatus" class="form-select">
                    <option value="all">{{ t('seo.status_all') }}</option>
                    <option value="missing">{{ t('seo.status_missing') }}</option>
                    <option value="complete">{{ t('seo.status_complete') }}</option>
                </select>
            </div>

            <div class="seo-filter">
                <BaseLabel for-id="seo-per-page">{{ t('seo.per_page') }}</BaseLabel>
                <select id="seo-per-page" v-model.number="perPage" class="form-select">
                    <option v-for="size in [25, 50, 100, 250, 500, 1000]" :key="size" :value="size">
                        {{ size }}
                    </option>
                </select>
            </div>
        </section>

        <section class="seo-bulk-bar">
            <div>
                <strong>{{ t('seo.selected', { count: selectedIds.length }) }}</strong>
                <small>{{ t('seo.generate_hint') }}</small>
            </div>
            <div class="seo-bulk-bar__actions">
                <BaseButton :disabled="selectedIds.length === 0 || selectedLangIds.length === 0"
                    :loading="generating" @click="generateSelected">
                    {{ t('seo.generate') }}
                </BaseButton>
            </div>
        </section>

        <BasePagination
            :page="page"
            :per-page="store.pagination.per_page"
            :total="store.pagination.total"
            :last-page="store.pagination.last_page"
            :disabled="store.loading"
            @change="changePage"
        />

        <div class="seo-table-wrapper">
            <BaseTable
                :columns="columns"
                :data="store.records"
                :loading="store.loading"
                row-key="id"
                :current-page="page"
                :per-page="store.pagination.per_page"
                :sort-by="sortBy"
                :sort-dir="sortDir"
                @sort="changeSort"
            >
                <template #header-selected>
                    <input
                        type="checkbox"
                        :checked="allVisibleSelected"
                        :indeterminate="someVisibleSelected"
                        :aria-label="t('common.select')"
                        @click.stop
                        @change="toggleAllVisible"
                    />
                </template>

                <template #cell-selected="{ row }">
                    <input
                        type="checkbox"
                        :checked="isSelected(row.id)"
                        :aria-label="`${t('common.select')} ${row.name ?? row.id}`"
                        @click.stop
                        @change="toggleSelected(row.id)"
                    />
                </template>

                <template #cell-name="{ row }">
                    <div class="seo-title-cell">
                        <strong>{{ row.name || '—' }}</strong>
                        <small v-if="row.identifier">{{ t('seo.identifier') }}: {{ row.identifier }}</small>
                        <span v-if="!row.is_active" class="badge bg-secondary">{{ t('seo.inactive') }}</span>
                    </div>
                </template>

                <template #cell-meta_title="{ row }">
                    <span :title="row.meta_title || ''">{{ row.meta_title || '—' }}</span>
                </template>

                <template #cell-meta_description="{ row }">
                    <span class="seo-description" :title="row.meta_description || ''">
                        {{ row.meta_description || '—' }}
                    </span>
                </template>

                <template #cell-completeness="{ row }">
                    <span :class="isSeoComplete(row) ? 'badge bg-success' : 'badge bg-warning text-dark'">
                        {{ isSeoComplete(row) ? t('seo.complete') : t('seo.missing') }}
                    </span>
                </template>

                <template #cell-actions="{ row }">
                    <BaseButton size="sm" @click.stop="editRow(row)">
                        {{ t('common.edit') }}
                    </BaseButton>
                </template>
            </BaseTable>
        </div>

        <BasePagination
            :page="page"
            :per-page="store.pagination.per_page"
            :total="store.pagination.total"
            :last-page="store.pagination.last_page"
            :disabled="store.loading"
            @change="changePage"
        />

        <section v-if="editing" class="section seo-editor">
            <div class="seo-editor__heading">
                <h2>{{ t('seo.edit_title', { title: editing.name || `#${editing.id}` }) }}</h2>
                <BaseButton variant="secondary" size="sm" @click="closeEditor">
                    {{ t('common.cancel') }}
                </BaseButton>
            </div>

            <form @submit.prevent="saveEditing">
                <div class="form-group">
                    <BaseLabel for-id="seo-meta-title">{{ t('seo.meta_title') }}</BaseLabel>
                    <BaseInput id="seo-meta-title" v-model="draft.meta_title" maxlength="255" />
                </div>

                <div class="form-group">
                    <BaseLabel for-id="seo-meta-description">{{ t('seo.meta_description') }}</BaseLabel>
                    <textarea
                        id="seo-meta-description"
                        v-model="draft.meta_description"
                        class="form-control"
                        maxlength="2000"
                        rows="5"
                    ></textarea>
                </div>

                <div class="form-group">
                    <BaseLabel>{{ t('seo.source_description') }}</BaseLabel>
                    <div class="seo-source-description">{{ editing.description_short || '—' }}</div>
                </div>

                <div class="seo-editor__actions">
                    <BaseButton type="submit" :loading="saving">{{ t('common.save') }}</BaseButton>
                </div>
            </form>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { isAxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { useLangStore } from '@/core/stores/langStore';
import { useSeoStore } from '@/core/stores/seoStore';
import { useUiStore } from '@/core/stores/uiStore';
import type {
    SeoEntityType,
    SeoRecord,
    SeoStatus,
} from '@/composables/types/seo';
import BaseButton from '@shared/ui/BaseButton.vue';
import BaseInput from '@shared/ui/BaseInput.vue';
import BaseLabel from '@shared/ui/BaseLabel.vue';
import BasePagination from '@shared/components/BasePagination/BasePagination.vue';
import BaseTable from '@shared/components/BaseTable/BaseTable.vue';
import './seo.css';

const { t } = useI18n();
const store = useSeoStore();
const ui = useUiStore();
const langStore = useLangStore();

const entityType = ref<SeoEntityType>('product');
const seoStatus = ref<SeoStatus>('all');
const search = ref('');
const page = ref(1);
const perPage = ref(25);
const sortBy = ref('name');
const sortDir = ref<'asc' | 'desc'>('asc');
const selectedIds = ref<number[]>([]);
const editing = ref<SeoRecord | null>(null);
const draft = ref({
    meta_title: '',
    meta_description: '',
});
const saving = ref(false);
const generating = ref(false);
const selectedLangIds = ref<number[]>([]);
let searchTimer: ReturnType<typeof setTimeout> | undefined;

const columns = computed(() => [
    { key: 'selected', label: '', sortable: false },
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: t('seo.name'), sortable: true },
    { key: 'meta_title', label: t('seo.meta_title'), sortable: true },
    { key: 'meta_description', label: t('seo.meta_description'), sortable: false },
    { key: 'completeness', label: t('seo.completeness'), sortable: false },
    { key: 'actions', label: '', sortable: false },
]);

const visibleIds = computed(() => store.records.map(record => record.id));
const allVisibleSelected = computed(() =>
    visibleIds.value.length > 0 && visibleIds.value.every(id => selectedIds.value.includes(id)),
);
const someVisibleSelected = computed(() =>
    !allVisibleSelected.value && visibleIds.value.some(id => selectedIds.value.includes(id)),
);

async function fetchRecords(): Promise<void> {
    try {
        await store.fetchList({
            type: entityType.value,
            seo_status: seoStatus.value,
            search: search.value.trim() || undefined,
            page: page.value,
            per_page: perPage.value,
            sort_by: sortBy.value,
            sort_dir: sortDir.value,
        });
    } catch {
        ui.showError(t('seo.load_error'));
    }
}

function resetAndFetch(): void {
    page.value = 1;
    selectedIds.value = [];
    closeEditor();
    void fetchRecords();
}

function changePage(nextPage: number): void {
    if (nextPage === page.value) return;
    page.value = nextPage;
    selectedIds.value = [];
    closeEditor();
    void fetchRecords();
}

function changeSort(payload: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    sortBy.value = payload.sortBy;
    sortDir.value = payload.sortDir;
    resetAndFetch();
}

function isSelected(id: number): boolean {
    return selectedIds.value.includes(id);
}

function toggleSelected(id: number): void {
    selectedIds.value = isSelected(id)
        ? selectedIds.value.filter(selectedId => selectedId !== id)
        : [...selectedIds.value, id];
}

function toggleAllVisible(): void {
    if (allVisibleSelected.value) {
        selectedIds.value = selectedIds.value.filter(id => !visibleIds.value.includes(id));
        return;
    }

    selectedIds.value = [...new Set([...selectedIds.value, ...visibleIds.value])];
}

function isSeoComplete(record: Record<string, any>): boolean {
    return Boolean(record.meta_title?.trim() && record.meta_description?.trim());
}

function editRow(tableRecord: Record<string, any>): void {
    const record = tableRecord as SeoRecord;
    editing.value = record;
    draft.value = {
        meta_title: record.meta_title ?? '',
        meta_description: record.meta_description ?? '',
    };

    requestAnimationFrame(() => {
        document.querySelector('.seo-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

function closeEditor(): void {
    editing.value = null;
    draft.value = { meta_title: '', meta_description: '' };
}

async function saveEditing(): Promise<void> {
    if (!editing.value) return;
    saving.value = true;

    try {
        const updated = await store.update(entityType.value, editing.value.id, {
            meta_title: normalizeOptional(draft.value.meta_title),
            meta_description: normalizeOptional(draft.value.meta_description),
        });
        editing.value = updated;
        draft.value = {
            meta_title: updated.meta_title ?? '',
            meta_description: updated.meta_description ?? '',
        };
        ui.showSuccess(t('seo.saved'));
    } catch (error) {
        ui.showError(errorMessage(error, t('seo.save_error')));
    } finally {
        saving.value = false;
    }
}

async function generateSelected(): Promise<void> {
    if (selectedIds.value.length === 0 || selectedLangIds.value.length === 0) return;
    generating.value = true;

    try {
        const count = await store.generate(entityType.value, selectedIds.value, selectedLangIds.value);
        await fetchRecords();
        closeEditor();
        ui.showSuccess(t('seo.generated', { count }));
        selectedIds.value = [];
    } catch (error) {
        ui.showError(errorMessage(error, t('seo.generate_error')));
    } finally {
        generating.value = false;
    }
}

function toggleLanguage(id: number): void {
    selectedLangIds.value = selectedLangIds.value.includes(id)
        ? selectedLangIds.value.filter(selected => selected !== id)
        : [...selectedLangIds.value, id];
}

function normalizeOptional(value: string | null): string | null {
    const normalized = value?.trim() ?? '';
    return normalized === '' ? null : normalized;
}

function errorMessage(error: unknown, fallback: string): string {
    if (isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) {
        const validationMessage = Object.values(error.response?.data.errors ?? {})[0]?.[0];
        return validationMessage ?? error.response?.data.message ?? fallback;
    }

    return fallback;
}

watch([entityType, seoStatus, perPage], resetAndFetch);
watch(() => langStore.current, resetAndFetch);
watch(search, () => {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(resetAndFetch, 350);
});

onMounted(() => {
    void langStore.fetchLangs().then(() => {
        const current = langStore.currentLang;
        if (current) selectedLangIds.value = [current.id];
    });
    void fetchRecords();
});

onBeforeUnmount(() => {
    if (searchTimer) clearTimeout(searchTimer);
});
</script>
