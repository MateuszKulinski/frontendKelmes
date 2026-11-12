export default [
  {
    path: "categories",
    name: "admin.categories",
    component: () =>
      import("@/views/admin/dynamic/pages/categories/list/CategoriesList.vue"),
  },
  {
    path: "category/:id/edit",
    name: "admin.category.edit",
    component: () =>
      import("@admin/dynamic/pages/categories/edit/CategoryEdit.vue"),
  },
  {
    path: "category/:id/edit/filters",
    name: "admin.category.edit.filters",
    component: () =>
      import("@admin/dynamic/pages/categories/edit/CategoryFilters.vue"),
  },
];
