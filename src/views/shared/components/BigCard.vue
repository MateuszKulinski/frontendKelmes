<template>
  <div :class="cardClass">

    <!-- HEADER -->
    <div v-if="$slots.header || title || $slots.actions"
      class="card-header d-flex justify-content-between align-items-center">
      <div>
        <h5 v-if="title" class="mb-0">
          {{ title }}
        </h5>
        <slot name="header" />
      </div>

      <!-- akcje po prawej -->
      <div v-if="$slots.actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- BODY -->
    <div :class="bodyClass">
      <slot />
    </div>

    <!-- FOOTER -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  title?: string;
  class?: string;
  bodyClass?: string;
  variant?: "default" | "borderless";
}>(), {
  title: "",
  class: "",
  bodyClass: "",
  variant: "default"
});

const cardClass = computed(() => [
  "card",
  "shadow-sm",
  "big-card",
  props.variant === "borderless" ? "border-0" : "",
  props.class
]);

const bodyClass = computed(() => [
  "card-body",
  props.bodyClass || "p-4"
]);
</script>

<style scoped>
.big-card {
  border-radius: var(--radius-md);
}

.card-header {
  background: var(--light_blue);
}

.card-body {
  padding: var(--padding-xl);
}
</style>