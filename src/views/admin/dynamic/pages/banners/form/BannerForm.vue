<template>
    <form class="admin-form" @submit.prevent="submit" enctype="multipart/form-data">
        <div class="section">
            <h3>{{ t('common.basic') }}</h3>

            <div class="user-grid">
                <div class="form-group floating">
                    <BaseLabel>
                        {{ t('banner.link') }}
                    </BaseLabel>

                    <BaseInput v-model="form.link" placeholder="https://..." />

                    <div v-if="errors.link" class="error">
                        {{ errors.link }}
                    </div>
                </div>
            </div>

            <div class="d-flex gap-4 mt-2">
                <BaseCheckbox v-model="form.target_blank">
                    {{ t('banner.target_blank') }}
                </BaseCheckbox>

                <BaseCheckbox v-model="form.is_active">
                    {{ t('common.active') }}
                </BaseCheckbox>

                <BaseCheckbox v-model="form.is_home">
                    {{ t('banner.is_home') }}
                </BaseCheckbox>
            </div>

            <div class="user-grid mt-3">
                <div class="form-group floating">
                    <BaseLabel>
                        {{ t('banner.start_date') }}
                    </BaseLabel>

                    <BaseInput type="date" v-model="form.start_date" />
                </div>

                <div class="form-group floating">
                    <BaseLabel>
                        {{ t('banner.end_date') }}
                    </BaseLabel>

                    <BaseInput type="date" v-model="form.end_date" />

                    <div v-if="errors.end_date" class="error">
                        {{ errors.end_date }}
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>{{ t('banner.images') }}</h3>

            <div class="user-grid">
                <div class="form-group">
                    <BaseLabel>
                        {{ t('banner.image') }}
                    </BaseLabel>

                    <input type="file" accept="image/*" class="form-control" @change="onImageChange" />

                    <div v-if="errors.image" class="error">
                        {{ errors.image }}
                    </div>

                    <img v-if="imagePreview" :src="imagePreview" class="img-preview mt-2" alt="preview" />
                </div>

                <div class="form-group">
                    <BaseLabel>
                        {{ t('banner.mobile_image') }}
                    </BaseLabel>

                    <input type="file" accept="image/*" class="form-control" @change="onMobileImageChange" />

                    <div v-if="errors.mobile_image" class="error">
                        {{ errors.mobile_image }}
                    </div>

                    <img v-if="mobileImagePreview" :src="mobileImagePreview" class="img-preview mt-2"
                        alt="mobile preview" />
                </div>
            </div>
        </div>

        <div class="section full">
            <TranslationFields :items="form.langs" :errors="errors" v-slot="{ item: lang }">
                <div class="user-grid">
                    <div class="form-group floating">
                        <BaseLabel>
                            {{ t('banner.title') }}
                        </BaseLabel>

                        <BaseInput v-model="lang.title" />
                    </div>

                    <div class="form-group floating">
                        <BaseLabel>
                            {{ t('banner.subtitle') }}
                        </BaseLabel>

                        <BaseInput v-model="lang.subtitle" />
                    </div>
                </div>

                <div class="user-grid mt-2">
                    <div class="form-group floating">
                        <BaseLabel>
                            {{ t('banner.button_text') }}
                        </BaseLabel>

                        <BaseInput v-model="lang.button_text" />
                    </div>
                </div>

                <div class="form-group floating mt-2">
                    <BaseLabel>
                        {{ t('common.description') }}
                    </BaseLabel>

                    <textarea v-model="lang.description" class="form-control" rows="3" />
                </div>
            </TranslationFields>
        </div>

        <div class="section">
            <h3>{{ t('banner.assignments') }}</h3>

            <!-- Categories -->
            <div class="assignment-group">
                <BaseLabel>
                    {{ t('banner.categories') }}
                </BaseLabel>

                <div class="search-wrapper">
                    <BaseInput v-model="categorySearch" :placeholder="t('banner.search_category')
                        " @input="searchCategories" />

                    <div v-if="categorySearchLoading" class="search-loading">
                        {{ t('common.loading') }}
                    </div>

                    <div v-else-if="
                        categoryOptions.length
                    " class="search-options">
                        <button v-for="category in categoryOptions" :key="category.id" type="button"
                            class="search-option" @click="
                                addCategory(category)
                                ">
                            {{ category.name }}
                        </button>
                    </div>
                </div>

                <div class="tags mt-2">
                    <span v-for="category in selectedCategories" :key="category.id" class="tag">
                        {{ category.name }}

                        <button type="button" @click="
                            removeCategory(
                                category.id,
                            )
                            ">
                            ×
                        </button>
                    </span>
                </div>
            </div>

            <!-- CMS -->
            <div class="assignment-group mt-3">
                <BaseLabel>
                    {{ t('banner.cms_pages') }}
                </BaseLabel>

                <div class="search-wrapper">
                    <BaseInput v-model="cmsSearch" :placeholder="t('banner.search_cms')
                        " @input="searchCms" />

                    <div v-if="cmsSearchLoading" class="search-loading">
                        {{ t('common.loading') }}
                    </div>

                    <div v-else-if="cmsOptions.length" class="search-options">
                        <button v-for="cms in cmsOptions" :key="cms.id" type="button" class="search-option"
                            @click="addCms(cms)">
                            {{ cms.name }}
                        </button>
                    </div>
                </div>

                <div class="tags mt-2">
                    <span v-for="cms in selectedCms" :key="cms.id" class="tag">
                        {{ cms.name }}

                        <button type="button" @click="
                            removeCms(cms.id)
                            ">
                            ×
                        </button>
                    </span>
                </div>
            </div>

            <!-- Products -->
            <div class="assignment-group mt-3">
                <BaseLabel>
                    {{ t('banner.products') }}
                </BaseLabel>

                <div class="search-wrapper">
                    <BaseInput v-model="productSearch" :placeholder="t('banner.search_product')
                        " @input="searchProducts" />

                    <div v-if="productSearchLoading" class="search-loading">
                        {{ t('common.loading') }}
                    </div>

                    <div v-else-if="productOptions.length" class="search-options">
                        <button v-for="product in productOptions" :key="product.id" type="button" class="search-option"
                            @click="
                                addProduct(product)
                                ">
                            <span>
                                {{ product.name }}
                            </span>

                            <span v-if="product.sku" class="search-option-secondary">
                                [{{ product.sku }}]
                            </span>
                        </button>
                    </div>
                </div>

                <div class="tags mt-2">
                    <span v-for="product in selectedProducts" :key="product.id" class="tag">
                        {{ product.name }}

                        <span v-if="product.sku" class="tag-secondary">
                            [{{ product.sku }}]
                        </span>

                        <button type="button" @click="
                            removeProduct(
                                product.id,
                            )
                            ">
                            ×
                        </button>
                    </span>
                </div>
            </div>
        </div>

        <div class="full">
            <BaseButton type="submit" class="submit-btn">
                {{
                    props.isEdit
                        ? t('banner.save')
                        : t('banner.create')
                }}
            </BaseButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import TranslationFields from '@admin/components/TranslationFields.vue';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import BaseInput from '@shared/ui/BaseInput.vue';
import BaseButton from '@shared/ui/BaseButton.vue';
import BaseCheckbox from '@shared/components/BaseCheckbox/BaseCheckbox.vue';
import BaseLabel from '@shared/ui/BaseLabel.vue';

import { useLangStore } from '@/core/stores/langStore';
import { useBannerForm } from './BannerForm';

import './BannerForm.css';

const emit = defineEmits(['submit']);

const props = defineProps<{
    isEdit?: boolean;
}>();

const { t } = useI18n();

const langStore = useLangStore();

const {
    form,
    errors,

    imagePreview,
    mobileImagePreview,
    onImageChange,
    onMobileImageChange,

    ensureLangs,
    setFormData,
    handleValidationError,
    submit,

    // Categories
    categorySearch,
    categoryOptions,
    selectedCategories,
    categorySearchLoading,
    searchCategories,
    addCategory,
    removeCategory,

    // CMS
    cmsSearch,
    cmsOptions,
    selectedCms,
    cmsSearchLoading,
    searchCms,
    addCms,
    removeCms,

    // Products
    productSearch,
    productOptions,
    selectedProducts,
    productSearchLoading,
    searchProducts,
    addProduct,
    removeProduct,
} = useBannerForm(emit);

onMounted(async () => {
    if (!langStore.langs.length) {
        await langStore.fetchLangs();
    }

    ensureLangs();
});

defineExpose({
    setFormData,
    handleValidationError,
});
</script>