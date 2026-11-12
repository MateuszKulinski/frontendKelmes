<template>
  <div class="panel-layout content-container">
    <button class="panel-layout__menu" type="button" :aria-expanded="sidebarOpen" @click="sidebarOpen = !sidebarOpen">
      <BaseIcon name="hamburger" /> {{ t('menu.panel') }}
    </button>
    <PanelSidebar :open="sidebarOpen" />
    <main class="panel-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseIcon from '@/views/shared/ui/BaseIcon.vue'
import PanelSidebar from './components/panel-sidebar/PanelSidebar.vue'

const { t } = useI18n()
const sidebarOpen = ref(true)

onMounted(() => {
  if (window.innerWidth <= 900) sidebarOpen.value = false
})
</script>

<style scoped>
.panel-layout {
  display: flex;
  gap: 26px;
  width: 100%;
  min-height: 0;
}
.panel-main { flex: 1; min-width: 0; min-height: 0; }
.panel-layout__menu { display: none; }

@media (max-width: 900px) {
  .panel-layout { flex-direction: column; gap: 0; }
  .panel-layout__menu {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    gap: 8px;
    margin-top: 16px;
    padding: 8px 12px;
    border: 1px solid #dfe5ef;
    border-radius: 6px;
    background: #fff;
    color: #003db8;
    font-weight: 700;
  }
}
</style>
