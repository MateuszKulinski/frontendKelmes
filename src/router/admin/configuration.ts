export default [
  {
    path: "configuration",
    name: "admin.configuration",
    component: () =>
      import("@/views/admin/dynamic/pages/configuration/edit/ConfigurationEdit.vue"),
  },

  {
    path: "features",
    name: "admin.features",
    component: () =>
      import("@/views/admin/dynamic/pages/features/FeaturesList.vue"),
  },
  {
    path: "outlet",
    name: "admin.outlet",
    component: () =>
      import("@/views/admin/dynamic/pages/configuration/OutletSettings.vue"),
  },
];
