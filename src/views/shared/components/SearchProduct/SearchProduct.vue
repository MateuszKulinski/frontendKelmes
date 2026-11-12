<!-- shared/components/ProductSearch/ProductSearch.vue -->

<template>

    <div ref="wrapper" class="product-search">

        <div class="form-group floating">

            <BaseLabel>
                {{ label }}
            </BaseLabel>

            <div class="search-controls">
                <div class="search-field">
                    <BaseInput v-model="query" :placeholder="placeholder" autocomplete="off" @focus="openResults"
                        @keyup.enter="submitSearch" />
                    <button type="button" class="search-field-search" :aria-label="t('category.search.submit')"
                        @click="submitSearch">
                        <BaseIcon name="search" />
                    </button>
                </div>
                <slot name="action" />
            </div>

        </div>

        <div v-if="opened && query.trim().length >= minChars" class="results">

            <div v-if="loading" class="result-loading">
                <div class="spinner"></div>
            </div>

            <template v-else>


                <!-- Kategorie -->
                <div v-if="categories.length" class="category-results">
                    <h6 class="search-title">{{ t('categories.title') }}</h6>
                    <template v-for="(cat, index) in categories.slice(0, 3)" :key="`${cat.name}-${index}`">
                        <router-link v-if="cat.url" :to="resolve(cat.url)" class="category-result-item"
                            @click="opened = false">
                            <div class="left-search-line">
                                <BaseIcon name="hamburger" />
                                <span class="category-result-name">
                                    {{ cat.name }}
                                </span>
                            </div>
                            <BaseIcon name="chRight" />
                        </router-link>
                    </template>
                </div>

                <!-- Produkty -->
                <h6 class="search-title">{{ t('common.products') }}</h6>
                <button v-for="product in products" :key="product.id" type="button" class="result-item"
                    @click="select(product)">
                    <div class="top">
                        <ProductImage :src="product.image" :alt="product.name" :type="'extra-small'" />
                        <div class="left-search-line">
                            <div class="title">
                                {{ product.name }}
                            </div>
                            <div class="price">
                                {{ product.price }}
                            </div>
                            <div class="sku">
                                {{ product.catalog_number }}
                            </div>
                        </div>
                    </div>
                </button>

                <div v-if="query.trim().length >= minChars
                    && !products.length
                    && !categories.length" class="result-empty">
                    {{ t("common.no_results") }}
                </div>

            </template>

        </div>

    </div>

</template>

<script setup lang="ts">

import "./SearchProduct.css";

import {
    onBeforeUnmount,
    onMounted,
    ref
} from "vue";

import {
    useI18n
} from "vue-i18n";

import BaseIcon from "@shared/ui/BaseIcon.vue";
import BaseInput from "@shared/ui/BaseInput.vue";
import ProductImage from "@/views/site/components/products/ProductImage.vue";
import BaseLabel from "@shared/ui/BaseLabel.vue";

import {
    useProductSearch
    // type ProductSearchItem
} from "./SearchProduct";

import type { ProductSearchItem } from
    "@/composables/types/productSearch";

import {
    useUrlResolver,
    // type UrlObject,
} from "@/composables/useUrlResolver";

const { resolve } = useUrlResolver();

// I18N

const { t } = useI18n();

// PROPS

const props = withDefaults(

    defineProps<{

        label?: string;

        placeholder?: string;

        minChars?: number;

        onSelect: (
            product: ProductSearchItem
        ) => void;

    }>(),

    {
        label: "Produkt",
        placeholder: "Szukaj produktu...",
        minChars: 3
    }
);

// SEARCH

const {
    query,
    products,
    categories,
    loading,
    opened,
    clear
} = useProductSearch(
    props.minChars
);

const openResults = () => {
    if (query.value.trim().length >= props.minChars) {
        opened.value = true;
    }
};

defineExpose({
    getQuery: () => query.value,
    clear,
});

// FULL SEARCH

const submitSearch = () => {

    const search = query.value.trim();

    if (
        search.length <
        props.minChars
    ) {
        return;
    }

    opened.value = false;

    window.location.href =
        `/search?q=${encodeURIComponent(search)}`;
};

// SELECT

const select = (
    product: ProductSearchItem
) => {

    props.onSelect(product);

    clear();
};

// OUTSIDE CLICK

const wrapper = ref<HTMLElement | null>(
    null
);

const handleClickOutside = (
    e: MouseEvent
) => {

    if (
        wrapper.value
        &&
        !wrapper.value.contains(
            e.target as Node
        )
    ) {

        opened.value = false;
    }
};

onMounted(() => {

    document.addEventListener(
        "click",
        handleClickOutside
    );
});

onBeforeUnmount(() => {

    document.removeEventListener(
        "click",
        handleClickOutside
    );
});

</script>