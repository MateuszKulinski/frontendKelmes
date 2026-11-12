<template>
  <teleport to="body">
    <div class="app-layout admin-layout d-flex flex-column min-vh-100">
      <!-- HEADER -->
      <Header />

      <div class="admin-content d-flex flex-grow-1" style="min-height: 0">
        <!-- SIDEBAR -->
        <Sidebar :open="sidebarOpen" @toggle="toggleSidebar" />

        <!-- CONTENT -->
        <main class="content flex-grow-1 p-3">
          <router-view />
        </main>
      </div>
    </div>
    <Loader />
    <ToastContainer />
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Header from "./components/Header.vue";
import Sidebar from "./components/sidebar/Sidebar.vue";
import Loader from "./components/loader/Loader.vue";
import ToastContainer from "./components/toast/ToastContainer.vue";

const sidebarOpen = ref(true);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

onMounted(() => {
  if (window.innerWidth < 768) {
    sidebarOpen.value = false;
  }
});
</script>

<style>
.admin-layout {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.admin-layout .admin-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.admin-layout .content {
  flex: 1;
  overflow-y: auto;
  height: 100%;
  min-height: 0;

  overscroll-behavior: contain;
  padding-right: 6px;

  scrollbar-width: thin;
  scrollbar-color: #c1c7d0 transparent;
}

.admin-layout .content::-webkit-scrollbar-track {
  background: transparent;
}

.admin-layout .content::-webkit-scrollbar {
  width: 8px;
}

.admin-layout .content::-webkit-scrollbar-thumb {
  background-color: rgba(120, 130, 160, 0.5);
  border-radius: 999px;
}

.admin-layout .content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(120, 130, 160, 0.8);
}

.admin-layout .sidebar {
  overflow-y: auto;
  min-height: 0;

  scrollbar-width: thin;
  scrollbar-color: var(--border-strong) transparent;
}

.admin-layout .sidebar.collapsed {
  min-width: 72px;
  transform: none;
  width: 72px;
  flex: 0 0 72px;
}

.admin-layout .sidebar.collapsed .sidebar-header {
  padding-inline: 0;
}



.admin-layout .sidebar::-webkit-scrollbar {
  width: 8px;
}

.admin-layout .sidebar::-webkit-scrollbar-thumb {
  background-color: var(--border-strong);
  border-radius: 999px;
}

.admin-layout .sidebar::-webkit-scrollbar-thumb:hover {
  background-color: var(--text-muted);
}

.admin-layout {
  overscroll-behavior: none;
}

.admin-layout .content {
  scroll-behavior: smooth;
}
</style>