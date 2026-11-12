<template>
    <form class="admin-form-one-column" @submit.prevent="submit">
        <div class="section">
            <h3>{{ t("common.basic") }}</h3>

            <div class="user-grid">
                <div class="news-category-field">
                    <div class="form-group floating search-wrapper" @focusout="onCategorySearchFocusOut">
                        <BaseLabel>
                            {{ t("news.category") }}
                        </BaseLabel>

                        <BaseInput v-model="newsCategorySearch" :placeholder="t('news.search_category')"
                            @focus="openNewsCategorySearch" />

                        <div v-if="categorySearching" class="search-loading">
                            {{ t("common.loading") }}
                        </div>

                        <div v-else-if="
                            categorySearchOpen &&
                            categoryOptions.length
                        " class="search-options">
                            <button v-for="option in categoryOptions" :key="option.id" type="button"
                                class="search-option" @click="selectNewsCategory(option)">
                                {{ option.name || `#${option.id}` }}

                                <span class="search-option-secondary">
                                    ID: {{ option.id }}
                                </span>
                            </button>
                        </div>

                        <div v-else-if="categorySearchOpen" class="search-loading">
                            {{ t("common.no_results") }}
                        </div>
                    </div>

                    <div v-if="form.news_category_id" class="tags mt-2">
                        <span class="tag">
                            {{
                                selectedCategoryTitle ||
                                `#${form.news_category_id}`
                            }}

                            (ID: {{ form.news_category_id }})

                            <button type="button" :aria-label="t('news.remove_category')" @click="clearNewsCategory">
                                ×
                            </button>
                        </span>
                    </div>

                    <div v-if="errors.news_category_id" class="error">
                        {{ errors.news_category_id }}
                    </div>
                </div>

                <div class="form-group floating">
                    <BaseLabel>
                        {{ t("news.publish_date") }}
                    </BaseLabel>

                    <input v-model="form.publish_date" type="datetime-local" class="form-control" />

                    <div v-if="errors.publish_date" class="error">
                        {{ errors.publish_date }}
                    </div>
                </div>
            </div>

            <BaseCheckbox v-model="form.is_active">
                {{ t("common.active") }}
            </BaseCheckbox>
        </div>

        <div class="section">
            <h3>{{ t("news.assignments") }}</h3>

            <div class="user-grid">
                <div class="form-group floating">
                    <BaseLabel>
                        {{ t("news.assignment_type") }}
                    </BaseLabel>

                    <select v-model="relationType" class="form-control">
                        <option value="category">
                            {{ t("news.catalog_category") }}
                        </option>

                        <option value="product">
                            {{ t("news.product") }}
                        </option>
                    </select>
                </div>

                <div class="form-group floating search-wrapper">
                    <BaseLabel>
                        {{ t("news.assignment_search") }}
                    </BaseLabel>

                    <BaseInput v-model="relationSearch" :placeholder="relationType === 'category'
                        ? t('news.assignment_search_category')
                        : t('news.assignment_search_product')
                        " />

                    <div v-if="searching" class="search-loading">
                        {{ t("common.loading") }}
                    </div>

                    <div v-else-if="visibleRelationOptions.length" class="search-options">
                        <button v-for="option in visibleRelationOptions" :key="`${option.type}-${option.id}`"
                            type="button" class="search-option" @click="addRelation(option)">
                            {{ option.name || `#${option.id}` }}

                            <span class="search-option-secondary">
                                ID: {{ option.id }}
                            </span>

                            <span v-if="option.identifier" class="search-option-secondary">
                                {{ t("news.index") }}:
                                {{ option.identifier }}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="tags mt-2">
                <span v-for="relation in form.relations" :key="`${relation.news_relation_type}-${relation.relation_id}`"
                    class="tag">
                    {{
                        relation.news_relation_type === "category"
                            ? t("news.catalog_category")
                            : t("news.product")
                    }}:

                    {{
                        relation.name ||
                        `#${relation.relation_id}`
                    }}

                    (ID: {{ relation.relation_id }})

                    <button type="button" @click="removeRelation(relation)">
                        ×
                    </button>
                </span>
            </div>
        </div>

        <div class="section full">
            <TranslationFields :items="form.langs" :errors="errors" v-slot="{ item: lang, index }">
                <div class="user-grid">
                    <div class="form-group floating">
                        <BaseLabel>
                            {{ t("common.name") }}
                        </BaseLabel>

                        <BaseInput v-model="lang.title" />

                        <div v-if="errors[`langs.${index}.title`]" class="error">
                            {{ errors[`langs.${index}.title`] }}
                        </div>
                    </div>
                </div>

                <div class="form-group floating mt-2">
                    <BaseLabel>
                        {{ t("news.short_description") }}
                    </BaseLabel>

                    <RichTextEditor v-model="lang.short_description" />

                    <div v-if="errors[`langs.${index}.short_description`]" class="error">
                        {{
                            errors[
                            `langs.${index}.short_description`
                            ]
                        }}
                    </div>
                </div>

                <div class="form-group floating mt-2">
                    <BaseLabel>
                        {{ t("news.content") }}
                    </BaseLabel>

                    <RichTextEditor v-model="lang.content" />

                    <div v-if="errors[`langs.${index}.content`]" class="error">
                        {{
                            errors[
                            `langs.${index}.content`
                            ]
                        }}
                    </div>
                </div>

                <div class="form-group floating mt-2">
                    <BaseLabel>
                        {{ t("news.image") }}
                    </BaseLabel>

                    <input type="file" accept="image/*" class="form-control" @change="
                        onLangImageChange(
                            $event,
                            lang
                        )
                        " />

                    <div v-if="lang.image" class="text-muted mt-1">
                        {{ lang.image.name }}
                    </div>

                    <img v-else-if="lang.current_image" :src="lang.current_image" :alt="lang.title"
                        class="img-preview mt-2" />

                    <div v-if="errors[`langs.${index}.image`]" class="error">
                        {{ errors[`langs.${index}.image`] }}
                    </div>
                </div>
            </TranslationFields>
        </div>

        <div class="full">
            <BaseButton type="submit" class="submit-btn">
                {{
                    props.isEdit
                        ? t("common.save")
                        : t("common.create")
                }}
            </BaseButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import TranslationFields from '@admin/components/TranslationFields.vue';
import { useI18n } from "vue-i18n";
import {
    computed,
    onBeforeUnmount,
    ref,
    watch,
} from "vue";

import api from "@/core/api/axios";

import type { NewsAssignment } from "./NewsForm";
import type { SeoRecord } from "@/composables/types/seo";

import { useNewsForm } from "./NewsForm";
import { useLangStore } from "@/core/stores/langStore";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseLabel from "@shared/ui/BaseLabel.vue";
import RichTextEditor from "@shared/ui/RichTextEditor.vue";
import BaseCheckbox from "@shared/components/BaseCheckbox/BaseCheckbox.vue";

const { t } = useI18n();

const relationType = ref<"category" | "product">("category");
const relationSearch = ref("");
const relationOptions = ref<SeoRecord[]>([]);

const visibleRelationOptions = computed(() =>
    relationOptions.value.filter(
        (option) => option.type === relationType.value
    )
);

const searching = ref(false);

let searchTimer:
    | ReturnType<typeof setTimeout>
    | undefined;

let searchVersion = 0;

interface NewsCategorySearchItem {
    id: number;
    name: string;
}

const newsCategorySearch = ref("");
const categoryOptions =
    ref<NewsCategorySearchItem[]>([]);

const categorySearching = ref(false);
const categorySearchOpen = ref(false);
const selectedCategoryTitle = ref("");

let categorySearchTimer:
    | ReturnType<typeof setTimeout>
    | undefined;

let categorySearchVersion = 0;

const props = withDefaults(
    defineProps<{
        isEdit?: boolean;
        categoryId?: number | null;
        categoryTitle?: string;
    }>(),
    {
        isEdit: false,
        categoryId: null,
        categoryTitle: "",
    }
);

const emit = defineEmits<{
    (
        event: "submit",
        payload: FormData
    ): void;
}>();

const {
    form,
    errors,
    onLangImageChange,
    submit,
    setFormData: setNewsFormData,
    handleValidationError,
    ensureLangs,
} = useNewsForm(
    emit,
    props.categoryId
);

watch(
    () => useLangStore().langs.length,
    ensureLangs
);

watch(
    () => props.categoryTitle,
    (title) => {
        if (
            form.news_category_id &&
            form.news_category_id === props.categoryId
        ) {
            selectedCategoryTitle.value = title;
        }
    },
    { immediate: true }
);

const setFormData = (
    data: {
        category_title?: string;
        [key: string]: unknown;
    }
) => {
    setNewsFormData(data);

    selectedCategoryTitle.value =
        data.category_title ?? "";
};

const searchNewsCategories = () => {
    clearTimeout(categorySearchTimer);

    const version = ++categorySearchVersion;
    const term = newsCategorySearch.value.trim();

    categoryOptions.value = [];

    if (
        !categorySearchOpen.value ||
        !term
    ) {
        categorySearching.value = false;
        return;
    }

    categorySearching.value = true;

    categorySearchTimer = setTimeout(
        async () => {
            try {
                const { data } =
                    await api.get<
                        NewsCategorySearchItem[]
                    >(
                        "/searchData/categories",
                        {
                            params: {
                                search: term,
                            },
                        }
                    );

                if (
                    version ===
                    categorySearchVersion &&
                    categorySearchOpen.value
                ) {
                    categoryOptions.value = data;
                }
            } catch {
                if (
                    version ===
                    categorySearchVersion
                ) {
                    categoryOptions.value = [];
                }
            } finally {
                if (
                    version ===
                    categorySearchVersion
                ) {
                    categorySearching.value = false;
                }
            }
        },
        300
    );
};

const openNewsCategorySearch = () => {
    categorySearchOpen.value = true;
    searchNewsCategories();
};

const onCategorySearchFocusOut = (
    event: FocusEvent
) => {
    const next =
        event.relatedTarget as Node | null;

    if (
        next &&
        (event.currentTarget as HTMLElement).contains(
            next
        )
    ) {
        return;
    }

    categorySearchOpen.value = false;
    categoryOptions.value = [];
    categorySearching.value = false;

    clearTimeout(categorySearchTimer);
    categorySearchVersion++;
};

watch(
    newsCategorySearch,
    searchNewsCategories
);

const selectNewsCategory = (
    category: NewsCategorySearchItem
) => {
    form.news_category_id = category.id;

    selectedCategoryTitle.value =
        category.name ?? "";

    categorySearchOpen.value = false;
    newsCategorySearch.value = "";
    categoryOptions.value = [];
    categorySearching.value = false;

    clearTimeout(categorySearchTimer);
    categorySearchVersion++;
};

const clearNewsCategory = () => {
    form.news_category_id = 0;
    selectedCategoryTitle.value = "";
};

watch(
    relationType,
    () => {
        relationSearch.value = "";
        relationOptions.value = [];
        searching.value = false;
        searchVersion++;

        clearTimeout(searchTimer);
    },
    { flush: "sync" }
);

const searchRelations = () => {
    clearTimeout(searchTimer);

    const version = ++searchVersion;
    const term = relationSearch.value.trim();
    const type = relationType.value;

    relationOptions.value = [];

    if (!term) {
        searching.value = false;
        return;
    }

    searchTimer = setTimeout(async () => {
        searching.value = true;

        try {
            const { data } =
                await api.get<{
                    data: SeoRecord[];
                }>(`/news/relation-search/${type}`, {
                    params: {
                        search: term,
                    },
                });

            if (
                version === searchVersion &&
                type === relationType.value
            ) {
                relationOptions.value =
                    data.data.filter(
                        (option) =>
                            option.type === type
                    );
            }
        } catch {
            if (version === searchVersion) {
                relationOptions.value = [];
            }
        } finally {
            if (version === searchVersion) {
                searching.value = false;
            }
        }
    }, 350);
};

watch(
    relationSearch,
    searchRelations
);

onBeforeUnmount(() => {
    clearTimeout(searchTimer);
    clearTimeout(categorySearchTimer);
});

const addRelation = (
    option: SeoRecord
) => {
    if (
        option.type !== relationType.value ||
        !visibleRelationOptions.value.some(
            (item) =>
                item.type === option.type &&
                item.id === option.id
        )
    ) {
        return;
    }

    if (
        !form.relations.some(
            (item) =>
                item.news_relation_type ===
                option.type &&
                item.relation_id === option.id
        )
    ) {
        form.relations.push({
            news_relation_type: option.type,
            relation_id: option.id,
            name: option.name ?? undefined,
        });
    }

    relationSearch.value = "";
    relationOptions.value = [];
};

const removeRelation = (
    relation: NewsAssignment
) => {
    form.relations = form.relations.filter(
        (item) =>
            item.news_relation_type !==
            relation.news_relation_type ||
            item.relation_id !==
            relation.relation_id
    );
};


defineExpose({
    setFormData,
    handleValidationError,
    ensureLangs,
});
</script>

<style scoped src="@admin/assets/Form.css"></style>

<style scoped src="@admin/dynamic/pages/banners/form/BannerForm.css"></style>
