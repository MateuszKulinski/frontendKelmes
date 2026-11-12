export default [
    {
        path: 'orders',
        name: 'admin.orders',
        component: () => import('@admin/dynamic/pages/orders/list/OrdersList.vue')
    },
    {
        path: 'orders/statuses',
        name: 'admin.order-statuses',
        component: () => import('@admin/dynamic/pages/orders/statuses/OrderStatusesView.vue')
    },
    {
        path: 'orders/:id',
        name: 'admin.order',
        component: () => import('@admin/dynamic/pages/orders/view/OrderView.vue'),
        props: { isAdmin: true }
    },
]