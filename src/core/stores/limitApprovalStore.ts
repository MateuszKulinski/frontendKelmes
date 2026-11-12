import { defineStore } from "pinia";

export const useLimitApprovalStore = defineStore("limitApproval", {
  state: () => ({
    pendingCount: 0,
  }),
});
