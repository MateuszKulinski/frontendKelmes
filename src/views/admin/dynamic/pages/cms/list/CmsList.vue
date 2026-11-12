<template>
    <div class="list-view cms-view">

        <BasePagination
            :page="page"
            :perPage="store.pagination.per_page"
            :total="store.pagination.total"
            :lastPage="store.pagination.last_page"
            :disabled="fetching"
            @change="changePage"
        />

        <div class="table-wrapper">
            <div v-if="fetching && !store.listLoading" class="table-loading">
                {{ t('common.loading') }}
            </div>

            <BaseTable
                :columns="columns"
                :data="store.list"
                :loading="store.listLoading"
                rowKey="id"
                :currentPage="page"
                :perPage="store.pagination.per_page"
                :sortBy="sortBy"
                :sortDir="sortDir"
                @sort="changeSort"
            >
                <!-- STATUS filter -->
                <template #header-is_active>
                    <div class="th-filter" @click.stop>
                        <div class="th-label">{{ t('common.status') }}</div>
                        <BaseSelect
                            v-model="filters.is_active"
                            :options="statusOptions"
                            labelKey="label"
                            valueKey="value"
                            size="sm"
                        />
                    </div>
                </template>

                <!-- Title cell (first lang) -->
                <template #cell-title="{ row }">
                    {{ row.langs?.[0]?.title ?? '—' }}
                </template>

                <!-- Slug cell (first lang) -->
                <template #cell-slug="{ row }">
                    <code>{{ row.langs?.[0]?.slug ?? '—' }}</code>
                </template>

                <!-- Status cell -->
                <template #cell-is_active="{ row }">
                    <span :class="row.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                        {{ row.is_active ? t('common.active') : t('common.inactive') }}
                    </span>
                </template>

                <!-- Actions -->
                <template #cell-actions="{ row }">
                    <div class="actions-td">
                        <BaseButton @click.stop="goToEdit(row)">{{ t('common.edit') }}</BaseButton>
                        <BaseButton variant="secondary" @click.stop="confirmDelete(row)">{{ t('common.delete') }}</BaseButton>
                    </div>
                </template>
            </BaseTable>
        </div>

        <BasePagination
            :page="page"
            :perPage="store.pagination.per_page"
            :total="store.pagination.total"
            :lastPage="store.pagination.last_page"
            :disabled="fetching"
            @change="changePage"
        />
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseTable from '@shared/components/BaseTable/BaseTable.vue';
import BasePagination from '@shared/components/BasePagination/BasePagination.vue';
import BaseButton from '@shared/ui/BaseButton.vue';
import BaseSelect from '@shared/ui/BaseSelect.vue';
import { useUiStore } from '@/core/stores/uiStore';
import { useModalStore } from '@/core/stores/modalStore';
import ConfirmDeleteModal from '@/views/modals/ConfirmDeleteModal.vue';
import { useCmsList } from './CmsList';

const { t } = useI18n();
const router = useRouter();
const ui = useUiStore();
const modal = useModalStore();

const {
    store,
    fetching,
    filters,
    sortBy,
    sortDir,
    page,
    changePage,
    changeSort,
} = useCmsList();

const statusOptions = [
    { label: t('common.all'),      value: '' },
    { label: t('common.active'),   value: '1' },
    { label: t('common.inactive'), value: '0' },
];

const columns = [
    { key: 'id',         label: 'ID',                   sortable: true },
    { key: 'title',      label: t('cms.title'),          sortable: false },
    { key: 'slug',       label: t('cms.slug'),           sortable: false },
    { key: 'is_active',  label: t('common.status'),      sortable: true },
    { key: 'created_at', label: t('common.created_at'),  sortable: true },
    { key: 'actions',    label: '',                       sortable: false },
];

const goToEdit = (row: any) => {
    router.push({ name: 'admin.cms.edit', params: { id: row.id } });
};

const confirmDelete = async (row: any) => {
    modal.openModal(ConfirmDeleteModal, {
        title: t('common.delete'),
        message: t('cms.confirm_delete'),
        itemName: row.langs?.[0]?.title,
        confirmText: t('common.delete'),
        cancelText: t('common.cancel'),
        loadingText: t('common.loading'),
        onConfirm: () => store.remove(row.id),
        onError: (error: unknown) => {
            console.error('Delete CMS page failed', error);
            ui.showError(t('common.error_occurred'));
        },
    });
};
</script>
