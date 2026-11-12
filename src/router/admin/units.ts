export default [
    {
        path: 'unit',
        name: 'admin.units',
        component: () => import('@/views/admin/dynamic/pages/units/list/UnitList.vue')
    },
    {
        path: 'units/:id/view',
        name: 'admin.unit',
        component: () => import('@admin/dynamic/pages/units/view/UnitView.vue')
    },
    {
        path: 'units/:id/edit',
        name: 'admin.units.edit',
        component: () => import('@admin/dynamic/pages/units/view/UnitView.vue')
    },
]