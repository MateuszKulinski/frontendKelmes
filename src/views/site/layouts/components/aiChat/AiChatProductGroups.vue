<template>
  <section class="ai-chat-result-groups" :aria-label="t('aiChat.product_groups')">
    <div v-if="groups.length > 1" class="ai-chat-groups-heading">
      <strong>{{ t('aiChat.product_groups') }}</strong><span>{{ groups.length }}</span>
    </div>
    <section v-for="(group, index) in groups" :key="group.id" class="ai-chat-result-group"
      :aria-label="group.query" :data-result-group-id="group.id">
      <div class="ai-chat-group-heading">
        <span v-if="groups.length > 1" class="ai-chat-group-number" aria-hidden="true">{{ index + 1 }}</span>
        <h3>{{ group.query }}</h3>
      </div>
      <p v-if="group.message || group.status !== 'ok'" class="ai-chat-note"
        :class="{ 'ai-chat-error': group.status === 'error' }">
        {{ group.message || t(`aiChat.results_${group.status}`) }}
      </p>
      <AiChatProductCarousel v-if="group.products.length" :products="group.products" :label="group.query" :show-title="false" />
      <button v-if="group.hasMore && interactive" type="button" class="ai-chat-text-action" @click="emit('more', group.query)">
        {{ t('aiChat.quick_more') }}<BaseIcon name="arrowRight" class="ai-chat-icon" aria-hidden="true" />
      </button>
    </section>
  </section>
</template>

<script setup lang="ts">
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import { useI18n } from 'vue-i18n'
import AiChatProductCarousel from './AiChatProductCarousel.vue'
import type { AiChatProductGroup } from './aiChatApi'

defineProps<{ groups: AiChatProductGroup[]; interactive: boolean }>()
const emit = defineEmits<{ more: [query: string] }>()
const { t } = useI18n()
</script>
