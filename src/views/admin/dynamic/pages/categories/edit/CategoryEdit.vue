<template>
    <h1>
        {{ t("categories.edit") }}
    </h1>
    <BaseButton
        type="button"
        class="mb-3"
        @click="router.push({
            name: 'admin.category.edit.filters',
            params: { id: route.params.id },
        })"
    >
        Edytuj wyświetlane filtry
    </BaseButton>
    <form class="admin-form" @submit.prevent="handleSubmit">
        <div v-if="loading" class="section">
            Ładowanie...
        </div>

        <template v-else>
            <!-- BASIC -->
            <div class="section">
                <h3>
                    {{ t("common.basic") }}
                </h3>

                <div class="user-grid">
                    <div class="form-group floating">
                        <BaseLabel>
                            {{ t("category.name") }}
                        </BaseLabel>

                        <BaseInput v-model="form.name" />
                    </div>

                    <!-- <div class="form-group floating">
                        <BaseLabel>
                            {{ t("category.erp_id_kategoria") }}
                        </BaseLabel>

                        <BaseInput v-model="form.erp_id_kategoria" type="number" disabled />
                    </div> -->

                    <!-- <div class="form-group floating">
                        <BaseLabel>
                            {{ t("category.erp_id_rodzgrupkart") }}
                        </BaseLabel>

                        <BaseInput v-model="form.erp_id_rodzgrupkart" type="number" disabled />
                    </div> -->

                    <!-- <div class="form-group floating">
                        <BaseLabel>
                            {{ t("category.parent_category_id") }}
                        </BaseLabel>

                        <BaseInput v-model="form.parent_category_id" type="number" disabled />
                    </div> -->
                </div>

                <BaseCheckbox v-model="form.is_active">
                    {{ t("common.active") }}
                </BaseCheckbox>

                <!-- <BaseCheckbox v-model="form.has_logo">
                    {{ t("category.has_logo") }}
                </BaseCheckbox> -->
            </div>

            <!-- LANGUAGES -->
            <div class="section full">
                <TranslationFields :items="form.langs" :title="t('categories.langs')" :errors="errors" v-slot="{ item: lang }">
                    <div class="form-group mt-3">
                        <BaseLabel>
                            {{ t("common.description") }}
                        </BaseLabel>

                        <RichTextEditor v-model="lang.description_html" />
                    </div>

                    <div class="form-group mt-3">
                        <BaseLabel>
                            {{ t("categories.description_short") }}
                        </BaseLabel>

                        <RichTextEditor v-model="lang.description_short_html" />
                    </div>

                    <!-- SEO -->
                    <div class="user-grid mt-3">
                        <div class="form-group floating">
                            <BaseLabel>
                                {{ t("cms.slug") }}
                            </BaseLabel>

                            <BaseInput v-model="lang.slug" />
                        </div>

                        <div class="form-group floating">
                            <BaseLabel>
                                {{ t("seo.meta_title") }}
                            </BaseLabel>

                            <BaseInput v-model="lang.meta_title" />
                        </div>

                        <div class="form-group floating">
                            <BaseLabel>
                                {{ t("seo.meta_description") }}
                            </BaseLabel>

                            <BaseInput v-model="lang.meta_description" />
                        </div>

                        <div class="form-group floating">
                            <BaseLabel>
                                {{ t("seo.meta_keywords") }}
                            </BaseLabel>

                            <BaseInput v-model="lang.meta_keywords" />
                        </div>
                    </div>
                </TranslationFields>
            </div>

            <!-- BANNERS -->
            <div class="section full">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3>
                        {{ t("categories.banners") }}
                    </h3>

                    <BaseButton type="button" @click="addBanner">
                        <BaseIcon name="plus" />

                        {{ t("categories.add_banner") }}
                    </BaseButton>
                </div>

                <div v-if="!form.banners.length" class="text-muted">
                    {{ t("categories.no_banners") }}
                </div>

                <div v-for="(banner, bannerIndex) in form.banners" :key="banner.id ?? `new-${bannerIndex}`"
                    class="config-box">
                    <div class="config-header">
                        <strong>
                            {{ banner.id
                                ? `#${banner.id}`
                                : t("category.new_banner")
                            }}
                        </strong>

                        <span class="remove" @click="removeBanner(bannerIndex)">
                            <BaseIcon name="remove" class="me-2" />
                        </span>
                    </div>


                    <div class="user-grid">
                        <div class="form-group">
                            <BaseLabel>
                                {{ t("banner.image") }}
                            </BaseLabel>

                            <BaseImageUpload v-model="banner.image_file" :id="`banner-image-${bannerIndex}`" />
                        </div>

                        <div class="form-group">
                            <BaseLabel>
                                {{ t("banner.mobile_image") }}
                            </BaseLabel>

                            <BaseImageUpload v-model="banner.mobile_image_file"
                                :id="`banner-mobile-image-${bannerIndex}`" />
                        </div>

                        <div class="form-group floating">
                            <BaseLabel>
                                {{ t("banner.link") }}
                            </BaseLabel>

                            <BaseInput v-model="banner.link" />
                        </div>

                        <div class="form-group floating">
                            <BaseLabel>
                                {{ t("banner.start_date") }}
                            </BaseLabel>

                            <BaseInput :model-value="banner.start_date ?? ''"
                                @update:model-value="banner.start_date = String($event)" type="datetime-local" />
                        </div>

                        <div class="form-group floating">
                            <BaseLabel>
                                {{ t("banner.end_date") }}
                            </BaseLabel>

                            <BaseInput :model-value="banner.end_date ?? ''"
                                @update:model-value="banner.end_date = String($event)" type="datetime-local" />
                        </div>
                    </div>

                    <div class="d-flex gap-3 mt-3">
                        <BaseCheckbox v-model="banner.is_active">
                            {{ t("common.active") }}
                        </BaseCheckbox>

                        <BaseCheckbox v-model="banner.target_blank">
                            {{ t("banner.target_blank") }}
                        </BaseCheckbox>
                    </div>

                    <!-- BANNER LANGS -->
                    <div class="mt-4">
                        <TranslationFields :items="banner.langs" :title="t('categories.langs')" :errors="errors" :error-prefix="`banners.${bannerIndex}.langs`"
                            v-slot="{ item: lang }">
                            <div class="user-grid">
                                <div class="form-group floating">
                                    <BaseLabel>
                                        {{ t("banner.title") }}
                                    </BaseLabel>

                                    <BaseInput v-model="lang.title" />
                                </div>

                                <div class="form-group floating">
                                    <BaseLabel>
                                        {{ t("banner.subtitle") }}
                                    </BaseLabel>

                                    <BaseInput v-model="lang.subtitle" />
                                </div>

                                <div class="form-group floating">
                                    <BaseLabel>
                                        {{ t("banner.button_text") }}
                                    </BaseLabel>

                                    <BaseInput v-model="lang.button_text" />
                                </div>
                            </div>

                            <div class="form-group mt-3">
                                <BaseLabel>
                                    {{ t("common.description") }}
                                </BaseLabel>

                                <RichTextEditor v-model="lang.description" />
                            </div>
                        </TranslationFields>
                    </div>
                </div>
            </div>

            <!-- SAVE -->
            <div class="full">
                <BaseButton type="submit" class="submit-btn" :disabled="saving">
                    {{
                        saving
                            ? t("common.saving")
                            : t("common.save")
                    }}
                </BaseButton>
            </div>
        </template>
    </form>
</template>

<script setup lang="ts">
import TranslationFields from '@admin/components/TranslationFields.vue';
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import BaseCheckbox from "@shared/components/BaseCheckbox/BaseCheckbox.vue";
import BaseLabel from "@shared/ui/BaseLabel.vue";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";
import BaseImageUpload from "@shared/ui/BaseImageUpload.vue";

import RichTextEditor from '@shared/ui/RichTextEditor.vue';

import { useCategoryEdit } from "./CategoryEdit";

const route = useRoute();
const router = useRouter();

const { t } = useI18n();

const {
    form,
    errors,

    loading,
    saving,

    fetchCategory,
    submit,

    addBanner,
    removeBanner,

} = useCategoryEdit();

const handleSubmit = async () => {
    try {
        await submit();

        await router.push({
            name: "admin.category",
            params: {
                id: form.value.parent_category_id ?? undefined,
            },
        });
    } catch (error) {
        console.error(
            "Save category failed",
            error,
        );
    }
};

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