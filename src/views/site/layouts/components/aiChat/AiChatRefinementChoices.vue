<template>
  <section ref="container" class="ai-chat-refinements" :aria-label="t('aiChat.refine_products')">
    <div class="ai-chat-refinement-header">
      <button v-if="activeCategory || activeGroup" ref="backButton" type="button"
        class="ai-chat-refinement-back text-decoration-none" :disabled="disabled" @click="goBack">
        <BaseIcon name="chLeft" />
        {{ t(activeGroup && !directCategoryOptions ? 'aiChat.all_refinement_types' : 'aiChat.all_refinement_categories') }}
      </button>
      <b v-if="activeGroup || activeCategory">{{ activeGroup ? activeGroupLabel : activeCategory?.label }}</b>
      <span v-if="!activeGroup">{{ t(showCategories ? 'aiChat.choose_refinement_category' : 'aiChat.choose_refinement_type') }}</span>
    </div>
    <div v-if="activeGroup" class="ai-chat-choices ai-chat-refinement-values" role="group" :aria-label="activeGroupLabel">
      <button v-for="option in activeGroup.options" :key="option.id" type="button"
        class="ai-chat-choice" :class="{ selected: selectedOptionId === option.id }" :disabled="disabled"
        @click="selectValue(activeGroup, option)">{{ option.label }}</button>
    </div>
    <div v-else class="ai-chat-refinement-groups" :class="{ 'ai-chat-refinement-categories': showCategories }"
      role="group" :aria-label="activeCategory?.label || t(showCategories ? 'aiChat.choose_refinement_category' : 'aiChat.choose_refinement_type')">
      <template v-if="showCategories">
        <button v-for="category in categories" :key="category.id" type="button"
          class="ai-chat-choice ai-chat-refinement-group ai-chat-refinement-category" :disabled="disabled"
          :data-group-id="category.id" @click="openCategory(category.id)">
          <span>{{ category.label }}</span><BaseIcon name="chRight" class="ai-chat-icon" aria-hidden="true" />
        </button>
      </template>
      <button v-for="group in visibleGroups" :key="group.id" type="button"
        class="ai-chat-choice ai-chat-refinement-group" :disabled="disabled" :data-group-id="group.id"
        @click="openGroup(group.id)">
        <span>{{ group.label }}</span><BaseIcon name="chRight" class="ai-chat-icon" aria-hidden="true" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AiChatClarification, AiChatClarificationGroup } from './aiChatApi'
import './AiChatRefinementChoices.css'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'

const props = defineProps<{
  clarification: AiChatClarification
  disabled: boolean
  selectedOptionId?: string
}>()
const emit = defineEmits<{
  select: [option: { id: string; label: string }]
}>()
const { t } = useI18n()
const selectedCategoryId = ref<string | null>(null)
const selectedGroupId = ref<string | null>(null)
const container = ref<HTMLElement | null>(null)
const backButton = ref<HTMLButtonElement | null>(null)
const categories = computed(() => {
  const byId = new Map<string, { id: string; label: string; groups: AiChatClarificationGroup[] }>()
  for (const group of props.clarification.groups ?? []) {
    if (!group.parent_id) continue
    let category = byId.get(group.parent_id)
    if (!category) {
      category = { id: group.parent_id, label: group.parent_label || group.label, groups: [] }
      byId.set(category.id, category)
    }
    category.groups.push(group)
  }
  return [...byId.values()]
})
const activeCategory = computed(() => categories.value.find((category) => category.id === selectedCategoryId.value))
const showCategories = computed(() => categories.value.length > 0 && !activeCategory.value)
const visibleGroups = computed(() => activeCategory.value?.groups
  ?? (props.clarification.groups ?? []).filter((group) => !group.parent_id))
const activeGroup = computed(() => visibleGroups.value.find((group) => group.id === selectedGroupId.value))
// Some category questions contain options directly, without a feature level.
const directCategoryOptions = computed(() => activeCategory.value?.groups.length === 1
  && activeCategory.value.groups[0]?.id === activeCategory.value.id)
const activeGroupLabel = computed(() => [
  activeCategory.value?.label,
  directCategoryOptions.value ? undefined : activeGroup.value?.label,
].filter(Boolean).join(' › '))

watch(() => props.clarification.id, () => {
  selectedCategoryId.value = null
  selectedGroupId.value = null
})

async function openCategory(id: string) {
  if (props.disabled) return
  selectedCategoryId.value = id
  selectedGroupId.value = directCategoryOptions.value ? activeCategory.value?.groups[0]?.id ?? null : null
  await nextTick()
  backButton.value?.focus({ preventScroll: true })
}

async function openGroup(id: string) {
  if (props.disabled) return
  selectedGroupId.value = id
  await nextTick()
  backButton.value?.focus({ preventScroll: true })
}

async function goBack() {
  if (props.disabled) return
  const returningToCategories = !activeGroup.value || directCategoryOptions.value
  const previous = returningToCategories ? selectedCategoryId.value : selectedGroupId.value
  selectedGroupId.value = null
  if (returningToCategories) selectedCategoryId.value = null
  await nextTick()
  const buttons = container.value?.querySelectorAll<HTMLButtonElement>('[data-group-id]')
  Array.from(buttons ?? []).find((button) => button.dataset.groupId === previous)?.focus({ preventScroll: true })
}

function selectValue(group: AiChatClarificationGroup, option: { id: string; label: string }) {
  if (props.disabled) return
  const labels = [activeCategory.value?.label, directCategoryOptions.value ? undefined : group.label, option.label]
  emit('select', { id: option.id, label: labels.filter(Boolean).join(': ') })
}
</script>

<style scoped>
.ai-chat-refinement-header {
  font-size: var(--font-size-md-minus);
}
</style>
