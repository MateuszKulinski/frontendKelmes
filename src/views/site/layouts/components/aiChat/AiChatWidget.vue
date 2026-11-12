<template>
  <div class="ai-chat-widget">
    <Transition name="ai-chat-panel">
      <section v-if="open" id="ai-chat-panel" class="ai-chat-panel" :aria-label="t('aiChat.panel_label')"
        @keydown.esc="closeChat">
        <header class="ai-chat-header">
          <div class="ai-chat-identity">
            <span class="ai-chat-avatar" aria-hidden="true"><BaseIcon name="comment" class="ai-chat-icon" /></span>
            <div><strong>{{ t('aiChat.assistant') }}</strong><small><span class="ai-chat-status-dot"></span>{{ t('aiChat.subtitle') }}</small></div>
          </div>
          <div class="ai-chat-header-actions">
            <button v-if="auth.isLogged && auth.currentUnitId" type="button" class="ai-chat-new" :disabled="loading"
              :aria-label="t('aiChat.new_conversation')" :title="t('aiChat.new_conversation')" @click="startNewConversation">
              <BaseIcon name="plus" class="ai-chat-icon" aria-hidden="true" /><span>{{ t('aiChat.new_conversation') }}</span>
            </button>
            <button type="button" class="ai-chat-close" :aria-label="t('aiChat.close_chat')" @click="closeChat">
              <BaseIcon name="remove" class="ai-chat-icon" aria-hidden="true" />
            </button>
          </div>
        </header>
        <div ref="messagesElement" class="ai-chat-messages" role="log" aria-live="polite"
          :aria-label="t('aiChat.panel_label')" @scroll.passive="updateScrollPosition">
          <p v-if="!auth.isLogged" class="ai-chat-note ai-chat-access-note">{{ t('aiChat.login_required') }}</p>
          <p v-else-if="!auth.currentUnitId" class="ai-chat-note ai-chat-access-note">{{ t('aiChat.company_required') }}</p>
          <template v-else>
            <article v-for="(entry, index) in messages" :key="index" class="ai-chat-entry" :class="entry.role">
              <template v-if="entry.role === 'assistant'">
                <div class="ai-chat-message-author"><BaseIcon name="comment" class="ai-chat-icon" aria-hidden="true" />{{ t('aiChat.assistant') }}</div>
                <AiChatAssistantMessage :text="entry.text" :question="entry === questionEntry ? entry.clarification : null" />
                <AiChatProductGroups v-if="entryProductGroups(entry).length" :groups="entryProductGroups(entry)"
                  :interactive="!loading && !error && index === messages.length - 1"
                  @more="sendQuickReply(entry.groups?.length ? t('aiChat.quick_more_group_message', { query: $event }) : t('aiChat.quick_more_message'))" />
                <AiChatTaskPlan v-if="entry.taskPlan?.steps.length" :plan="entry.taskPlan" />
              </template>
              <p v-else class="ai-chat-bubble user">{{ entry.text }}</p>
            </article>
            <div v-if="showLoadingIndicator" class="ai-chat-loading" role="status" aria-atomic="true">
              <span class="ai-chat-loading-dots" aria-hidden="true"><span></span><span></span><span></span></span>
              <span aria-hidden="true">{{ typedLoadingMessage }}</span><span class="visually-hidden">{{ loadingMessage }}</span>
            </div>
          </template>
        </div>
        <button v-if="!followingLatest" type="button" class="ai-chat-jump ai-chat-text-action" @click="scrollToBottom('smooth', true)">
          <BaseIcon name="arrowDown" class="ai-chat-icon" aria-hidden="true" />{{ latestLabel }}
        </button>
        <p v-if="error" class="ai-chat-error" role="alert">{{ t(error) }}</p>
        <div v-if="auth.isLogged && auth.currentUnitId && route.name === 'compare'" class="ai-chat-page-actions">
          <button type="button" class="ai-chat-choice" :disabled="loading || !sessionId || !canCompare"
            @click="compareProducts">{{ t('aiChat.compare_with_ai') }}</button>
          <p v-if="!canCompare" class="ai-chat-note">{{ t('aiChat.comparison_hint') }}</p>
        </div>
        <AiChatComposer v-if="auth.isLogged && auth.currentUnitId" ref="composerElement" v-model="draft"
          :question="activeQuestion" :suggestions="suggestions" :disabled="loading || !sessionId" :price-basis="priceType"
          @submit="sendMessage()" @suggestion="sendQuickReply"
          @select="questionEntry && chooseOption(questionEntry, $event.id, $event.label)" />
        <div class="ai-chat-footer">
          <p>{{ assistantNotice }}</p>
          <div class="ai-chat-solution">
            <span>Solution</span>
            <a href="https://exis.pl" target="_blank" rel="noopener noreferrer">
              <img src="https://exis.pl/wp-content/uploads/2025/07/logo.png" alt="EXIS" width="72" height="20"
                decoding="async" referrerpolicy="no-referrer" />
            </a>
          </div>
        </div>
      </section>
    </Transition>
    <button ref="toggleElement" type="button" class="ai-chat-toggle" :class="{ 'is-open': open }"
      :aria-expanded="open" aria-controls="ai-chat-panel" :aria-label="t(open ? 'aiChat.close_assistant' : 'aiChat.open_assistant')"
      @click="toggleChat"><BaseIcon :name="open ? 'remove' : 'comment'" class="ai-chat-icon" aria-hidden="true" /></button>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePriceTypeStore } from '@/core/stores/priceTypeStore'
import { useAuthStore } from '@/core/stores/authStore'
import { useContentStore } from '@/core/stores/contentStore'
import { useCartStore } from '@/core/stores/cartStore'
import { useCompareStore } from '@/core/stores/compareStore'
import { useRoute } from 'vue-router'
import { getIdFromSlug } from '@/core/utils/slug'
import { productGroups } from './chatPresentation'
import { getAiChatLoadingMessages } from './aiChatLoadingMessages'
import { executeCartActions } from './cartHandoff'
import AiChatProductGroups from './AiChatProductGroups.vue'
import AiChatComposer from './AiChatComposer.vue'
import AiChatAssistantMessage from './AiChatAssistantMessage.vue'
import AiChatTaskPlan from './AiChatTaskPlan.vue'
import { startAiChat, sendAiChatMessage, chooseAiChatClarification, compareAiChatProducts,
  type AiChatProduct, type AiChatProductGroup, type AiChatClarification, type AiChatReply,
  type AiChatTaskPlan as TaskPlan } from './aiChatApi'
import { useI18n } from 'vue-i18n'
import './AiChatWidget.css'

type ChatEntry = {
  role: 'user' | 'assistant'
  text: string
  products?: AiChatProduct[]
  groups?: AiChatProductGroup[]
  hasMore?: boolean
  clarification?: AiChatClarification | null
  taskPlan?: TaskPlan | null
  selectedOptionId?: string
  choicesClosed?: boolean
}
const auth = useAuthStore()
const content = useContentStore()
const cart = useCartStore()
const compare = useCompareStore()
const route = useRoute()
const { t, locale } = useI18n()
const assistantNotice = computed(() => locale.value.startsWith('pl') ? 'Prowadzisz rozmowę z asystentem AI'
  : locale.value.startsWith('de') ? 'Sie sprechen mit einem KI-Assistenten' : 'You are chatting with an AI assistant')
const latestLabel = computed(() => locale.value.startsWith('pl') ? 'Do najnowszej wiadomości'
  : locale.value.startsWith('de') ? 'Zur neuesten Nachricht' : 'Jump to latest message')
const { current: priceType } = storeToRefs(usePriceTypeStore())
const canCompare = computed(() => !compare.loading && !compare.detailsLoading
  && compare.ids.length >= 2 && compare.ids.length <= 4)
const open = ref(false)
const loading = ref(false)
const sessionId = ref<string | null>(null)
const draft = ref('')
const error = ref('')
const messages = ref<ChatEntry[]>([])
const messagesElement = ref<HTMLElement | null>(null)
const composerElement = ref<InstanceType<typeof AiChatComposer> | null>(null)
const toggleElement = ref<HTMLButtonElement | null>(null)
const followingLatest = ref(true)
const latestEntry = computed(() => messages.value.at(-1))
const questionEntry = computed(() => {
  const entry = latestEntry.value
  return entry?.role === 'assistant' && entry.clarification && !entry.choicesClosed && !entry.selectedOptionId
    ? entry : null
})
const activeQuestion = computed(() => !loading.value ? questionEntry.value?.clarification ?? null : null)
const suggestions = computed(() => latestEntry.value
  ? quickReplies(latestEntry.value, messages.value.length - 1) : [])
const pendingQuestion = ref<string | null>(null)
const loadingMessageIndex = ref(0)
const typedLoadingMessage = ref('')
const loadingMessages = computed(() => getAiChatLoadingMessages(locale.value))
const loadingMessage = computed(() => loadingMessages.value[loadingMessageIndex.value % loadingMessages.value.length])
const showLoadingIndicator = computed(() => open.value && loading.value
  && (messages.value.length === 0 || messages.value[messages.value.length - 1]?.role === 'user'))
let activeRequest: AbortController | null = null
let chatGeneration = 0

onBeforeUnmount(() => activeRequest?.abort())

watch([showLoadingIndicator, locale], ([visible], _previous, onCleanup) => {
  loadingMessageIndex.value = 0
  typedLoadingMessage.value = ''
  if (!visible) return
  let timer: ReturnType<typeof setTimeout> | undefined

  function typeNextCharacter() {
    typedLoadingMessage.value = loadingMessage.value.slice(0, typedLoadingMessage.value.length + 1)
    if (typedLoadingMessage.value.length < loadingMessage.value.length) {
      timer = setTimeout(typeNextCharacter, 40)
    } else {
      timer = setTimeout(() => {
        typedLoadingMessage.value = ''
        loadingMessageIndex.value = (loadingMessageIndex.value + 1) % loadingMessages.value.length
        typeNextCharacter()
      }, 1200)
    }
  }

  typeNextCharacter()
  onCleanup(() => clearTimeout(timer))
})

function resetChat() {
  chatGeneration += 1
  activeRequest?.abort()
  activeRequest = null
  loading.value = false
  sessionId.value = null
  messages.value = []
  draft.value = ''
  error.value = ''
  pendingQuestion.value = null
  followingLatest.value = true
}

watch(() => [auth.user?.id, auth.currentUnitId], resetChat)

async function scrollToBottom(behavior: ScrollBehavior = 'auto', force = false) {
  await nextTick()
  if (!force && !followingLatest.value) return
  followingLatest.value = true
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  messagesElement.value?.scrollTo({ top: messagesElement.value.scrollHeight, behavior: reducedMotion ? 'auto' : behavior })
}

function updateScrollPosition() {
  const element = messagesElement.value
  if (element) followingLatest.value = element.scrollHeight - element.scrollTop - element.clientHeight < 80
}

async function closeChat() {
  open.value = false
  await nextTick()
  toggleElement.value?.focus({ preventScroll: true })
}

async function focusInput() {
  await nextTick()
  composerElement.value?.focus()
}

async function startConversation() {
  if (!auth.isLogged || !auth.currentUnitId || sessionId.value || loading.value) return
  const generation = chatGeneration
  loading.value = true
  error.value = ''
  try {
    const data = await startAiChat()
    if (generation !== chatGeneration) return
    sessionId.value = data.session_id
    messages.value = [{ role: 'assistant', text: data.message }]
    await scrollToBottom()
  } catch {
    if (generation !== chatGeneration) return
    error.value = 'aiChat.start_error'
    if (pendingQuestion.value) {
      draft.value = pendingQuestion.value
      pendingQuestion.value = null
    }
  } finally {
    if (generation === chatGeneration) {
      loading.value = false
      await focusInput()
      void sendPendingQuestion()
    }
  }
}

async function startNewConversation() {
  if (loading.value) return
  resetChat()
  await startConversation()
}

async function toggleChat() {
  if (open.value) return closeChat()
  open.value = true
  followingLatest.value = true
  await startConversation()
  await focusInput()
  await scrollToBottom('auto')
}

async function openWithQuery(query: string) {
  open.value = true
  followingLatest.value = true
  await scrollToBottom('auto')
  const question = query.trim()
  if (question) draft.value = question
  if (!auth.isLogged || !auth.currentUnitId) return

  if (loading.value) {
    if (question) pendingQuestion.value = question
    return
  }

  await startConversation()
  await focusInput()
  await scrollToBottom('auto')
  if (question && sessionId.value) await sendMessage()
}

async function sendPendingQuestion() {
  if (!pendingQuestion.value || loading.value || !sessionId.value) return
  draft.value = pendingQuestion.value
  pendingQuestion.value = null
  await sendMessage()
}

defineExpose({ openWithQuery })

async function compareProducts() {
  if (route.name !== 'compare' || !canCompare.value || loading.value || !sessionId.value) return
  const ids = [...compare.ids]
  await sendMessage(ids)
}

async function sendMessage(comparing?: number[]) {
  const text = comparing ? t('aiChat.comparison_message') : draft.value.trim()
  const sid = sessionId.value
  if (!text || !sid || loading.value) return
  if (!comparing) draft.value = ''
  error.value = ''
  followingLatest.value = true
  messages.value.push({ role: 'user', text })
  loading.value = true
  await scrollToBottom()
  const controller = new AbortController()
  activeRequest = controller
  let replyEntry: ChatEntry | undefined
  try {
    const callbacks = {
      onText: (reply: string) => {
        if (sessionId.value !== sid) return
        replyEntry = showReplyText(reply, replyEntry)
      },
      onProducts: (products: AiChatProduct[], groups: AiChatProductGroup[]) => {
        if (sessionId.value !== sid || controller.signal.aborted) return
        replyEntry = showReplyText(replyEntry?.text ?? '', replyEntry)
        replyEntry.products = products
        replyEntry.groups = groups
        void scrollToBottom()
      },
    }
    const data = comparing
      ? await compareAiChatProducts(sid, comparing, text, callbacks, controller.signal)
      : await sendAiChatMessage(sid, text, currentProductId(), callbacks, controller.signal)
    if (sessionId.value !== sid) return
    await appendReply(data, replyEntry)
  } catch {
    if (sessionId.value !== sid) return
    error.value = 'aiChat.send_error'
    if (!comparing) draft.value = pendingQuestion.value ?? text
    pendingQuestion.value = null
    if (!replyEntry) messages.value.pop()
  } finally {
    if (sessionId.value === sid) {
      activeRequest = null
      loading.value = false
      await scrollToBottom()
      await focusInput()
      void sendPendingQuestion()
    }
  }
}

function currentProductId(): number | undefined {
  return route.name === 'dynamic' && content.pageType === 'product'
    && content.page?.id === getIdFromSlug(String(route.params.slug ?? ''))
    ? Number(content.page.id) : undefined
}

function entryProductGroups(entry: ChatEntry): AiChatProductGroup[] {
  const excludedIds = new Set<number>(entry === questionEntry.value
    ? entry.clarification?.options.flatMap(option => option.product_id ? [option.product_id] : []) : [])
  return productGroups(entry.products, entry.groups, t('aiChat.recommended_products'), excludedIds, entry.hasMore)
}

function showReplyText(text: string, entry?: ChatEntry): ChatEntry {
  if (!entry) {
    messages.value.push({ role: 'assistant', text })
    entry = messages.value[messages.value.length - 1]
  } else {
    entry.text = text
  }
  void scrollToBottom('auto')
  return entry!
}

async function appendReply(data: AiChatReply, replyEntry?: ChatEntry) {
  const sid = sessionId.value
  if (data.cartActions?.length) {
    const result = await executeCartActions(data.cartActions, cart,
      () => sessionId.value === sid && auth.isLogged && !activeRequest?.signal.aborted)
    if (sessionId.value !== sid) return
    const polish = locale.value.toLowerCase().startsWith('pl')
    const confirmation = result.ok
      ? (polish ? 'Koszyk został zaktualizowany.' : 'The cart has been updated.')
      : (polish ? 'Nie mogę potwierdzić wszystkich zmian. Sprawdź koszyk przed ponowieniem.'
        : 'Not all changes could be confirmed. Check the cart before retrying.')
    data = { ...data, response: `${data.response}\n\n${confirmation}` }
    if (result.changed) await Promise.all([cart.loadActiveCart(), cart.fetchCarts()])
  }
  for (const entry of messages.value) {
    if (entry.clarification) entry.choicesClosed = true
  }
  if (replyEntry) {
    Object.assign(replyEntry, { text: data.response, products: data.products, groups: data.groups,
      hasMore: data.hasMore, clarification: data.clarification, taskPlan: data.taskPlan })
  } else {
    messages.value.push({ role: 'assistant', text: data.response,
      products: data.products, groups: data.groups, hasMore: data.hasMore, clarification: data.clarification,
      taskPlan: data.taskPlan })
  }
  if (data.productsUnavailable) error.value = 'aiChat.products_error'
  if (data.cartUpdated) {
    await Promise.all([cart.loadActiveCart(), cart.fetchCarts()])
  }
}

async function chooseOption(entry: ChatEntry, optionId: string, label: string) {
  const sid = sessionId.value
  const clarification = entry.clarification
  if (!sid || !clarification || loading.value || entry.choicesClosed || entry.selectedOptionId) return
  entry.selectedOptionId = optionId
  error.value = ''
  followingLatest.value = true
  messages.value.push({ role: 'user', text: label })
  loading.value = true
  await scrollToBottom()
  const controller = new AbortController()
  activeRequest = controller
  let replyEntry: ChatEntry | undefined
  try {
    const data = await chooseAiChatClarification(sid, clarification.id, optionId, currentProductId(), {
      onText: (reply) => {
        if (sessionId.value !== sid) return
        replyEntry = showReplyText(reply, replyEntry)
      },
      onProducts: (products, groups) => {
        if (sessionId.value !== sid || controller.signal.aborted) return
        replyEntry = showReplyText(replyEntry?.text ?? '', replyEntry)
        replyEntry.products = products
        replyEntry.groups = groups
        void scrollToBottom()
      },
    }, controller.signal)
    if (sessionId.value !== sid) return
    await appendReply(data, replyEntry)
  } catch {
    if (sessionId.value !== sid) return
    error.value = 'aiChat.choice_error'
    if (!replyEntry) {
      messages.value.pop()
      entry.selectedOptionId = undefined
    }
  } finally {
    if (sessionId.value === sid) {
      activeRequest = null
      loading.value = false
      await scrollToBottom()
      await focusInput()
      void sendPendingQuestion()
    }
  }
}

function quickReplies(entry: ChatEntry, index: number): { label: string; message: string }[] {
  if (loading.value || index !== messages.value.length - 1 || entry.role !== 'assistant'
      || entry.taskPlan?.status === 'waiting_platform' || entry.taskPlan?.status === 'waiting_user'
      || entry.clarification || error.value) return []
  if (messages.value.length === 1) {
    return ['find_product', 'my_orders', 'help'].map((key) => ({
      label: t(`aiChat.quick_${key}`), message: t(`aiChat.quick_${key}_message`),
    }))
  }
  if (!entry.products?.length) return []
  return [
    ...(entry.products.length > 1
      ? [{ label: t('aiChat.quick_help_choose'), message: t('aiChat.quick_help_choose_message') }]
      : []),
  ]
}

async function sendQuickReply(message: string) {
  if (loading.value || !sessionId.value) return
  draft.value = message
  await sendMessage()
}
</script>
