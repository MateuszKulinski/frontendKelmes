<template>
    <div class="cart-step-products">
        <div v-if="cartStore.loading" class="text-center text-muted">
            {{ t('cart.loading') }}
        </div>

        <div v-else-if="cartStore.error" class="alert alert-danger">
            {{ cartStore.error }}
        </div>

        <template v-else>

            <div v-if="cartStore.isEmpty" class="text-center text-muted py-5">
                {{ t('cart.empty') }}
            </div>
            <template v-else>
                <div v-if="cartStore.cart?.limits.length" class="table-responsive cart-limits-table mb-4">
                    <table class="table table-sm align-middle mb-0">
                        <thead>
                            <tr>
                                <th>{{ t('cart.limits.name') }}</th>
                                <th>{{ t('cart.limits.quantity') }}</th>
                                <th>{{ t('cart.limits.amount') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="limit in cartStore.cart.limits" :key="limit.id">
                                <th scope="row">
                                    {{ limit.name }}
                                    <small v-if="limit.is_exceeded" class="d-block text-danger">
                                        {{ limit.blocks_checkout
                                            ? t('cart.limits.checkout_blocked_short')
                                            : t('cart.limits.approval_required') }}
                                    </small>
                                </th>
                                <td>
                                    <template v-if="[1, 3, 4].includes(limit.limit_type)">
                                        {{ limit.used_quantity_formatted }}
                                        /
                                        {{ limit.quantity_limit_formatted }}
                                    </template>
                                    <span v-else>—</span>
                                </td>
                                <td>
                                    <template v-if="[2, 3, 4].includes(limit.limit_type)">
                                        {{ limit.used_amount_formatted }}
                                        /
                                        {{ limit.price_limit_formatted }}
                                    </template>
                                    <span v-else>—</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <CartProductsTable :is_editable="true" />
            </template>

            <CartFileTools />

            <!-- Akcje -->
            <div class="cart-actions d-flex justify-content-between">

                <div class="col-md-3 d-flex justify-content-start align-items-center action" @click="print">
                    <BaseIcon name="printer" />

                    {{ t('cart.cart_print') }}
                </div>

            </div>

            <!-- Nawigacja -->
            <div class="cart-actions col-md-12 d-flex justify-content-between">

                <div class="col-md-3">

                    <router-link to="/">
                        <BaseButton variant="secondary" size="lg" class="shop">
                            <BaseIcon name="chLeft" />

                            {{ t('cart.continue_shopping') }}
                        </BaseButton>
                    </router-link>

                </div>

                <div class="col-md-3">

                    <BaseButton variant="primary" size="lg" class="shop"
                        :disabled="cartStore.isEmpty || hasBlockedProducts" @click="emit('next')">
                        {{ t('cart.steps.next') }}:
                        {{ t('cart.steps.address') }}
                    </BaseButton>

                </div>

            </div>

        </template>

    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/core/stores/cartStore'

import CartProductsTable from './components/CartProductsTable.vue'
import CartFileTools from './CartFileTools.vue'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import BaseButton from '@/views/shared/ui/BaseButton.vue'


const emit = defineEmits<{
    next: []
}>()

const { t } = useI18n()
const cartStore = useCartStore()

function print() {
    window.print()
}

const hasBlockedProducts = computed(() =>
    cartStore.items.some(item => item.can_order === false)
)

</script>

<style scoped>
@import './CartStep1Style.css';
</style>
