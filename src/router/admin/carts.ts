export default [
    {
        path: 'carts',
        name: 'admin.carts',
        component: () => import('@admin/dynamic/pages/carts/list/CartsList.vue')
    },
    {
        path: 'carts/:id',
        name: 'admin.cart',
        component: () => import('@admin/dynamic/pages/carts/view/CartView.vue')
    },
]