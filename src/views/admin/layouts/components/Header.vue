<template>
  <header class="app-header">
    <div class="topbar">
      <div class="container-fluid d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <img src="/img/logo.png" alt="Logo" style="height: 40px" />
        </div>

        <div class="d-flex align-items-center gap-3">
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import LanguageSwitcher from "@topbar/LanguageSwitcher.vue";
import UserMenu from "@topbar/UserMenu.vue";
</script>