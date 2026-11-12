<template>
  <section class="approval-list">
    <header class="approval-list__header">
      <h1>{{ t('orderApproval.title') }}</h1>
      <p>{{ t('orderApproval.description') }}</p>
    </header>

    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <div v-else-if="loading" class="text-center py-5">{{ t('common.loading') }}</div>
    <div v-else-if="!orders.length" class="approval-list__empty">
      {{ t('orderApproval.empty') }}
    </div>

    <div v-else class="approval-list__table-wrap">
      <table class="approval-list__table">
        <thead>
          <tr>
            <th>{{ t('common.number') }}</th>
            <th>{{ t('common.contractor') }}</th>
            <th>{{ t('user.user') }}</th>
            <th>{{ t('common.created_at') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id" tabindex="0" class="approval-list__row"
            @click="openOrder(order.id)" @keydown.enter="openOrder(order.id)"
            @keydown.space.prevent="openOrder(order.id)">
            <td><strong>{{ order.number || `#${order.id}` }}</strong></td>
            <td>{{ order.unit || '—' }}</td>
            <td>{{ order.user || '—' }}</td>
            <td>{{ order.created_at }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav v-if="meta.last_page > 1" class="approval-list__pagination" :aria-label="t('orderApproval.pagination')">
      <button type="button" :disabled="loading || meta.current_page <= 1" @click="load(meta.current_page - 1)">
      {{ t('orderApproval.previous') }}
      </button>
      <span>{{ meta.current_page }} / {{ meta.last_page }}</span>
      <button type="button" :disabled="loading || meta.current_page >= meta.last_page"
        @click="load(meta.current_page + 1)">
        {{ t('orderApproval.next') }}
      </button>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import api from '@/core/api/axios'

interface ApprovalOrder {
  id: number
  number: string | null
  unit: string | null
  user: string
  created_at: string | null
}

interface ApprovalListResponse {
  data: ApprovalOrder[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

const { t } = useI18n()
const router = useRouter()
const orders = ref<ApprovalOrder[]>([])
const loading = ref(false)
const error = ref('')
const meta = ref<ApprovalListResponse['meta']>({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
})

async function load(page = 1) {
  loading.value = true
  error.value = ''

  try {
    const { data } = await api.get<ApprovalListResponse>('/limit-approvals', {
      params: { page },
    })
    orders.value = data.data
    meta.value = data.meta
  } catch {
    error.value = t('orderApproval.load_error')
  } finally {
    loading.value = false
  }
}

function openOrder(orderId: number) {
  void router.push({ name: 'panel.approval', params: { id: orderId } })
}

onMounted(() => load())
</script>

<style scoped>
.approval-list {
  min-width: 0;
  padding: 30px 0 40px;
  color: var(--text-primary);
}
.approval-list__header { margin-bottom: 22px; }
.approval-list__header h1 { margin: 0 0 6px; font-size: clamp(24px, 2vw, 30px); font-weight: 700; }
.approval-list__header p { margin: 0; color: var(--text-secondary); }
.approval-list__empty {
  padding: 28px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--text-secondary);
}
.approval-list__table-wrap { overflow-x: auto; border: 1px solid var(--border-light); border-radius: var(--radius-sm); }
.approval-list__table { width: 100%; border-collapse: collapse; background: var(--bg-surface); }
.approval-list__table th { background: var(--accent-bg); color: var(--text-primary); font-size: var(--font-size-sm-plus); text-align: left; }
.approval-list__table th, .approval-list__table td { padding: 12px 16px; border-bottom: 1px solid var(--border-light); }
.approval-list__table tbody tr:last-child td { border-bottom: 0; }
.approval-list__row { cursor: pointer; }
.approval-list__row:hover { background: var(--accent-bg); }
.approval-list__row:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.approval-list__pagination { display: flex; justify-content: center; align-items: center; gap: 14px; margin-top: 18px; }
.approval-list__pagination button { padding: 7px 12px; border: 1px solid var(--border-light); border-radius: var(--radius-sm); background: var(--bg-surface); color: var(--accent-strong); }
.approval-list__pagination button:disabled { opacity: .5; }
</style>
