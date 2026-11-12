import { defineStore } from 'pinia'
import type { Component } from 'vue'

export const useModalStore = defineStore('modal', {
    state: () => ({
        open: false as boolean,
        component: null as Component | null,
        props: {} as Record<string, any>,
        locked: false as boolean,
    }),

    actions: {
        openModal(component: Component, props: Record<string, any> = {}) {
            this.component = component;
            this.props = props;
            this.open = true;
            this.locked = false;
        },

        closeModal() {
            if (this.locked) return;
            this.open = false;
            this.component = null;
            this.props = {};
        },

        lock() {
            this.locked = true;
        },

        unlock() {
            this.locked = false;
        },
    }
})