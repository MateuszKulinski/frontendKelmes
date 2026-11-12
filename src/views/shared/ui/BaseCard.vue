<template>
  <div class="base-card">
    <header v-if="$slots.header" class="base-card__header">
      <slot name="header" />
    </header>

    <div class="base-card__content">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts"></script>

<style src="./BaseCard.css" scoped></style>