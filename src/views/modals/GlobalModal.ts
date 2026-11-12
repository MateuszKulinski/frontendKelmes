import { onMounted, onBeforeUnmount } from "vue";

import { useModalStore } from "@/core/stores/modalStore";

export function useGlobalModal() {
  const modal = useModalStore();

  const canClose = () => !modal.locked;

  const close = () => {
    if (!canClose()) {
      return;
    }

    modal.closeModal();
  };

  const handleBackdrop = () => {
    close();
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      close();
    }
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKey);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKey);
  });

  return {
    modal,
    close,
    handleBackdrop,
  };
}
