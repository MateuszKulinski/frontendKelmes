<template>
    <div class="shop-carts-view">

        <div class="shop-carts-header">
            <h1 class="shop-carts-title">
                {{ t('cart.my_carts.title') }}
            </h1>

            <BaseButton class="pointer" @click="showNewForm = !showNewForm">
                <BaseIcon name="cart" />
                {{ t('cart.my_carts.new_cart') }}
            </BaseButton>
        </div>

        <!-- Nowy koszyk -->
        <div v-if="showNewForm" class="new-cart-form">
            <input ref="newNameInput" v-model="newCartName" class="cart-name-input"
                :placeholder="t('cart.my_carts.create_placeholder')" maxlength="255" @keyup.enter="createCart"
                @keyup.esc="cancelCreate" />

            <BaseButton class="pointer" :disabled="creating" @click="createCart">
                {{ t('cart.my_carts.create_btn') }}
            </BaseButton>

            <BaseButton class="pointer" @click="cancelCreate">
                {{ t('cart.my_carts.cancel_btn') }}
            </BaseButton>
        </div>

        <!-- Ładowanie -->
        <div v-if="cartStore.cartsLoading" class="carts-loading">
            {{ t('cart.loading') }}
        </div>

        <!-- Pusta lista -->
        <div v-else-if="cartStore.carts?.length === 0" class="carts-empty">
            {{ t('cart.my_carts.empty') }}
        </div>

        <!-- Lista -->
        <div v-else class="carts-grid">
            <div v-for="cart in cartStore.carts" :key="cart.id" class="cart-card" :class="{
                'cart-card--active':
                    cartStore.cartId === cart.id
            }">

                <!-- Nazwa -->
                <div class="cart-card-name-row">

                    <template v-if="editingId === cart.id">

                        <input v-model="editName" class="cart-name-input cart-name-input--inline" maxlength="255"
                            @keyup.enter="saveRename(cart.id)" @keyup.esc="cancelRename" />

                        <BaseButton class="pointer" @click="saveRename(cart.id)">
                            {{ t('cart.my_carts.save_btn') }}
                        </BaseButton>

                        <BaseButton class="pointer" @click="cancelRename">
                            {{ t('cart.my_carts.cancel_btn') }}
                        </BaseButton>

                    </template>

                    <template v-else>

                        <span class="cart-card-name">
                            {{ cart.name || t('cart.my_carts.default_name') }}
                            #{{ cart.id }}
                        </span>

                        <BaseButton class="pointer" :title="t('cart.my_carts.rename_btn')" @click="startRename(cart)">
                            <BaseIcon name="edit" />
                        </BaseButton>

                    </template>

                </div>

                <!-- Szczegóły -->
                <div class="cart-card-details">

                    <span class="cart-card-detail">
                        <strong>{{ cart.items_count }}</strong>
                        {{ t('cart.my_carts.items') }}
                    </span>

                    <span v-if="cart.summary" class="cart-card-detail">
                        {{ cart.summary.net_total }}
                        {{ t('cart.net') }}
                    </span>

                    <span class="cart-card-detail cart-card-date">
                        {{ cart.created_at }}
                    </span>

                </div>

                <!-- Akcje -->
                <div class="cart-card-actions">

                    <BaseButton class="pointer" @click="openCart(cart.id)">
                        {{ t('cart.my_carts.open_btn') }}
                    </BaseButton>

                    <BaseButton class="pointer btn-danger" @click="removeCart(cart.id)">
                        {{ t('cart.my_carts.delete_btn') }}
                    </BaseButton>

                </div>

            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useCartStore, type Cart } from '@/core/stores/cartStore'

import BaseButton from '@/views/shared/ui/BaseButton.vue'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'

const { t } = useI18n()
const router = useRouter()
const cartStore = useCartStore()

const showNewForm = ref(false)
const newCartName = ref('')
const creating = ref(false)

const editingId = ref<number | null>(null)
const editName = ref('')

async function createCart() {
    creating.value = true

    try {
        await cartStore.createCart(
            newCartName.value.trim() || undefined
        )

        newCartName.value = ''
        showNewForm.value = false
    } finally {
        creating.value = false
    }
}

function cancelCreate() {
    showNewForm.value = false
    newCartName.value = ''
}

function startRename(cart: Cart) {
    editingId.value = cart.id
    editName.value = cart.name ?? ''
}

async function saveRename(cartId: number) {
    await cartStore.renameCart(
        cartId,
        editName.value.trim()
    )

    cancelRename()
}

function cancelRename() {
    editingId.value = null
    editName.value = ''
}

async function openCart(cartId: number) {
    const cart = await cartStore.selectCart(cartId)

    if (!cart) {
        return
    }

    await router.push({
        name: 'shopCart',
    })
}


async function removeCart(cartId: number) {
    if (!confirm(t('cart.my_carts.delete_confirm'))) {
        return
    }

    await cartStore.deleteCart(cartId)
}


onMounted(() => {
    cartStore.fetchCarts()
})
</script>

<style scoped>
@import './ShopCartsView.css';
</style>