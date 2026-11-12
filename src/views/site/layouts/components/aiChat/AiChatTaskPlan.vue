<template>
  <details class="ai-chat-task-plan">
    <summary>{{ labels.title }} · {{ labels[plan.status] }}</summary>
    <ol>
      <li v-for="step in plan.steps" :key="step.id">
        <span>{{ step.description }}</span>
        <small>{{ labels[step.status] }}</small>
      </li>
    </ol>
  </details>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AiChatTaskPlan } from './aiChatApi'

defineProps<{ plan: AiChatTaskPlan }>()
const { locale } = useI18n()
const labels = computed(() => locale.value.toLowerCase().startsWith('pl') ? {
  title: 'Postęp zadania', pending: 'Oczekuje', running: 'W toku', completed: 'Wykonano',
  waiting_user: 'Czeka na odpowiedź', waiting_platform: 'Czeka na potwierdzenie sklepu',
  handed_off: 'Przekazano do sklepu', partial: 'Częściowo wykonano', failed: 'Nie udało się',
  uncertain: 'Wymaga sprawdzenia', cancelled: 'Anulowano',
} : {
  title: 'Task progress', pending: 'Pending', running: 'In progress', completed: 'Completed',
  waiting_user: 'Waiting for your answer', waiting_platform: 'Waiting for store confirmation',
  handed_off: 'Sent to the store', partial: 'Partially completed', failed: 'Failed',
  uncertain: 'Needs checking', cancelled: 'Cancelled',
})
</script>

<style scoped>
.ai-chat-task-plan {
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  font-size: 12px;
}

.ai-chat-task-plan summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text-secondary);
}

.ai-chat-task-plan summary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.ai-chat-task-plan ol {
  margin: 8px 0 0;
  padding-inline-start: 20px;
}

.ai-chat-task-plan li + li {
  margin-block-start: 4px;
}

.ai-chat-task-plan small {
  display: block;
  color: var(--text-secondary);
}
</style>
