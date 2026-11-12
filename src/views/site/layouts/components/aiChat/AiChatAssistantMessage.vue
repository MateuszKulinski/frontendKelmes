<template>
  <div v-if="content" class="ai-chat-assistant-content">
    <div :id="contentId" class="ai-chat-formatted" v-html="renderChatMarkdown(expanded ? content : preview)"></div>
    <button v-if="preview !== content" type="button" class="ai-chat-text-action"
      :aria-expanded="expanded" :aria-controls="contentId" @click="expanded = !expanded">
      {{ expanded ? labels.less : labels.more }}
      <BaseIcon :name="expanded ? 'chUp' : 'chDown'" class="ai-chat-icon" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AiChatClarification } from './aiChatApi'
import { assistantMessage, messagePreview } from './chatPresentation'
import { renderChatMarkdown } from './chatMarkdown'

const props = defineProps<{ text: string; question?: AiChatClarification | null }>()
const expanded = ref(false)
const contentId = useId()
const { locale } = useI18n()
const content = computed(() => assistantMessage(props.text, props.question) || (props.question ? labels.value.ready : ''))
const preview = computed(() => messagePreview(content.value))
const labels = computed(() => locale.value.startsWith('pl')
  ? { more: 'Rozwiń odpowiedź', less: 'Zwiń odpowiedź', ready: 'Potrzebuję jeszcze Twojej odpowiedzi, aby kontynuować.' }
  : locale.value.startsWith('de') ? { more: 'Antwort anzeigen', less: 'Weniger anzeigen', ready: 'Ich benötige noch Ihre Antwort, um fortzufahren.' }
    : { more: 'Read full reply', less: 'Show less', ready: 'I need your answer to continue.' })
</script>
