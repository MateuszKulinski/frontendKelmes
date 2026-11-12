<template>
    <div>
        <CartList :isAdmin="false" />
    </div>
</template>

<script setup>
import CartList from '@admin/dynamic/pages/carts/list/CartsList.vue'
</script>