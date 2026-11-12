<template>
  <BaseButton type="button" variant="primary" class="ai-chat-search-button" @click="emit('click')">
    <BaseIcon name="sparkle" />
    {{ t('aiChat.search_with_ai') }}
  </BaseButton>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseButton from '@/views/shared/ui/BaseButton.vue'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import './AiChatSearchButton.css'

const emit = defineEmits<{ click: [] }>()
const { t } = useI18n()
</script>
