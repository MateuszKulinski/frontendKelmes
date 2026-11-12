<template>
  <div :class="[
    level === 1 ? 'col-lg-3 col-md-4 col-6 mb-3' : 'mb-1',
    `column_lvl_${level}`,
  ]">
    <router-link v-if="item.type !== 'external'" :to="resolve(item.url)" class="d-block text-decoration-none"
      :class="levelClasses" @click="handleClick">
      {{ item.name }}
    </router-link>

    <a v-else :href="item.url?.url" target="_blank" class="d-block text-decoration-none" :class="levelClasses"
      @click="handleClick">
      {{ item.name }}
    </a>

    <div v-if="item.children?.length" :class="{ 'ms-2': level > 1 }">
      <MegaColumn v-for="child in item.children" :key="child.id" :item="child" :level="level + 1" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import MegaColumn from "./MegaColumn.vue";
import { useUrlResolver } from "@/composables/useUrlResolver";
import { useMenu } from "./Menu.ts";

const { resolve } = useUrlResolver();
const { close } = useMenu();

const props = defineProps({
  item: Object,
  level: {
    type: Number,
    default: 1,
  },
});

function handleClick() {
  close();
}

const levelClasses = computed(() => ({
  "fw-bold text-dark mb-2": props.level === 1,
  "fw-semibold text-dark small mb-1": props.level === 2,
  "text-muted small mb-1": props.level >= 3,
}));
</script>