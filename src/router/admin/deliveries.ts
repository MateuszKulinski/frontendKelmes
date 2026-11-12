export default [
    {
        path: 'deliveries',
        name: 'admin.deliveries',
        component: () => import('@admin/dynamic/pages/deliveries/Deliveries.vue')
    },
    {
        path: 'delivery/:id',
        name: 'admin.delivery',
        component: () => import('@admin/dynamic/pages/deliveries/view/DeliveryView.vue')
    },
    {
        path: 'delivery/:id/edit',
        name: 'admin.delivery.edit',
        component: () => import('@admin/dynamic/pages/deliveries/edit/DeliveryEdit.vue')
    },
    {
        path: 'delivery/create',
        name: 'admin.delivery.create',
        component: () => import('@admin/dynamic/pages/deliveries/create/DeliveryCreate.vue')
    },
]