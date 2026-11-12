<template>
    <BaseTable :columns="columns" :data="props.users" :loading="props.loading" rowKey="id" @row-click="onRowClick">
        <template #cell-unit="{ row }">
            {{ row.unit?.name }}
        </template>

        <template #cell-permission="{ row }">
            {{ row.permission?.display_name }}
        </template>

        <template #cell-status="{ row }">
            {{ row.is_active ? t("common.active") : t("common.inactive") }}
        </template>

        <template v-if="props.showActions" #cell-actions="{ row }">
            <BaseButton type="submit" class="submit-btn" @click.stop="goToEdit(row)">
                {{ t("common.edit") }}
            </BaseButton>
        </template>
    </BaseTable>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseTable from "@shared/components/BaseTable/BaseTable.vue";
import BaseButton from "@shared/ui/BaseButton.vue";

import type { UserListItem } from "@entities/user";

const props = withDefaults(
    defineProps<{
        users: UserListItem[];
        loading?: boolean;
        clickable?: boolean;
        showActions?: boolean;
    }>(),
    {
        loading: false,
        clickable: true,
        showActions: false,
    }
);

const router = useRouter();
const { t } = useI18n();

const onRowClick = (row: Record<string, any>) => {
    if (!props.clickable) return;

    const user = row as UserListItem;

    router.push({
        name: "admin.user",
        params: { id: user.id },
    });
};

const goToEdit = (row: Record<string, any>) => {
    const user = row as UserListItem;

    router.push({
        name: "admin.users.edit",
        params: { id: user.id },
    });
};

const columns = computed(() => {
    const cols: any[] = [
        { key: "lp", label: t("common.no") },
        { key: "name", label: t("user.login") },
        { key: "email", label: t("user.email") },
        { key: "firstname", label: t("user.firstname") },
        { key: "lastname", label: t("user.lastname") },
        { key: "unit", label: t("user.unit") },
        { key: "permission", label: t("user.role") },
        { key: "status", label: t("user.status") },
    ];

    if (props.showActions) {
        cols.push({
            key: "actions",
            label: "",
        });
    }

    return cols;
});
</script>