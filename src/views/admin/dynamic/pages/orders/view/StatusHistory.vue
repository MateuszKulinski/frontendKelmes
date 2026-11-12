<template>
    <div>
        <div v-if="items?.length">
            <div v-for="item in items" :key="item.id"
                class="d-flex justify-content-between align-items-center border-bottom py-2">
                <span class="badge" :style="{
                    background: item.status?.background || undefined,
                    color: item.status?.color || undefined
                }">
                    {{ item.status?.name }}
                </span>

                <small class="text-muted">
                    {{ item.created_at }}
                </small>
            </div>
        </div>

        <div v-else class="text-muted">
            {{ emptyText }}
        </div>
    </div>
</template>

<script setup lang="ts">
interface StatusItem {
    id: number;
    created_at: string;
    status: {
        id: number;
        name: string;
        color: string;
        background: string;
    };
}

defineProps<{
    items: StatusItem[] | null | undefined;
    emptyText?: string;
}>();
</script>