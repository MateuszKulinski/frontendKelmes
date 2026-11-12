export default [
    {
        path: 'addresses/:id/view',
        name: 'admin.address',
        component: () => import('@admin/dynamic/pages/addresses/view/AddressView.vue')
    },
]