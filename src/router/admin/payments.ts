export default [
    {
        path: 'payments',
        name: 'admin.payments',
        component: () => import('@admin/dynamic/pages/payments/Payments.vue')
    },
    {
        path: 'payment/:id',
        name: 'admin.payment',
        component: () => import('@admin/dynamic/pages/payments/view/PaymentView.vue')
    },
    {
        path: 'payment/:id/edit',
        name: 'admin.payment.edit',
        component: () => import('@admin/dynamic/pages/payments/edit/PaymentEdit.vue')
    },
    {
        path: 'payment/create',
        name: 'admin.payment.create',
        component: () => import('@admin/dynamic/pages/payments/create/PaymentCreate.vue')
    },
]