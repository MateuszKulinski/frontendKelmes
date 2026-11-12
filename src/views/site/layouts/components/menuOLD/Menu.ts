import { ref } from "vue";

const activeMenuId = ref<number | null>(null);

export function useMenu() {
    function open(id: number) {
        activeMenuId.value = id;
    }

    function close() {
        activeMenuId.value = null;
    }

    function isOpen(id: number) {
        return activeMenuId.value === id;
    }

    return {
        activeMenuId,
        open,
        close,
        isOpen,
    };
}