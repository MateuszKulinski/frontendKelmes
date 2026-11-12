export default [
    {
        path: 'manufacturers',
        name: 'admin.manufacturers',
        component: () => import('@admin/dynamic/pages/manufacturers/Manufacturer.vue')
    },
    {
        path: 'manufacturers/create',
        name: 'admin.manufacturer.create',
        component: () => import('@admin/dynamic/pages/manufacturers/create/ManufacturerCreate.vue')
    },
    {
        path: 'manufacturers/:id/edit',
        name: 'admin.manufacturer.edit',
        component: () => import('@admin/dynamic/pages/manufacturers/edit/ManufacturerEdit.vue')
    },
]