<template>
    <div class="list-view manufacturer-view">
        <BasePagination :page="page" :perPage="store.pagination.per_page" :total="store.pagination.total"
            :lastPage="store.pagination.last_page" :disabled="fetching" @change="changePage" />

        <div class="table-wrapper">
            <div v-if="fetching && !store.listLoading" class="table-loading">
                {{ t('common.loading') }}
            </div>

            <BaseTable :columns="columns" :data="store.list" :loading="store.listLoading" rowKey="id"
                :currentPage="page" :perPage="store.pagination.per_page" :sortBy="sortBy" :sortDir="sortDir"
                @sort="changeSort">
                <!-- NAME filter -->
                <template #header-name>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t('manufacturer.name') }}
                        </div>

                        <BaseInput v-model="filters.search" :placeholder="t('manufacturer.name')" size="sm" clearable
                            @click.stop />
                    </div>
                </template>

                <!-- STATUS filter -->
                <template #header-is_active>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">
                            {{ t('common.status') }}
                        </div>

                        <BaseSelect v-model="filters.is_active" :options="statusOptions" labelKey="label"
                            valueKey="value" size="sm" />
                    </div>
                </template>

                <!-- Logo cell -->
                <template #cell-logo="{ row }">
                    <img v-if="row.has_logo && row.logo_url" :src="row.logo_url" :alt="row.name"
                        style="max-height: 40px; object-fit: contain;" />

                    <span v-else class="text-muted">
                        —
                    </span>
                </template>

                <!-- Status cell -->
                <template #cell-is_active="{ row }">
                    <span :class="row.is_active
                        ? 'badge bg-success'
                        : 'badge bg-secondary'
                        ">
                        {{
                            row.is_active
                                ? t('common.active')
                                : t('common.inactive')
                        }}
                    </span>
                </template>

                <!-- Display on the public brands page -->
                <template #cell-is_on_page="{ row }">
                    <BaseCheckbox :model-value="row.is_on_page" :disabled="row.updating"
                        @update:model-value="value => updateOnPage(row, value)" />
                </template>

                <!-- Actions -->
                <template #cell-actions="{ row }">
                    <div class="actions-td">
                        <BaseButton @click.stop="goToEdit(row)">
                            {{ t('common.edit') }}
                        </BaseButton>

                        <BaseButton variant="secondary" :disabled="indexingManufacturerIds.has(row.id)"
                            @click.stop="reindexManufacturerFilters(row)">
                            {{ indexingManufacturerIds.has(row.id)
                                ? t("category.indexing.running")
                                : t("category.indexing.manufacturer") }}
                        </BaseButton>

                        <BaseButton variant="secondary" @click.stop="confirmDelete(row)">
                            {{ t('common.delete') }}
                        </BaseButton>
                    </div>
                </template>
            </BaseTable>
        </div>

        <BasePagination :page="page" :perPage="store.pagination.per_page" :total="store.pagination.total"
            :lastPage="store.pagination.last_page" :disabled="fetching" @change="changePage" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import BaseTable from '@shared/components/BaseTable/BaseTable.vue';
import BasePagination from '@shared/components/BasePagination/BasePagination.vue';
import BaseButton from '@shared/ui/BaseButton.vue';
import BaseSelect from '@shared/ui/BaseSelect.vue';
import BaseInput from '@shared/ui/BaseInput.vue';
import BaseCheckbox from '@shared/components/BaseCheckbox/BaseCheckbox.vue';
import { useUiStore } from '@/core/stores/uiStore';
import { useModalStore } from '@/core/stores/modalStore';
import ConfirmDeleteModal from '@/views/modals/ConfirmDeleteModal.vue';
import api from '@/core/api/axios';

import { useManufacturerList } from './ManufacturerList';

const { t } = useI18n();
const router = useRouter();
const ui = useUiStore();
const modal = useModalStore();
const indexingManufacturerIds = ref(new Set<number>());

const {
    store,
    fetching,
    filters,
    sortBy,
    sortDir,
    page,
    changePage,
    changeSort,
} = useManufacturerList();

const statusOptions = [
    {
        label: t('common.all'),
        value: '',
    },
    {
        label: t('common.active'),
        value: '1',
    },
    {
        label: t('common.inactive'),
        value: '0',
    },
];

const columns = [
    {
        key: 'id',
        label: 'ID',
        sortable: true,
    },
    {
        key: 'logo',
        label: t('manufacturer.logo'),
        sortable: false,
    },
    {
        key: 'name',
        label: t('manufacturer.name'),
        sortable: true,
    },
    {
        key: 'website',
        label: t('manufacturer.website'),
        sortable: false,
    },
    {
        key: 'is_active',
        label: t('common.status'),
        sortable: true,
    },
    {
        key: 'is_on_page',
        label: t('manufacturer.displaying'),
        sortable: false,
    },
    {
        key: 'created_at',
        label: t('common.created_at'),
        sortable: true,
    },
    {
        key: 'actions',
        label: '',
        sortable: false,
    },
];

const goToEdit = (row: any) => {
    router.push({
        name: 'admin.manufacturer.edit',
        params: {
            id: row.id,
        },
    });
};

const updateOnPage = async (row: Record<string, unknown>, value: boolean) => {
    if (typeof row.id !== 'number' || typeof row.is_on_page !== 'boolean') {
        console.error('Cannot update manufacturer visibility: invalid row data', row);
        ui.showError(t('common.error_occurred'));
        return;
    }

    const previousValue = row.is_on_page;
    row.is_on_page = value;
    row.updating = true;

    try {
        await store.updateOnPage(row.id, value);
    } catch (error) {
        row.is_on_page = previousValue;
        console.error('Update manufacturer page visibility failed', error);
        ui.showError(t('common.error_occurred'));
    } finally {
        row.updating = false;
    }
};

const confirmDelete = async (row: any) => {
    modal.openModal(ConfirmDeleteModal, {
        title: t('common.delete'),
        message: t('manufacturer.confirm_delete'),
        itemName: row.name,
        confirmText: t('common.delete'),
        cancelText: t('common.cancel'),
        loadingText: t('common.loading'),
        onConfirm: () => store.remove(row.id),
        onError: (error: unknown) => {
            console.error('Delete manufacturer failed', error);
            ui.showError(t('common.error_occurred'));
        },
    });
};

const reindexManufacturerFilters = async (row: Record<string, any>) => {
    const manufacturerId = Number(row.id);
    if (!Number.isInteger(manufacturerId) || manufacturerId <= 0) {
        console.error('Cannot rebuild manufacturer filters: invalid manufacturer ID', row);
        ui.showError(t('common.error_occurred'));
        return;
    }

    indexingManufacturerIds.value = new Set([
        ...indexingManufacturerIds.value,
        manufacturerId,
    ]);

    try {
        await api.post(`/settings/manufacturers/${manufacturerId}/reindex-filters`);
        ui.showSuccess(t('category.indexing.manufacturer_success'));
    } catch (error) {
        console.error('Manufacturer filter index rebuild failed', error);
        ui.showError(t('common.error_occurred'));
    } finally {
        const remaining = new Set(indexingManufacturerIds.value);
        remaining.delete(manufacturerId);
        indexingManufacturerIds.value = remaining;
    }
};
</script>