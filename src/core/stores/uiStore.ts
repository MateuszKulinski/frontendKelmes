import { defineStore } from "pinia";

type ToastType = "success" | "error" | "info";

type Toast = {
    id: number;
    message: string;
    type: ToastType;
};

export const useUiStore = defineStore("ui", {
    state: () => ({
        loading: false,
        toasts: [] as Toast[],
    }),

    actions: {
        // 🔄 LOADER
        showLoader() {
            this.loading = true;
        },
        hideLoader() {
            this.loading = false;
        },

        showToast(message: string, type: ToastType = "info", timeout = 2500) {
            const id = Date.now();

            this.toasts.push({ id, message, type });

            setTimeout(() => {
                this.removeToast(id);
            }, timeout);
        },

        removeToast(id: number) {
            this.toasts = this.toasts.filter(t => t.id !== id);
        },

        // 🎯 HELPERY
        showSuccess(message: string) {
            this.showToast(message, "success");
        },

        showError(message: string) {
            this.showToast(message, "error");
        },

        showInfo(message: string) {
            this.showToast(message, "info");
        },
    },
});