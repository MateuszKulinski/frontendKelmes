<template>
  <div class="main-panel">
    <header class="main-panel__welcome">
      <div>
        <h1>{{ t('panelDashboard.welcome', { name: auth.firstname || t('panelDashboard.customer') }) }} <span
            aria-hidden="true"></span></h1>
        <p>{{ t('panelDashboard.summary_for') }} <strong>{{ auth.currentUnitName || '—' }}</strong></p>
      </div>
      <button v-if="auth.canSwitchUnit" class="main-panel__unit" type="button"
        @click="modal.openModal(SwitchUnitModal)">
        {{ auth.currentUnitName }}
        <BaseIcon name="chDown" />
      </button>
      <span v-else-if="auth.currentUnitName" class="main-panel__unit">{{ auth.currentUnitName }}</span>
    </header>

    <div v-if="loadError" class="main-panel__error" role="alert">
      {{ t('panelDashboard.load_error') }}
      <button type="button" @click="fetchDashboard">{{ t('panelDashboard.retry') }}</button>
    </div>

    <div class="main-panel__top-cards" :class="{ 'main-panel__top-cards--restricted': !auth.hasAbility('orders') }">
      <article v-if="auth.hasAbility('orders')" class="dashboard-card dashboard-card--latest">
        <h2>{{ t('panelDashboard.latest_order') }}</h2>
        <template v-if="latestOrder">
          <p class="dashboard-card__eyebrow">{{ latestOrder.created_at }}</p>
          <div class="latest-order">
            <span class="latest-order__icon">
              <BaseIcon name="order" />
            </span>
            <div>
              <strong>{{ latestOrder.number || '#' + latestOrder.id }}</strong>
              <span>{{ latestOrder.status || t('panelDashboard.status_unknown') }}</span>
              <b>{{ latestOrder.price }} {{ t('panelDashboard.net') }}</b>
            </div>
          </div>
          <router-link class="dashboard-card__footer-link"
            :to="{ name: 'panel.order', params: { id: latestOrder.id } }">
            {{ t('panelDashboard.view_details') }}
          </router-link>
        </template>
        <p v-else class="dashboard-card__empty">{{ loading ? t('common.loading') : t('panelDashboard.no_orders') }}</p>
      </article>

      <article v-if="auth.hasAbility('orders')" class="dashboard-card dashboard-card--count">
        <h2>{{ t('panelDashboard.orders_count') }}</h2>
        <p class="dashboard-card__eyebrow">{{ t('panelDashboard.in_last_year') }}</p>
        <div class="dashboard-card__metric">{{ dashboard?.orders_last_year ?? '—' }}</div>
        <p class="dashboard-card__note">{{ t('panelDashboard.orders_month_short') }}: <strong>{{
          dashboard?.orders_last_month
            ?? '—' }}</strong></p>
        <router-link class="dashboard-card__button" :to="{ name: 'panel.orders' }">{{ t('panelDashboard.order_history')
          }}</router-link>
        <div class="dashboard-card__after-button">
          <div class="order-bars" aria-hidden="true">
            <div><span :style="{ height: yearBarHeight }"></span><small>{{ t('panelDashboard.year') }}</small></div>
            <div><span :style="{ height: monthBarHeight }"></span><small>{{ t('panelDashboard.month') }}</small></div>
          </div>
        </div>
      </article>

      <article class="dashboard-card dashboard-card--preview">
        <h2>{{ t('panelDashboard.active_bonuses') }}</h2>
        <p class="dashboard-card__eyebrow">{{ t('panelDashboard.sample_data') }}</p>
        <div class="dashboard-card__metric">320,00 zł</div>
        <p class="dashboard-card__note">{{ t('panelDashboard.available_funds') }}</p>
        <button class="dashboard-card__button" type="button" disabled>{{ t('panelDashboard.view_bonuses') }}</button>
        <div class="dashboard-card__after-button">
          <div class="dashboard-card__footnote">
            <BaseIcon name="star" /> +120,00 zł <span>{{ t('panelDashboard.sample_data') }}</span>
          </div>
        </div>
      </article>

      <article class="dashboard-card dashboard-card--preview dashboard-card--invoice">
        <h2>{{ t('panelDashboard.invoices_due') }}</h2>
        <p class="dashboard-card__eyebrow">{{ t('panelDashboard.sample_data') }}</p>
        <div class="dashboard-card__metric">1</div>
        <p class="dashboard-card__note">{{ t('panelDashboard.total_amount') }} <strong>1 240,00 zł {{
          t('panelDashboard.net')
            }}</strong></p>
        <button class="dashboard-card__button" type="button" disabled>{{ t('panelDashboard.view_invoices') }}</button>
        <div class="dashboard-card__after-button">
          <div class="dashboard-card__footnote">
            <BaseIcon name="doc" /> {{ t('panelDashboard.sample_data') }}
          </div>
        </div>
      </article>

      <article class="dashboard-card dashboard-card--cart">
        <h2>{{ t('panelDashboard.cart_products') }}</h2>
        <p class="dashboard-card__eyebrow">{{ t('panelDashboard.current_cart') }}</p>
        <div class="dashboard-card__metric">{{ dashboard?.cart_products_count ?? cartStore.count ?? '—' }}</div>
        <p class="dashboard-card__note">{{ t('panelDashboard.cart_value') }} <strong>{{
          cartStore.cart?.summary?.net_total ??
            '—' }} {{ t('panelDashboard.net') }}</strong></p>
        <router-link class="dashboard-card__button" :to="{ name: 'shopCart' }">{{ t('panelDashboard.go_to_cart')
          }}</router-link>
        <div class="dashboard-card__after-button" aria-hidden="true"></div>
      </article>
    </div>

    <div class="main-panel__content-grid">
      <section v-if="auth.hasAbility('orders')" class="dashboard-section dashboard-section--orders">
        <div class="dashboard-section__heading">
          <h2>{{ t('panelDashboard.latest_orders') }}</h2>
          <button v-if="(dashboard?.recent_orders.length ?? 0) > 5" type="button"
            @click="showAllOrders = !showAllOrders">
            {{ showAllOrders ? t('common.show_less') : t('panelDashboard.view_all') }}
          </button>
        </div>
        <p v-if="!visibleOrders.length" class="dashboard-section__empty">{{ loading ? t('common.loading') :
          t('panelDashboard.no_orders') }}</p>
        <div v-else class="dashboard-table-wrap">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>{{ t('panelDashboard.number') }}</th>
                <th>{{ t('panelDashboard.date') }}</th>
                <th>{{ t('panelDashboard.status') }}</th>
                <th>{{ t('panelDashboard.total') }}</th>
                <th>{{ t('panelDashboard.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in visibleOrders" :key="order.id">
                <td><strong>{{ order.number || '#' + order.id }}</strong></td>
                <td>{{ order.created_at }}</td>
                <td><span class="order-status">{{ order.status || '—' }}</span></td>
                <td><strong>{{ order.price }}</strong></td>
                <td><router-link :to="{ name: 'panel.order', params: { id: order.id } }">{{
                  t('panelDashboard.view_details')
                    }}</router-link></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="dashboard-section dashboard-section--actions">
        <div class="dashboard-section__heading">
          <h2>{{ t('panelDashboard.quick_actions') }}</h2>
        </div>
        <div class="quick-actions">
          <router-link :to="{ name: 'shop' }">
            <BaseIcon name="cart" /><span>{{ t('panelDashboard.start_order') }}</span>
          </router-link>
          <router-link v-if="auth.hasAbility('documents')" :to="{ name: 'panel.documents' }">
            <BaseIcon name="doc" /><span>{{ t('panelDashboard.documents') }}</span>
          </router-link>
          <router-link :to="{ name: 'panel.shopCarts' }">
            <BaseIcon name="fileDownload" /><span>{{ t('panelDashboard.saved_carts') }}</span>
          </router-link>
          <router-link v-if="auth.hasAbility('offers')" :to="{ name: 'panel.inquiryCreate' }">
            <BaseIcon name="comment" /><span>{{ t('panelDashboard.contact_sales') }}</span>
          </router-link>
          <router-link v-if="auth.hasAbility('claims')" :to="{ name: 'panel.claims.documents' }">
            <BaseIcon name="returning" /><span>{{ t('panelDashboard.returns') }}</span>
          </router-link>
        </div>
      </section>

      <section v-if="auth.hasAbility('orders')" class="dashboard-section dashboard-section--products">
        <div class="dashboard-section__heading">
          <h2>{{ t('panelDashboard.top_products') }}</h2>
          <button v-if="(dashboard?.top_products.length ?? 0) > 3" type="button"
            @click="showAllProducts = !showAllProducts">
            {{ showAllProducts ? t('common.show_less') : t('panelDashboard.view_all') }}
          </button>
        </div>
        <p v-if="!visibleProducts.length" class="dashboard-section__empty">{{ loading ? t('common.loading') :
          t('panelDashboard.no_products') }}</p>
        <div v-else class="top-products">
          <article v-for="product in visibleProducts" :key="product.product_id" class="top-product">
            <span class="top-product__image">
              <img v-if="product.image" :src="product.image" :alt="product.name" loading="lazy" />
              <BaseIcon v-else name="image" />
            </span>
            <div class="top-product__body">
              <strong>{{ product.name }}</strong>
              <small v-if="product.indeks">{{ product.indeks }}</small>
              <span class="top-product__price">{{ product.price || t('panelDashboard.price_unavailable') }}<small
                  v-if="product.price"> {{ t('panelDashboard.net') }}</small></span>
              <span>{{ t('panelDashboard.ordered_quantity') }}: {{ product.ordered_quantity }}</span>
            </div>
            <button type="button" :disabled="addingProductId === product.product_id"
              @click="addProduct(product.product_id)">
              {{ addingProductId === product.product_id ? t('common.loading') : t('panelDashboard.add_to_cart') }}
            </button>
          </article>
        </div>
        <p v-if="productMessage" class="dashboard-section__feedback" role="status">{{ productMessage }}</p>
      </section>

      <section class="dashboard-section dashboard-section--info">
        <div class="dashboard-section__heading">
          <h2>{{ t('panelDashboard.important_information') }}</h2>
        </div>
        <div class="important-list">
          <div v-if="auth.hasAbility('orders')" class="important-list__item">
            <BaseIcon name="order" />
            <div><strong>{{ t('panelDashboard.info_orders_title') }}</strong>
              <p>{{ t('panelDashboard.info_orders_text') }}</p><router-link :to="{ name: 'panel.orders' }">{{
                t('panelDashboard.view_all') }}</router-link>
            </div>
          </div>
          <div v-if="auth.hasAbility('offers')" class="important-list__item">
            <BaseIcon name="offer" />
            <div><strong>{{ t('panelDashboard.info_offers_title') }}</strong>
              <p>{{ t('panelDashboard.info_offers_text') }}</p><router-link :to="{ name: 'panel.offers' }">{{
                t('panelDashboard.view_offers') }}</router-link>
            </div>
          </div>
          <div class="important-list__item">
            <BaseIcon name="delivery" />
            <div><strong>{{ t('panelDashboard.info_cart_title') }}</strong>
              <p>{{ t('panelDashboard.info_cart_text') }}</p><router-link :to="{ name: 'shopCart' }">{{
                t('panelDashboard.go_to_cart') }}</router-link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import SwitchUnitModal from '@/views/modals/swtichunit/SwitchUnitModal.vue'
import { useAuthStore } from '@/core/stores/authStore'
import { useCartStore } from '@/core/stores/cartStore'
import { useModalStore } from '@/core/stores/modalStore'
import api from '@/core/api/axios'
import type { PanelDashboardResponse } from '@/composables/types/panelDashboard'

const auth = useAuthStore()
const cartStore = useCartStore()
const modal = useModalStore()
const { t, locale } = useI18n()
const dashboard = ref < PanelDashboardResponse | null > (null)
const loading = ref(false)
const loadError = ref(false)
const showAllOrders = ref(false)
const showAllProducts = ref(false)
const productMessage = ref('')
const addingProductId = ref < number | null > (null)
let requestVersion = 0

const latestOrder = computed(() => dashboard.value?.latest_orders[0] ?? null)
const visibleOrders = computed(() => showAllOrders.value ? dashboard.value?.recent_orders ?? [] : dashboard.value?.recent_orders.slice(0, 5) ?? [])
const visibleProducts = computed(() => showAllProducts.value ? dashboard.value?.top_products ?? [] : dashboard.value?.top_products.slice(0, 3) ?? [])
const yearBarHeight = computed(() => dashboard.value ? '50px' : '16px')
const monthBarHeight = computed(() => {
  if (!dashboard.value?.orders_last_year) return '8px'
  return Math.max(8, Math.round(50 * dashboard.value.orders_last_month / dashboard.value.orders_last_year)) + 'px'
})

const fetchDashboard = async () => {
  if (!auth.currentUnitId) {
    ++requestVersion
    dashboard.value = null
    return
  }

  const version = ++requestVersion
  dashboard.value = null
  loading.value = true
  loadError.value = false
  showAllOrders.value = false
  showAllProducts.value = false

  try {
    const { data } = await api.get < PanelDashboardResponse > ('/panel/dashboard')
    if (version === requestVersion && data.unit_id === Number(auth.currentUnitId)) dashboard.value = data
  } catch {
    if (version === requestVersion) loadError.value = true
  } finally {
    if (version === requestVersion) loading.value = false
  }
}

const addProduct = async (productId: number) => {
  productMessage.value = ''
  addingProductId.value = productId
  const cart = await cartStore.addItem(productId)
  productMessage.value = cart ? t('panelDashboard.added_to_cart') : t('panelDashboard.add_to_cart_error')
  addingProductId.value = null
}

watch([() => auth.currentUnitId, locale, () => cartStore.cart?.id, () => cartStore.cart?.items_count], fetchDashboard, { immediate: true })
</script>

<style scoped>
@import './MainPanel.css';
</style>
