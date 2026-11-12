<template>
  <footer class="ai-chat-composer" @keydown.esc.stop="collapseOptions">
    <div v-if="question || suggestions.length" class="ai-chat-answer-panel">
      <button v-if="hasOptions" ref="toggleElement" type="button" class="ai-chat-answer-toggle"
        :aria-expanded="!collapsed" :aria-controls="optionsId" @click="collapsed = !collapsed">
        <span class="ai-chat-answer-heading">
          <small>{{ question ? labels.next : t('aiChat.next_step') }}</small>
          <strong>{{ question?.prompt || labels.start }}</strong>
          <span v-if="question?.product_label" class="ai-chat-answer-product">{{ question.product_label }}</span>
        </span>
        <BaseIcon name="chDown" class="ai-chat-icon" :class="{ 'is-collapsed': collapsed }" aria-hidden="true" />
      </button>
      <div v-else class="ai-chat-answer-heading ai-chat-answer-open">
        <small>{{ labels.next }}</small>
        <strong>{{ question?.prompt }}</strong>
        <span v-if="question?.product_label" class="ai-chat-answer-product">{{ question.product_label }}</span>
      </div>
      <Transition name="ai-chat-options">
        <div v-if="hasOptions && !collapsed" :id="optionsId" class="ai-chat-answer-options">
          <AiChatTaskQuestion v-if="question && isProductQuestion" :question="question"
            :disabled="disabled" :price-basis="priceBasis" @select="emit('select', $event)" />
          <AiChatRefinementChoices v-else-if="question?.groups?.length" :clarification="question"
            :disabled="disabled" @select="emit('select', $event)" />
          <div v-else-if="question?.options.length" class="ai-chat-choices" role="group" :aria-label="question.prompt">
            <button v-for="option in question.options" :key="option.id" type="button" class="ai-chat-choice"
              :disabled="disabled" @click="emit('select', option)">{{ option.label }}</button>
          </div>
          <div v-else class="ai-chat-choices" role="group" :aria-label="t('aiChat.next_step')">
            <button v-for="suggestion in suggestions" :key="suggestion.message" type="button" class="ai-chat-choice"
              :disabled="disabled" @click="emit('suggestion', suggestion.message)">{{ suggestion.label }}</button>
          </div>
        </div>
      </Transition>
    </div>
    <form class="ai-chat-form" @submit.prevent="submit">
      <label class="visually-hidden" :for="inputId">{{ t('aiChat.message_label') }}</label>
      <textarea :id="inputId" ref="inputElement" :value="modelValue" rows="1" maxlength="5000"
        :placeholder="question ? labels.placeholder : t('aiChat.message_placeholder')" :disabled="disabled"
        :aria-describedby="hintId" @input="updateDraft" @keydown.enter.exact="onEnter" />
      <button type="submit" class="ai-chat-send" :disabled="disabled || !modelValue.trim()"
        :aria-label="t('aiChat.send_message')" :title="t('aiChat.send_message')">
        <BaseIcon name="arrowUp" class="ai-chat-icon" aria-hidden="true" />
      </button>
    </form>
    <p :id="hintId" class="ai-chat-composer-hint">{{ question ? (hasOptions ? labels.choose : labels.write) : labels.keyboard }}</p>
  </footer>
</template>

<script setup lang="ts">
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AiChatTaskQuestion from './AiChatTaskQuestion.vue'
import AiChatRefinementChoices from './AiChatRefinementChoices.vue'
import type { AiChatClarification } from './aiChatApi'

const props = withDefaults(defineProps<{
  modelValue: string; question?: AiChatClarification | null
  suggestions?: { label: string; message: string }[]; disabled: boolean; priceBasis: 'net' | 'gross'
}>(), { question: null, suggestions: () => [] })
const emit = defineEmits<{
  'update:modelValue': [text: string]; submit: []; select: [option: { id: string; label: string }]
  suggestion: [text: string]
}>()
const { t, locale } = useI18n()
const inputElement = ref<HTMLTextAreaElement | null>(null)
const toggleElement = ref<HTMLButtonElement | null>(null)
const collapsed = ref(false)
const inputId = useId()
const optionsId = useId()
const hintId = useId()
const hasOptions = computed(() => !!(props.question?.options.length || props.question?.groups?.length || props.suggestions.length))
const isProductQuestion = computed(() => props.question?.options.some(option => option.product_id))
const labels = computed(() => locale.value.startsWith('pl') ? {
  next: 'Twój kolejny krok', start: 'Od czego zaczynamy?', placeholder: 'Wpisz własną odpowiedź…',
  choose: 'Wybierz opcję lub wpisz własną odpowiedź poniżej.', write: 'Wpisz odpowiedź poniżej, aby kontynuować.',
  keyboard: 'Enter — wyślij · Shift + Enter — nowa linia',
} : locale.value.startsWith('de') ? {
  next: 'Ihr nächster Schritt', start: 'Womit fangen wir an?', placeholder: 'Eigene Antwort schreiben…',
  choose: 'Option wählen oder unten eine eigene Antwort schreiben.', write: 'Unten antworten, um fortzufahren.',
  keyboard: 'Enter — senden · Shift + Enter — neue Zeile',
} : {
  next: 'Your next step', start: 'Where shall we start?', placeholder: 'Write your own answer…',
  choose: 'Choose an option or write your own answer below.', write: 'Write your answer below to continue.',
  keyboard: 'Enter — send · Shift + Enter — new line',
})

watch(() => [props.question?.id, props.question?.prompt, props.suggestions.map(item => item.message).join('|')], () => {
  collapsed.value = false
})
watch(() => props.modelValue, () => nextTick(resizeInput))
onMounted(resizeInput)
function resizeInput() {
  if (!inputElement.value) return
  inputElement.value.style.height = 'auto'
  inputElement.value.style.height = `${Math.min(inputElement.value.scrollHeight, 132)}px`
}
function updateDraft(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
  resizeInput()
}
function submit() {
  if (!props.disabled && props.modelValue.trim()) emit('submit')
}
function onEnter(event: KeyboardEvent) {
  if (event.isComposing) return
  event.preventDefault()
  submit()
}
function collapseOptions() {
  if (collapsed.value || !hasOptions.value) return
  collapsed.value = true
  toggleElement.value?.focus({ preventScroll: true })
}
defineExpose({ focus: () => inputElement.value?.focus({ preventScroll: true }) })
</script>
