<template>
    <div class="site-meta-data-view">
        <div class="site-meta-data-heading">
            <div>
                <h1>{{ t('siteMetaData.title') }}</h1>
                <p class="text-muted mb-0">{{ t('siteMetaData.intro') }}</p>
            </div>
            <BaseButton :disabled="saving || !langStore.langs.length" @click="openEditor()">
                {{ t('siteMetaData.add') }}
            </BaseButton>
        </div>

        <p v-if="!langStore.langs.length" class="alert alert-warning" role="alert">
            {{ t('siteMetaData.languages_error') }}
        </p>

        <section class="section site-meta-data-filters">
            <div>
                <BaseLabel for-id="metadata-language-filter">{{ t('siteMetaData.language') }}</BaseLabel>
                <select id="metadata-language-filter" v-model="languageFilter" class="form-select">
                    <option value="">{{ t('siteMetaData.all_languages') }}</option>
                    <option v-for="lang in langStore.langs" :key="lang.id" :value="lang.id">
                        {{ lang.name }} ({{ lang.code.toUpperCase() }})
                    </option>
                </select>
            </div>
            <div>
                <BaseLabel for-id="metadata-search">{{ t('siteMetaData.search') }}</BaseLabel>
                <BaseInput id="metadata-search" v-model="search" type="search" maxlength="255"
                    :placeholder="t('siteMetaData.search_placeholder')" />
            </div>
            <div>
                <BaseLabel for-id="metadata-per-page">{{ t('siteMetaData.per_page') }}</BaseLabel>
                <select id="metadata-per-page" v-model.number="perPage" class="form-select">
                    <option v-for="size in [25, 50, 100]" :key="size" :value="size">{{ size }}</option>
                </select>
            </div>
        </section>

        <div v-if="loadError" class="alert alert-danger" role="alert">
            {{ t('siteMetaData.load_error') }}
            <BaseButton size="sm" variant="secondary" @click="fetchRecords">{{ t('siteMetaData.retry') }}</BaseButton>
        </div>
        <template v-else>
            <div class="site-meta-data-table">
                <BaseTable :columns="columns" :data="store.records" :loading="store.loading"
                    :current-page="page" :per-page="store.pagination.per_page" :sort-by="sortBy" :sort-dir="sortDir"
                    @sort="changeSort">
                    <template #cell-langs="{ row }">
                        <div class="d-flex flex-wrap gap-1">
                            <span v-for="lang in row.langs" :key="lang.lang_id" class="badge bg-secondary" :title="lang.language_name || ''">
                                {{ lang.code?.toUpperCase() || `#${lang.lang_id}` }}
                            </span>
                        </div>
                    </template>
                    <template #cell-meta_title="{ row }">
                        <div v-for="lang in visibleTranslations(row as SiteMetaDataRecord)" :key="lang.lang_id" class="mb-1">
                            <small class="text-muted">{{ lang.code?.toUpperCase() || `#${lang.lang_id}` }}:</small>
                            {{ lang.meta_title || '—' }}
                        </div>
                    </template>
                    <template #cell-meta_description="{ row }">
                        <span v-for="lang in visibleTranslations(row as SiteMetaDataRecord)" :key="lang.lang_id"
                            class="site-meta-data-description mb-1" :title="lang.meta_description || ''">
                            <small class="text-muted">{{ lang.code?.toUpperCase() || `#${lang.lang_id}` }}:</small>
                            {{ lang.meta_description || '—' }}
                        </span>
                    </template>
                    <template #cell-actions="{ row }">
                        <BaseButton size="sm" :disabled="saving" @click.stop="openEditor(row as SiteMetaDataRecord)">
                            {{ t('common.edit') }}
                        </BaseButton>
                    </template>
                </BaseTable>
            </div>
            <BasePagination :page="page" :per-page="store.pagination.per_page" :total="store.pagination.total"
                :last-page="store.pagination.last_page" :disabled="store.loading" @change="changePage" />
        </template>

        <section v-if="editorOpen" ref="editorElement" class="section site-meta-data-editor">
            <h2>{{ editing ? t('siteMetaData.edit', { name: editing.name }) : t('siteMetaData.add') }}</h2>
            <form @submit.prevent="saveRecord">
                <fieldset :disabled="saving" class="site-meta-data-form">
                    <div class="site-meta-data-form__wide">
                        <BaseLabel for-id="metadata-name" required>{{ t('siteMetaData.name') }}</BaseLabel>
                        <BaseInput id="metadata-name" v-model="draft.name" required maxlength="255"
                            :readonly="!!editing"
                            :error="!!errors.name" :aria-invalid="!!errors.name" aria-describedby="metadata-name-hint metadata-name-error" />
                        <div id="metadata-name-hint" class="form-text">{{ t('siteMetaData.name_hint') }}</div>
                        <div v-if="errors.name" id="metadata-name-error" class="invalid-feedback d-block">{{ errors.name[0] }}</div>
                    </div>
                    <TranslationFields class="site-meta-data-form__wide" :items="draft.langs" :errors="translationErrors" v-slot="{ item: lang, index }">
                        <div class="site-meta-data-translation">
                            <div>
                                <BaseLabel :for-id="`metadata-title-${index}`">{{ t('siteMetaData.meta_title') }}</BaseLabel>
                                <BaseInput :id="`metadata-title-${index}`" v-model="lang.meta_title" maxlength="255"
                                    :error="!!errors[`langs.${index}.meta_title`]" :aria-invalid="!!errors[`langs.${index}.meta_title`]"
                                    :aria-describedby="`metadata-title-error-${index}`" />
                                <div v-if="errors[`langs.${index}.meta_title`]" :id="`metadata-title-error-${index}`" class="invalid-feedback d-block">
                                    {{ errors[`langs.${index}.meta_title`]?.[0] }}
                                </div>
                            </div>
                            <div>
                                <BaseLabel :for-id="`metadata-description-${index}`">{{ t('siteMetaData.meta_description') }}</BaseLabel>
                                <textarea :id="`metadata-description-${index}`" v-model="lang.meta_description" class="form-control" rows="5"
                                    :class="{ 'is-invalid': errors[`langs.${index}.meta_description`] }"
                                    :aria-invalid="!!errors[`langs.${index}.meta_description`]"
                                    :aria-describedby="`metadata-description-error-${index}`"></textarea>
                                <div v-if="errors[`langs.${index}.meta_description`]" :id="`metadata-description-error-${index}`" class="invalid-feedback d-block">
                                    {{ errors[`langs.${index}.meta_description`]?.[0] }}
                                </div>
                            </div>
                        </div>
                    </TranslationFields>
                    <div class="site-meta-data-form__wide site-meta-data-actions">
                        <BaseButton type="button" variant="secondary" @click="closeEditor">{{ t('common.cancel') }}</BaseButton>
                        <BaseButton type="submit" :loading="saving">{{ t('common.save') }}</BaseButton>
                    </div>
                </fieldset>
            </form>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { isAxiosError, isCancel } from 'axios';
import { useI18n } from 'vue-i18n';
import { useSiteMetaDataStore } from '@/core/stores/siteMetaDataStore';
import { useLangStore } from '@/core/stores/langStore';
import { useUiStore } from '@/core/stores/uiStore';
import type { SiteMetaDataRecord } from '@/composables/types/siteMetaData';
import BaseTable from '@/views/shared/components/BaseTable/BaseTable.vue';
import BasePagination from '@/views/shared/components/BasePagination/BasePagination.vue';
import BaseButton from '@/views/shared/ui/BaseButton.vue';
import BaseInput from '@/views/shared/ui/BaseInput.vue';
import BaseLabel from '@/views/shared/ui/BaseLabel.vue';
import TranslationFields from '@admin/components/TranslationFields.vue';
import './siteMetaData.css';

const { t } = useI18n();
const store = useSiteMetaDataStore();
const langStore = useLangStore();
const ui = useUiStore();
const languageFilter = ref<number | ''>('');
const search = ref('');
const page = ref(1);
const perPage = ref(25);
const sortBy = ref('name');
const sortDir = ref<'asc' | 'desc'>('asc');
const loadError = ref(false);
const editorOpen = ref(false);
const editing = ref<SiteMetaDataRecord | null>(null);
const editorElement = ref<HTMLElement | null>(null);
type DraftLanguage = { lang_id: number; code: string | null; meta_title: string; meta_description: string };
const draft = ref({ name: '', langs: [] as DraftLanguage[] });
const errors = ref<Record<string, string[]>>({});
const saving = ref(false);
let controller: AbortController | undefined;
let searchTimer: ReturnType<typeof setTimeout> | undefined;

const columns = computed(() => [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: t('siteMetaData.name'), sortable: true },
    { key: 'langs', label: t('siteMetaData.language') },
    { key: 'meta_title', label: t('siteMetaData.meta_title') },
    { key: 'meta_description', label: t('siteMetaData.meta_description') },
    { key: 'actions', label: '' },
]);

const translationErrors = computed(() => Object.fromEntries(
    Object.entries(errors.value).map(([key, messages]) => [key, messages[0] ?? '']),
));

function visibleTranslations(record: SiteMetaDataRecord) {
    return languageFilter.value ? record.langs.filter(lang => lang.lang_id === languageFilter.value) : record.langs;
}

async function fetchRecords(): Promise<void> {
    controller?.abort();
    controller = new AbortController();
    loadError.value = false;
    try {
        await store.fetchList({
            lang_id: languageFilter.value || undefined,
            search: search.value.trim() || undefined,
            page: page.value,
            per_page: perPage.value,
            sort_by: sortBy.value,
            sort_dir: sortDir.value,
        }, controller.signal);
    } catch (error) {
        if (!isCancel(error)) loadError.value = true;
    }
}

function resetAndFetch(): void {
    if (searchTimer) clearTimeout(searchTimer);
    page.value = 1;
    void fetchRecords();
}

function changePage(nextPage: number): void {
    page.value = nextPage;
    void fetchRecords();
}

function changeSort(payload: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    sortBy.value = payload.sortBy;
    sortDir.value = payload.sortDir;
    resetAndFetch();
}

async function openEditor(record?: SiteMetaDataRecord): Promise<void> {
    editing.value = record ?? null;
    const languages = new Map<number, { lang_id: number; code: string | null }>(
        langStore.langs.map(lang => [lang.id, { lang_id: lang.id, code: lang.code }]),
    );
    for (const lang of record?.langs ?? []) languages.set(lang.lang_id, lang);
    draft.value = {
        name: record?.name ?? '',
        langs: [...languages.values()].map(lang => {
            const existing = record?.langs.find(item => item.lang_id === lang.lang_id);
            return { ...lang, meta_title: existing?.meta_title ?? '', meta_description: existing?.meta_description ?? '' };
        }),
    };
    errors.value = {};
    editorOpen.value = true;
    await nextTick();
    editorElement.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    editorElement.value?.querySelector<HTMLInputElement>('#metadata-name')?.focus({ preventScroll: true });
}

function closeEditor(): void {
    editorOpen.value = false;
    editing.value = null;
    errors.value = {};
}

async function saveRecord(): Promise<void> {
    if (saving.value || !draft.value.langs.length) return;
    saving.value = true;
    errors.value = {};
    const payload = {
        langs: draft.value.langs.map(lang => ({
            lang_id: lang.lang_id,
            meta_title: lang.meta_title.trim() || null,
            meta_description: lang.meta_description.trim() || null,
        })),
    };
    try {
        if (editing.value) {
            await store.update(editing.value.id, payload);
        } else {
            await store.create({ ...payload, name: draft.value.name.trim() });
        }
        closeEditor();
        ui.showSuccess(t('siteMetaData.saved'));
        await fetchRecords();
    } catch (error) {
        if (isAxiosError<{ errors?: Record<string, string[]> }>(error) && error.response?.status === 422) {
            errors.value = error.response.data.errors ?? {};
            await nextTick();
            editorElement.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        } else {
            ui.showError(t('siteMetaData.save_error'));
        }
    } finally {
        saving.value = false;
    }
}

watch([languageFilter, perPage], resetAndFetch);
watch(search, () => {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(resetAndFetch, 350);
});

onMounted(() => { void fetchRecords(); });
onBeforeUnmount(() => {
    controller?.abort();
    store.loading = false;
    if (searchTimer) clearTimeout(searchTimer);
});
</script>
