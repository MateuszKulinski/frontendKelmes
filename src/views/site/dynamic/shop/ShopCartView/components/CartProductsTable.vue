<template>
    <div class="cart-products-actions d-flex justify-content-end mb-3">
        <div v-if="is_editable && cartStore.items.length" class="cart-products-actions d-flex justify-content-end mb-3">
            <BaseButton variant="o-danger" size="sm" :loading="cartStore.loading" @click="clearCart">
                <BaseIcon name="trashCan" />
                {{ t('cart.clear_cart') }}
            </BaseButton>
        </div>
    </div>
    <div class="table-responsive">
        <div class="cart-products-nav d-flex">
            <div :class="[
                is_editable ? 'col-md-4' : 'col-md-5',
                'justify-content-start'
            ]">
                {{ t('cart.column.product') }}
            </div>

            <div class="col-md-2">
                {{ t('cart.column.price_unit') }}
            </div>

            <div class="col-md-2">
                {{ t('cart.column.quantity') }}
            </div>

            <div class="col-md-2">
                {{ t('cart.column.value') }}
            </div>

            <div class="col-md-1">
                {{ t('cart.column.shipping') }}
            </div>

            <div v-if="is_editable" class="col-md-1"></div>
        </div>

        <template v-for="item in cartStore.items" :key="item.product_id">
            <div class="cart-product-entry">
                <div class="card-products d-flex align-items-center"
                    :class="{ 'product-blocked': item.can_order === false }">
                    <!-- Produkt -->
                    <div class="cart-item-product" :class="[
                        is_editable ? 'col-md-4' : 'col-md-5',
                        'align-items-center'
                    ]">

                        <div class="col-md-4 d-flex align-items-center">
                            <router-link :to="resolve(item.url)" class="cart-img-link">
                                <ProductImage :src="item.image" :alt="item.name ?? ''" />
                            </router-link>
                        </div>

                        <div class="col-md-8 d-flex flex-column">
                            <router-link :to="resolve(item.url)" class="cart-product-name">
                                {{ item.name }}
                            </router-link>

                            <span v-if="item.limit" class="badge text-bg-warning align-self-start">
                                {{ t('cart.limits.badge') }}
                            </span>

                            <div class="cart-product-code">
                                <span>{{ t('cart.column.code') }}: </span>
                                <span>{{ item.catalog_number }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Cena -->
                    <div class="col-md-2 flex-column cart-item-price" :data-label="t('cart.column.price_unit')">
                        <span class="net_price">
                            {{ item.price }}
                        </span>

                        <span>
                            {{ t('cart.net') }}
                        </span>
                    </div>

                    <!-- Ilość -->
                    <div class="col-md-2 quantity flex-column cart-item-quantity" :data-label="t('cart.column.quantity')">
                        <QuantityControl v-if="is_editable" :model-value="item.quantity" class="quantity-controller"
                            @update:model-value="
                            onQuantityChange(
                                item.product_id,
                                $event
                            )
                            " />

                        <span v-else>
                            {{ item.quantity }}
                        </span>
                    </div>

                    <!-- Wartość -->
                    <div class="col-md-2 flex-column total-value cart-item-total" :data-label="t('cart.column.value')">
                        <div class="value">
                            <span class="net_price">
                                {{ item.total_price }}
                            </span>

                            <span>
                                {{ t('cart.net') }}
                            </span>
                        </div>

                        <div class="value">
                            <span class="gross_price">
                                {{ item.total_price_gross }}
                            </span>

                            <span>
                                {{ t('cart.gross') }}
                            </span>
                        </div>
                    </div>

                    <!-- Dostępność / wysyłka -->
                    <Availability :item="item" class="cart-item-availability"
                        :data-label="t('cart.column.shipping')" />

                    <!-- Usuń -->
                    <div v-if="is_editable" class="col-md-1 delete cart-item-delete">
                        <button type="button" class="remove-button" :aria-label="t('cart.remove')"
                            @click="remove(item.product_id)">
                            <BaseIcon name="trashCan" />
                        </button>
                    </div>
                </div>

                <div v-if="is_editable && hasPartialAvailability(item)" class="availability-warning" role="group"
                    :aria-label="t('cart.availability_limited_title')">
                    <BaseIcon name="warring" class="availability-warning__icon" />
                    <div class="availability-warning__content">

                        <div class="availability-warning__title">
                            {{ t('cart.availability_limited_title') }}
                        </div>
                        <p class="availability-warning__message">
                            {{ t('cart.availability_limited_message', {
                                quantity: item.quantity,
                                available: item.stock_quantity,
                                remaining: item.quantity - item.stock_quantity,
                                delivery: availabilityDeliveryMessage(item),
                            }) }}
                        </p>

                        <BaseRadio class="availability-option"
                            :model-value="selectedAvailability[item.product_id] !== 'available'"
                            :name="`availability-${item.product_id}`" :disabled="cartStore.loading"
                            @update:model-value="(selected) => selected && onAvailabilityOptionChange(item, 'all')">
                            {{ t('cart.availability_keep_quantity', {
                                quantity: item.quantity,
                                delivery: availabilityKeepMessage(item),
                            }) }}
                        </BaseRadio>

                        <BaseRadio class="availability-option"
                            :model-value="selectedAvailability[item.product_id] === 'available'"
                            :name="`availability-${item.product_id}`" :disabled="cartStore.loading"
                            @update:model-value="(selected) => selected && onAvailabilityOptionChange(item, 'available')">
                            {{ t('cart.availability_change_quantity', { quantity: item.stock_quantity }) }}
                        </BaseRadio>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCartStore, type CartProduct } from '@/core/stores/cartStore'
import QuantityControl from '@shared/ui/QuantityControl.vue'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import BaseButton from '@/views/shared/ui/BaseButton.vue'
import BaseRadio from '@/views/shared/ui/BaseRadio.vue'
import { useUrlResolver } from '@/composables/useUrlResolver'
import ProductImage from '@/views/site/components/products/ProductImage.vue'
import Availability from './Availability.vue';
import { useGlobalModal } from '@/views/modals/GlobalModal'
import ConfirmDeleteModal from '@/views/modals/ConfirmDeleteModal.vue'

withDefaults(
    defineProps<{
        is_editable?: boolean
    }>(),
    {
        is_editable: true,
    }
)

const { resolve } = useUrlResolver()
const { t } = useI18n()
const cartStore = useCartStore()
const { modal } = useGlobalModal()
const selectedAvailability = ref<Record<number, 'all' | 'available'>>({})

function hasPartialAvailability(item: CartProduct): boolean {
    return item.stock_quantity > 0 && item.stock_quantity < item.quantity
}

function availabilityDeliveryMessage(item: CartProduct): string {
    if (item.is_made_to_order) {
        return t('cart.availability_remaining_made_to_order')
    }

    return item.stock_status
        ? t('cart.availability_remaining_delivery')
        : t('cart.availability_remaining_unavailable')
}

function availabilityKeepMessage(item: CartProduct): string {
    if (item.is_made_to_order) {
        return t('cart.availability_keep_made_to_order')
    }

    return item.stock_status
        ? t('cart.availability_keep_delivery')
        : t('cart.availability_keep_unavailable')
}

async function onAvailabilityOptionChange(
    item: CartProduct,
    option: 'all' | 'available',
) {
    selectedAvailability.value[item.product_id] = option

    if (option === 'all') {
        return
    }

    const updatedCart = await cartStore.updateQuantity(
        item.product_id,
        item.stock_quantity,
    )

    if (updatedCart) {
        delete selectedAvailability.value[item.product_id]
    } else {
        selectedAvailability.value[item.product_id] = 'all'
    }
}

async function onQuantityChange(
    productId: number,
    quantity: number
) {
    await cartStore.updateQuantity(
        productId,
        quantity
    )
}

async function remove(productId: number) {
    await cartStore.removeItem(productId)
}

function clearCart() {
    if (!cartStore.items.length) {
        return
    }

    modal.openModal(ConfirmDeleteModal, {
        title: t('cart.clear_cart'),
        message: t('cart.clear_cart_confirm'),
        confirmText: t('cart.clear_cart'),
        cancelText: t('common.cancel'),
        loadingText: t('cart.clear_cart_loading'),

        onConfirm: async () => {
            await cartStore.clearCart()
        },
    })
}
</script>

<style scoped>
@import './CartProductsTable.css';
</style>
