export default [
    {
        path: 'documents',
        name: 'admin.docs',
        component: () => import('@admin/dynamic/pages/docs/list/DocsList.vue')
    },
    {
        path: 'document/:id',
        name: 'admin.doc',
        component: () => import('@admin/dynamic/pages/docs/view/DocsView.vue')
    },
]