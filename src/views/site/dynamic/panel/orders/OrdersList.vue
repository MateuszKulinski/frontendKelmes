<template>
    <div>
        <OrdersList :isAdmin="false" />
    </div>
</template>

<script setup>
import OrdersList from '@admin/dynamic/pages/orders/list/OrdersList.vue'
</script>