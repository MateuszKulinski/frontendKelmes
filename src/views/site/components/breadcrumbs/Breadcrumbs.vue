<template>
    <nav v-if="items.length" class="breadcrumbs-wrapper" aria-label="Breadcrumb">
        <div class="content-container breadcrumbs d-flex align-items-center">
            <template v-for="(item, index) in items" :key="`${item.name}-${index}`">
                <router-link v-if="item.url && index < items.length - 1" :to="item.url"
                    class="breadcrumbs-link text-decoration-none">
                    {{ item.name }}
                </router-link>

                <span v-else class="breadcrumbs-current">
                    {{ item.name }}
                </span>

                <span v-if="index < items.length - 1" class="breadcrumbs-separator" aria-hidden="true">
                    /
                </span>
            </template>
        </div>
    </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
    name: string
    url?: string
}

defineProps<{
    items: BreadcrumbItem[]
}>()
</script>

<style scoped>
.breadcrumbs-wrapper {
    margin-bottom: var(--margin-xl);
}

.breadcrumbs {
    font-size: var(--font-size-md-minus);
    gap: var(--gap-ex-sm);
    background-color: var(--border-light);
    padding: var(--padding-sm);
}

.breadcrumbs-link,
.breadcrumbs-current,
.breadcrumbs-separator {
    color: var(--text-primary);
    font-size: var(--font-size-md-minus);
}

.breadcrumbs-link {
    transition: var(--transition-default);
}

.breadcrumbs-link:hover {
    color: var(--accent);
}

@media (max-width: 991px) {
    .breadcrumbs {
        flex-wrap: wrap;
    }
}
</style>