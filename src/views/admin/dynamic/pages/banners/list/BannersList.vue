<template>
    <div class="list-view banners-view">

        <BasePagination
            :page="pagination.page"
            :perPage="pagination.per_page"
            :total="pagination.total"
            :lastPage="pagination.last_page"
            :disabled="fetching"
            @change="changePage"
        />

        <div class="table-wrapper">

            <div v-if="fetching && !loading" class="table-loading">
                {{ t('common.loading') }}
            </div>

            <BaseTable
                :columns="columns"
                :data="banners"
                :loading="loading"
                rowKey="id"
                :currentPage="pagination.page"
                :perPage="pagination.per_page"
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

                <!-- Image cell -->
                <template #cell-image="{ row }">
                    <img
                        v-if="row.image"
                        :src="row.image"
                        alt="banner"
                        class="banner-thumb"
                    />
                    <span v-else class="text-muted">—</span>
                </template>

                <!-- Status cell -->
                <template #cell-is_active="{ row }">
                    <span :class="row.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                        {{ row.is_active ? t('common.active') : t('common.inactive') }}
                    </span>
                </template>

                <template #cell-is_home="{ row }">
                    <span v-if="row.is_home" class="badge bg-primary">{{ t('banner.is_home') }}</span>
                    <span v-else class="text-muted">—</span>
                </template>

                <!-- Dates -->
                <template #cell-start_date="{ row }">{{ row.start_date ?? '—' }}</template>
                <template #cell-end_date="{ row }">{{ row.end_date ?? '—' }}</template>

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
            :page="pagination.page"
            :perPage="pagination.per_page"
            :total="pagination.total"
            :lastPage="pagination.last_page"
            :disabled="fetching"
            @change="changePage"
        />

    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '@/core/api/axios';
import BaseTable from '@shared/components/BaseTable/BaseTable.vue';
import BasePagination from '@shared/components/BasePagination/BasePagination.vue';
import BaseButton from '@shared/ui/BaseButton.vue';
import BaseSelect from '@shared/ui/BaseSelect.vue';
import { useUiStore } from '@/core/stores/uiStore';
import { useModalStore } from '@/core/stores/modalStore';
import ConfirmDeleteModal from '@/views/modals/ConfirmDeleteModal.vue';
import { useBannersList } from './BannersList';

const { t } = useI18n();
const router = useRouter();
const ui = useUiStore();
const modal = useModalStore();

const {
    banners,
    loading,
    fetching,
    filters,
    sortBy,
    sortDir,
    pagination,
    fetchBanners,
    changePage,
    changeSort,
} = useBannersList();

const statusOptions = [
    { label: t('common.all'),      value: '' },
    { label: t('common.active'),   value: '1' },
    { label: t('common.inactive'), value: '0' },
];

const columns = [
    { key: 'id',         label: 'ID',              sortable: true },
    { key: 'image',      label: t('banner.image'),  sortable: false },
    { key: 'link',       label: t('banner.link'),   sortable: false },
    { key: 'is_active',  label: t('common.status'), sortable: true },
    { key: 'is_home',    label: t('banner.is_home'), sortable: false },
    { key: 'start_date', label: t('banner.start_date'), sortable: true },
    { key: 'end_date',   label: t('banner.end_date'),   sortable: true },
    { key: 'created_at', label: t('common.created_at'), sortable: true },
    { key: 'actions',    label: '',                 sortable: false },
];

const goToEdit = (row: any) => {
    router.push({ name: 'admin.banner.edit', params: { id: row.id } });
};

const confirmDelete = async (row: any) => {
    modal.openModal(ConfirmDeleteModal, {
        title: t('common.delete'),
        message: t('banner.confirm_delete'),
        itemName: row.id ? `#${row.id}` : undefined,
        confirmText: t('common.delete'),
        cancelText: t('common.cancel'),
        loadingText: t('common.loading'),
        onConfirm: async () => {
            await api.delete(`/settings/banners/${row.id}`);
            await fetchBanners();
        },
        onError: (error: unknown) => {
            console.error('Delete banner failed', error);
            ui.showError(t('common.error'));
        },
    });
};
</script>

<style scoped>
.banner-thumb {
    width: 80px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
}
</style>
