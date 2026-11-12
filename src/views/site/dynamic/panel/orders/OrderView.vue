<template>
    <div>
        <CartView :approval-mode="approvalMode" />
    </div>
</template>

<script setup lang="ts">
import CartView from '@admin/dynamic/pages/orders/view/OrderView.vue'

withDefaults(defineProps<{
    approvalMode?: boolean
}>(), {
    approvalMode: false,
})
</script>