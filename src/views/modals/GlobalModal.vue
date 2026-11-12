<template>
  <teleport to="body">
    <div v-if="modal.open" class="modal-backdrop vovas" @click="handleBackdrop">
      <div class="modal-box" :style="modalWidth ? { '--modal-width': modalWidth } : undefined" @click.stop>
        <header v-if="modalTitle" class="modal-header">
          <h3 class="modal-title">
            {{ modalTitle }}
          </h3>

          <button type="button" class="modal-close" aria-label="Close" @click="close">
            <BaseIcon name="x" />
          </button>
        </header>

        <div class="modal-content">
          <component :is="modal.component" v-bind="componentProps" />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGlobalModal } from "./GlobalModal";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";

const {
  modal,
  close,
  handleBackdrop,
} = useGlobalModal();

const modalTitle = computed(() => {
  return modal.props?.modalTitle ?? null;
});

const modalWidth = computed(() => modal.props?.modalWidth ?? null);

const componentProps = computed(() => {
  if (!modal.props) {
    return {};
  }

  const {
    modalTitle: _modalTitle,
    modalWidth: _modalWidth,
    ...props
  } = modal.props;

  return props;
});
</script>

<style scoped src="./GlobalModal.css"></style>
