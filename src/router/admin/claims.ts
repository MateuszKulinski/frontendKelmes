export default [
  {
    path: "claims",
    name: "admin.claims",
    component: () => import("@admin/dynamic/pages/claims/ClaimsList.vue"),
  },
  {
    path: "claims/:id/edit",
    name: "admin.claim.edit",
    component: () =>
      import("@/views/site/dynamic/panel/claims/docs/view/ClaimCaseEditView.vue"),
  },
  {
    path: "claims/:id",
    name: "admin.claim",
    component: () =>
      import("@/views/site/dynamic/panel/claims/docs/view/ClaimCaseView.vue"),
  },
];
