export default [
  {
    path: "limits",
    name: "admin.limits",
    component: () => import("@admin/dynamic/pages/limits/list/LimitList.vue"),
  },
  {
    path: "limits/create",
    name: "admin.limits.create",
    component: () => import("@admin/dynamic/pages/limits/create/LimitCreate.vue"),
  },
  {
    path: "limits/:id/edit",
    name: "admin.limits.edit",
    component: () => import("@admin/dynamic/pages/limits/edit/LimitEdit.vue"),
  },
];
