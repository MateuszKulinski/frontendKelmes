<template>
    <div class="translation-fields">
        <div class="translation-fields__header">
            <h3>
                {{ title ?? t('common.langs') }}
                <span v-if="selectedItem" class="translation-fields__language"> {{ languageLabel(selectedItem) }}</span>
            </h3>
            <Listbox v-if="items.length" v-model="selectedLanguageId" as="template">
                <div class="translation-fields__picker">
                    <ListboxLabel as="template">
                        <BaseLabel :for-id="selectId" class-name="mb-0 text-nowrap">
                            {{ t('common.content_language') }}
                        </BaseLabel>
                    </ListboxLabel>
                    <div class="position-relative">
                        <ListboxButton :id="selectId" as="template">
                            <BaseButton type="button" variant="dropdown" class="translation-fields__button">
                                <template v-if="selectedItem">
                                    <span v-if="languageCode(selectedItem)" :class="languageFlagClass(selectedItem)" aria-hidden="true" />
                                    <span>{{ languageLabel(selectedItem) }}</span>
                                </template>
                                <BaseIcon name="chDown" aria-hidden="true" />
                            </BaseButton>
                        </ListboxButton>
                        <ListboxOptions class="dropdown-menu show translation-fields__options">
                            <ListboxOption v-for="(item, index) in items" :key="languageId(item)" :value="languageId(item)"
                                as="template" v-slot="{ active, selected }">
                                <li class="dropdown-item pointer translation-fields__option" :class="{ active: active || selected }">
                                    <span v-if="languageCode(item)" :class="languageFlagClass(item)" aria-hidden="true" />
                                    <span>{{ languageLabel(item) }}</span>
                                    <small v-if="itemErrors(item, index).length">— {{ t('common.fix_form') }}</small>
                                </li>
                            </ListboxOption>
                        </ListboxOptions>
                    </div>
                </div>
            </Listbox>
        </div>

        <p v-if="!items.length" class="text-muted mb-0">{{ t('common.no_content_languages') }}</p>

        <!-- Keep editors and file inputs mounted so switching languages preserves their state. -->
        <div v-for="(item, index) in items" :key="languageId(item)"
            v-show="languageId(item) === selectedLanguageId" :lang="languageCode(item)"
            @invalid.capture="showInvalidLanguage($event, item)">
            <div v-if="itemErrors(item, index).length" class="text-danger small mb-2" role="alert">
                <div v-for="(message, key) in itemErrors(item, index)" :key="key">{{ message }}</div>
            </div>
            <slot :item="item" :index="index" />
        </div>
    </div>
</template>

<script setup lang="ts" generic="T extends { lang_id?: number; id_lang?: number; id?: number; code?: string | null }">
import { computed, nextTick, ref, useId, watch } from 'vue';
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue';
import { useI18n } from 'vue-i18n';
import { useLangStore } from '@/core/stores/langStore';
import BaseLabel from '@shared/ui/BaseLabel.vue';
import BaseButton from '@shared/ui/BaseButton.vue';
import BaseIcon from '@shared/ui/BaseIcon.vue';

const props = defineProps<{
    items: T[];
    title?: string;
    languageIdKey?: 'lang_id' | 'id_lang' | 'id';
    errors?: Record<string, string>;
    errorPrefix?: string;
}>();

defineSlots<{ default(props: { item: T; index: number }): unknown }>();

const { t } = useI18n();
const langStore = useLangStore();
const selectId = `content-language-${useId()}`;
// This is local form state; it never changes the application locale or language store.
const selectedLanguageId = ref<number>();
const languageId = (item: T) => Number(item[props.languageIdKey ?? 'lang_id']);
const selectedItem = computed(() => props.items.find(item => languageId(item) === selectedLanguageId.value));
const languageCode = (item: T) => langStore.langs.find(lang => lang.id === languageId(item))?.code ?? item.code ?? undefined;
const languageFlagClass = (item: T) => `fi fi-${languageCode(item) === 'en' ? 'gb' : languageCode(item)}`;
const languageLabel = (item: T) => {
    const lang = langStore.langs.find(lang => lang.id === languageId(item));
    const code = languageCode(item)?.toUpperCase();
    return lang ? `${lang.name} (${code})` : code ?? `#${languageId(item)}`;
};

watch(() => props.items.map(languageId), ids => {
    if (selectedLanguageId.value !== undefined && ids.includes(selectedLanguageId.value)) return;
    selectedLanguageId.value = ids.find(id => id === langStore.currentLang?.id)
        ?? ids.find(id => langStore.langs.find(lang => lang.id === id)?.is_default)
        ?? ids[0];
}, { immediate: true });

const itemErrors = (item: T, index: number) => {
    const prefix = `${props.errorPrefix ?? 'langs'}.${index}`;
    return Object.entries(props.errors ?? {})
        .filter(([key, message]) => message && (key === prefix || key.startsWith(`${prefix}.`) || key === `lang_${languageId(item)}`))
        .map(([, message]) => message);
};

const invalidLanguageIds = computed(() => props.items
    .filter((item, index) => itemErrors(item, index).length)
    .map(languageId));

watch(invalidLanguageIds, ids => {
    if (ids.length && (selectedLanguageId.value === undefined || !ids.includes(selectedLanguageId.value))) {
        selectedLanguageId.value = ids[0];
    }
}, { immediate: true });

let revealingInvalidField = false;
const showInvalidLanguage = async (event: Event, item: T) => {
    if (revealingInvalidField) {
        event.preventDefault();
        return;
    }
    revealingInvalidField = true;
    // Native validation emits an invalid event for every failing control in one pass.
    setTimeout(() => { revealingInvalidField = false; }, 0);
    if (selectedLanguageId.value !== languageId(item)) {
        event.preventDefault();
        selectedLanguageId.value = languageId(item);
        await nextTick();
        (event.target as HTMLInputElement).focus();
    }
};
</script>

<style scoped>
.translation-fields__header,
.translation-fields__picker {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--gap-sm);
}

.translation-fields__header {
    justify-content: space-between;
    margin-bottom: var(--margin-lg);
}

.translation-fields__header h3 {
    margin: 0;
    font-size: var(--font-size-lg);
    color: var(--text-primary);
}

.translation-fields__language {
    color: var(--text-secondary);
}

.translation-fields__button.btn {
    border: 1px solid var(--border-default);
    background-color: var(--bg-surface);
    color: var(--text-primary);
}

.translation-fields__button.btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
}

.translation-fields__options {
    top: calc(100% + var(--margin-sm));
    right: 0;
    min-width: 100%;
    background-color: var(--bg-surface);
    border-color: var(--border-default);
    border-radius: var(--radius-sm);
}

.translation-fields__option {
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
}

.translation-fields__option.active {
    background-color: var(--accent-muted);
    color: var(--text-primary);
}
</style>
