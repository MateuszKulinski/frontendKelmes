<template>
  <div class="mega-root" @mouseenter="opened = true" @mouseleave="opened = false" @focusout="onFocusOut">
    <button type="button" class="trigger" :aria-expanded="opened" @click="opened = !opened"
      @keydown.esc="opened = false">
      <BaseIcon name="hamburger" />
      <span>{{ item.name }}</span>
    </button>

    <Transition name="mega">
      <div v-if="opened" class="mega-panel" @keydown.esc="opened = false">
        <div class="mega-column">
          <div class="column-heading">
            <strong>{{ item.name }}</strong>
            <router-link v-if="item.url" :to="resolve(item.url)" @click="opened = false">{{ t('menu.all')
            }}</router-link>
          </div>
          <ul class="category-list">
            <li v-for="cat in visibleCategories" :key="cat.id">
              <router-link v-if="cat.url" :to="resolve(cat.url)" class="cat" :class="{ active: active?.id === cat.id }"
                @mouseenter="active = cat" @focus="active = cat" @click="opened = false">
                <span>{{ cat.name }}</span><span v-if="cat.children.length" aria-hidden="true">›</span>
              </router-link>
              <button v-else type="button" class="cat" :class="{ active: active?.id === cat.id }"
                @mouseenter="active = cat" @focus="active = cat" @click="active = cat">
                <span>{{ cat.name }}</span><span v-if="cat.children.length" aria-hidden="true">›</span>
              </button>
            </li>
          </ul>
          <button v-if="hiddenCount" class="more-button" type="button" :aria-expanded="showAll"
            @click="showAll = !showAll">
            {{ showAll ? t('menu.less') : t('menu.more') }} <span v-if="!showAll">+{{ hiddenCount }}</span>
          </button>
        </div>

        <div class="mega-column sub-column" v-if="active">
          <div class="column-heading">
            <strong>{{ active.name }}</strong>
            <router-link v-if="active.url" :to="resolve(active.url)" @click="opened = false">{{ t('menu.all')
            }}</router-link>
          </div>
          <ul class="category-list">
            <li v-for="child in visibleChildren" :key="child.id">
              <router-link v-if="child.url" :to="resolve(child.url)" class="sub" @click="opened = false">{{ child.name
              }}</router-link>
              <span v-else class="sub">{{ child.name }}</span>
            </li>
          </ul>
          <button v-if="hasMoreChildren" type="button" class="all-categories" :aria-expanded="showAllChildren"
            @click="showAllChildren = !showAllChildren">
            {{ showAllChildren ? t('menu.less') : t('menu.allCategories') }} {{ showAllChildren ? '↑' : '↓' }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">

import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import { useUrlResolver, type UrlObject } from '@/composables/useUrlResolver'

const MAX_VISIBLE_CATEGORIES = 10
const MAX_VISIBLE_CHILDREN = 10

interface CategoryNode {
  id: number
  name: string
  url: UrlObject
  children: CategoryNode[]
  has_children?: boolean
}

interface RootItem extends CategoryNode {
  type: string
}

const props = defineProps<{ item: RootItem }>()

const { resolve } = useUrlResolver()
const { t } = useI18n()
const route = useRoute()

const opened = ref(false)
const showAll = ref(false)
const showAllChildren = ref(false)
const active = ref<CategoryNode | null>(null)

const categories = computed(() => props.item.children || [])

const visibleCategories = computed(() =>
  showAll.value
    ? categories.value
    : categories.value.slice(0, MAX_VISIBLE_CATEGORIES)
)

const hiddenCount = computed(() =>
  Math.max(0, categories.value.length - MAX_VISIBLE_CATEGORIES)
)

const visibleChildren = computed(() =>
  showAllChildren.value
    ? active.value?.children || []
    : active.value?.children?.slice(0, MAX_VISIBLE_CHILDREN) || []
)

const hasMoreChildren = computed(() =>
  (active.value?.children.length || 0) > MAX_VISIBLE_CHILDREN
)

watch(
  categories,
  (list) => {
    active.value = list[0] || null
  },
  { immediate: true }
)

watch(active, () => {
  showAllChildren.value = false
})

watch(
  () => route.fullPath,
  () => {
    opened.value = false
    showAll.value = false
    showAllChildren.value = false
  }
)

function onFocusOut(event: FocusEvent) {
  const currentTarget = event.currentTarget as HTMLElement
  const nextTarget = event.relatedTarget as Node | null

  if (!currentTarget.contains(nextTarget)) {
    opened.value = false
  }
}

</script>

<style scoped src="./MegaMenu.css"></style>
