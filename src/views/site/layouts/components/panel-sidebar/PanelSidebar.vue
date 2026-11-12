<template>
  <aside class="panel-sidebar" :class="{ 'panel-sidebar--closed': !open }">
    <nav class="sidebar-inner" :aria-label="t('panelDashboard.title')">
      <div class="nav-group">
        <span class="nav-group__title">{{ t('panelDashboard.sidebar_orders') }}</span>
        <router-link class="nav-link" exact-active-class="active" :to="{ name: 'panel' }">
          <BaseIcon name="dashboard" /><span>{{ t('menu.panel') }}</span>
        </router-link>
        <router-link v-if="auth.hasAbility('orders')" class="nav-link" active-class="active"
          :to="{ name: 'panel.orders' }">
          <BaseIcon name="order" /><span>{{ t('panelDashboard.sidebar_status') }}</span>
        </router-link>
        <router-link class="nav-link" :to="{ name: 'shopCart' }">
          <BaseIcon name="cart" /><span>{{ t('panelDashboard.sidebar_cart') }}</span>
        </router-link>
        <router-link v-if="auth.hasAbility('claims')" class="nav-link" active-class="active"
          :to="{ name: 'panel.claims.documents.new', query: { type: '1' } }">
          <BaseIcon name="returning" /><span>{{ t('claims.title') }}</span>
        </router-link>
      </div>

      <div v-if="auth.isAdmin" class="nav-group">
        <span class="nav-group__title">{{ t('orderApproval.title') }}</span>
        <router-link class="nav-link" active-class="active" :to="{ name: 'panel.approvals' }">
          <BaseIcon name="check" /><span>{{ t('orderApproval.title') }}</span>
          <span v-if="limitApprovalStore.pendingCount > 0" class="approval-count-badge">
            {{ limitApprovalStore.pendingCount }}
          </span>
        </router-link>
      </div>

      <div v-if="auth.hasAbility('documents') || auth.hasAbility('orders')" class="nav-group">
        <span class="nav-group__title">{{ t('panelDashboard.sidebar_documents') }}</span>
        <router-link v-if="auth.hasAbility('documents')" class="nav-link" active-class="active"
          :to="{ name: 'panel.documents' }">
          <BaseIcon name="doc" /><span>{{ t('panelDashboard.documents') }}</span>
        </router-link>
        <router-link v-if="auth.hasAbility('orders')" class="nav-link" active-class="active"
          :to="{ name: 'panel.carts' }">
          <BaseIcon name="cart" /><span>{{ t('cart.title') }}</span>
        </router-link>
      </div>

      <div class="nav-group">
        <span class="nav-group__title">{{ t('panelDashboard.sidebar_account') }}</span>
        <router-link class="nav-link" active-class="active" :to="{ name: 'panel.shopCarts' }">
          <BaseIcon name="cart" /><span>{{ t('panelDashboard.saved_carts') }}</span>
        </router-link>
        <router-link class="nav-link" active-class="active" :to="{ name: 'panel.favourites' }">
          <BaseIcon name="heartOutline" /><span>{{ t('favourite.title') }}</span>
        </router-link>
        <router-link v-if="auth.hasAbility('offers')" class="nav-link" active-class="active"
          :to="{ name: 'panel.offers' }">
          <BaseIcon name="offer" /><span>{{ t('panelDashboard.view_offers') }}</span>
        </router-link>
        <router-link class="nav-link" active-class="active" :to="{ name: 'panel.centerCosts' }">
          <BaseIcon name="center_costs" /><span>{{ t('panelDashboard.center_costs') }}</span>
        </router-link>
      </div>

      <div v-if="auth.hasAbility('offers')" class="nav-group">
        <span class="nav-group__title">{{ t('panelDashboard.sidebar_support') }}</span>
        <router-link class="nav-link" active-class="active" :to="{ name: 'panel.inquiries' }">
          <BaseIcon name="inquiry" /><span>{{ t('inquiry.title') }}</span>
        </router-link>
        <router-link class="nav-link" active-class="active" :to="{ name: 'panel.promotions' }">
          <BaseIcon name="percent" /><span>{{ t('promotions.contracts_promotions') }}</span>
        </router-link>
        <router-link class="nav-link" active-class="active" :to="{ name: 'promotions.products' }">
          <BaseIcon name="percent" /><span>{{ t('promotions.products_title') }}</span>
        </router-link>
      </div>

      <div v-if="agentLoaded" class="sidebar-help" :class="{ 'sidebar-help--agent': agent }">
        <template v-if="agent">
          <strong class="sidebar-help__heading">{{ t('panelDashboard.sidebar_agent') }}</strong>
          <div class="sidebar-help__identity">
            <span class="sidebar-help__name">{{ [agent.firstname, agent.lastname].filter(Boolean).join(' ') || '—'
            }}</span>
            <span class="sidebar-help__role">{{ t('panelDashboard.sidebar_agent_role') }}</span>
          </div>
          <div class="sidebar-help__contacts">
            <div class="sidebar-help__contact">
              <BaseIcon name="phone" />
              <a v-if="agent.phone" :href="`tel:${agent.phone}`">{{ agent.phone }}</a>
              <span v-else>—</span>
            </div>
            <div class="sidebar-help__contact">
              <BaseIcon name="email" />
              <a v-if="agent.email" :href="`mailto:${agent.email}`">{{ agent.email }}</a>
              <span v-else>—</span>
            </div>
          </div>
          <button class="sidebar-help__message" type="button">{{ t('panelDashboard.sidebar_agent_message') }}</button>
        </template>
        <template v-else>
          <strong>{{ t('panelDashboard.sidebar_help') }}</strong>
          <p>{{ t('panelDashboard.sidebar_help_text') }}</p>
          <router-link v-if="auth.hasAbility('offers')" :to="{ name: 'panel.inquiryCreate' }">{{
            t('panelDashboard.contact_sales') }}</router-link>
          <router-link v-else-if="auth.hasAbility('documents')" :to="{ name: 'panel.documents' }">{{
            t('panelDashboard.documents') }}</router-link>
        </template>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import { useAuthStore } from '@/core/stores/authStore'
import api from '@/core/api/axios'
import { useLimitApprovalStore } from '@/core/stores/limitApprovalStore'
import type { PanelAgent, PanelAgentResponse } from '@/composables/types/panelDashboard'

defineProps<{ open: boolean }>()
const auth = useAuthStore()
const limitApprovalStore = useLimitApprovalStore()
const { t } = useI18n()
const agent = ref<PanelAgent | null>(null)
const agentLoaded = ref(false)
let requestVersion = 0

watch(() => auth.currentUnitId, async (unitId) => {
  const version = ++requestVersion
  agent.value = null
  agentLoaded.value = false

  if (!unitId) {
    agentLoaded.value = true
    return
  }

  try {
    const { data } = await api.get<PanelAgentResponse>('/panel/agent')
    if (version === requestVersion && data.unit_id === Number(auth.currentUnitId)) {
      agent.value = data.agent
      agentLoaded.value = true
    }
  } catch {
    // Keep the contact box hidden when the agent assignment could not be checked.
  }
}, { immediate: true })
</script>

<style scoped>
@import './panel-sidebar.css';
</style>
