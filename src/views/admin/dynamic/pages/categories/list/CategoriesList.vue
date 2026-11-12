<template>
    <div class="list-view categories-view">
        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />

        <ActiveFilters :filters="activeFilters" @remove="clearSingleFilter" @removeAll="resetFilters" />

        <div class="table-wrapper">
            <div v-if="fetching && !loading" class="table-loading">
                {{ t("common.loading") }}
            </div>

            <BaseTable :columns="columns" :data="categories" :loading="loading" rowKey="id"
                :currentPage="pagination.page" :perPage="pagination.per_page" :sortBy="sortBy" :sortDir="sortDir"
                @sort="handleSort">
                <!-- NAME -->
                <template #header-name>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("categories.name") }}
                        </div>

                        <BaseInput v-model="filters.name" size="sm" />
                    </div>
                </template>

                <!-- ERP ID -->
                <template #header-erp_id_kategoria>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("category.erp_id_kategoria") }}
                        </div>

                        <BaseInput v-model="filters.erp_id_kategoria" size="sm" />
                    </div>
                </template>

                <!-- TYPE -->
                <template #header-erp_id_rodzgrupkart>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("category.erp_id_rodzgrupkart") }}
                        </div>

                        <BaseInput v-model="filters.erp_id_rodzgrupkart" type="number" step="1" size="sm" />
                    </div>
                </template>

                <!-- STATUS -->
                <template #header-is_active>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("common.is_active") }}
                        </div>

                        <BaseSelect v-model="filters.is_active" :options="statusOptions" labelKey="label"
                            valueKey="value" size="sm" />
                    </div>
                </template>

                <!-- HAS LOGO -->
                <template #header-has_logo>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t("categories.has_logo") }}
                        </div>

                        <BaseSelect v-model="filters.has_logo" :options="booleanOptions" labelKey="label"
                            valueKey="value" size="sm" />
                    </div>
                </template>

                <!-- ACTIVE -->
                <template #cell-is_active="{ row }">
                    {{
                        row.is_active
                            ? t("common.active")
                            : t("common.inactive")
                    }}
                </template>

                <!-- HAS LOGO -->
                <template #cell-has_logo="{ row }">
                    {{
                        row.has_logo
                            ? t("common.yes")
                            : t("common.no")
                    }}
                </template>

                <!-- ACTIONS -->
                <template #cell-actions="{ row }">
                    <div class="actions-td">
                        <BaseButton type="submit" class="submit-btn" @click.stop="goToEdit(row)">
                            {{ t("common.edit") }}
                        </BaseButton>

                        <BaseButton v-if="row.has_children" type="submit" variant="secondary"
                            @click.stop="goToView(row)">
                            {{ t("common.preview") }}
                        </BaseButton>
                        <BaseButton variant="secondary" :disabled="indexingCategoryIds.has(row.id)"
                            @click.stop="reindexCategoryFilters(row)">
                            {{ indexingCategoryIds.has(row.id)
                                ? t("category.indexing.running")
                                : t("category.indexing.category") }}
                        </BaseButton>
                    </div>
                </template>
            </BaseTable>
        </div>

        <BasePagination :page="pagination.page" :perPage="pagination.per_page" :total="pagination.total"
            :lastPage="pagination.last_page" :disabled="fetching" @change="goToPage" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseInput from "@shared/ui/BaseInput.vue";
import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BasePagination from "@shared/components/BasePagination/BasePagination.vue";
import ActiveFilters from "@shared/components/ActiveFilters/ActiveFilters.vue";
import BaseSelect from "@shared/ui/BaseSelect.vue";
import BaseButton from "@shared/ui/BaseButton.vue";
import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";

import { useLangStore } from "@/core/stores/langStore";

import {
    useCategoriesList,
} from "./CategoriesList";

import type {
    CategoryItem,
} from "@/composables/types/category";

const router = useRouter();
const langStore = useLangStore();

const { t } = useI18n();
const ui = useUiStore();
const indexingCategoryIds = ref(new Set<number>());

const {
    categories,
    loading,
    fetching,
    pagination,
    filters,
    goToPage,
    sortBy,
    sortDir,
    handleSort,
    resetFilters,
    activeFilters,
    clearSingleFilter,
    fetchCategories,
} = useCategoriesList();

/**
 * Zmiana języka.
 */
watch(
    () => langStore.current,
    async () => {
        await fetchCategories();
    }
);

/**
 * Opcje statusu.
 */
const statusOptions = computed(() => [
    {
        value: 1,
        label: t("common.active"),
    },
    {
        value: 0,
        label: t("common.inactive"),
    },
]);

/**
 * Opcje boolean.
 */
const booleanOptions = computed(() => [
    {
        value: 1,
        label: t("common.yes"),
    },
    {
        value: 0,
        label: t("common.no"),
    },
]);

/**
 * Kolumny tabeli.
 *
 * ID zostało usunięte.
 * LP jest generowane automatycznie przez BaseTable.
 */
const columns = computed(() => [
    {
        key: "lp",
        label: "LP",
        sortable: false,
    },
    {
        key: "name",
        label: t("categories.name"),
        sortable: true,
    },
    {
        key: "erp_id_kategoria",
        label: t("category.erp_id_kategoria"),
        sortable: true,
    },
    {
        key: "erp_id_rodzgrupkart",
        label: t("category.erp_id_rodzgrupkart"),
        sortable: true,
    },
    {
        key: "is_active",
        label: t("common.is_active"),
        sortable: true,
    },
    {
        key: "has_logo",
        label: t("categories.has_logo"),
        sortable: true,
    },
    {
        key: "created_at",
        label: t("common.created_at"),
        sortable: true,
    },
    {
        key: "actions",
        label: "",
        sortable: false,
    },
]);

/**
 * Edycja kategorii.
 *
 * Tutaj zostaje normalny route z ID.
 */
const goToEdit = (
    row: Record<string, any>
) => {
    const category = row as CategoryItem;

    router.push({
        name: "admin.category.edit",
        params: {
            id: category.id,
        },
    });
};

/**
 * Podgląd kategorii.
 *
 * Nie przechodzimy do:
 *
 * admin.category
 *
 * tylko zostajemy w:
 *
 * admin.categories
 *
 * i zmieniamy parent_id.
 *
 * Przykład:
 *
 * /admin/categories
 *
 * klik na kategorię ID 15:
 *
 * /admin/categories?parent_id=15
 *
 * klik na kategorię ID 27:
 *
 * /admin/categories?parent_id=27
 */
const goToView = (
    row: Record<string, any>
) => {
    const category = row as CategoryItem;

    router.push({
        name: "admin.categories",
        query: {
            parent_id: category.id,
        },
    });
};

const reindexCategoryFilters = async (row: Record<string, any>) => {
    const categoryId = Number(row.id);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        console.error("Cannot rebuild category filters: invalid category ID", row);
        ui.showError(t("common.error_occurred"));
        return;
    }

    indexingCategoryIds.value = new Set([...indexingCategoryIds.value, categoryId]);
    try {
        await api.post(`/settings/categories/${categoryId}/reindex-filters`);
        ui.showSuccess(t("category.indexing.category_success"));
    } catch (error) {
        console.error("Category filter index rebuild failed", error);
        ui.showError(t("common.error_occurred"));
    } finally {
        const remaining = new Set(indexingCategoryIds.value);
        remaining.delete(categoryId);
        indexingCategoryIds.value = remaining;
    }
};
</script>