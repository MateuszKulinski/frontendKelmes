export default [
    {
        path: 'cms',
        name: 'admin.cms',
        component: () => import('@admin/dynamic/pages/cms/Cms.vue')
    },
    {
        path: 'cms/create',
        name: 'admin.cms.create',
        component: () => import('@admin/dynamic/pages/cms/create/CmsCreate.vue')
    },
    {
        path: 'cms/:id/edit',
        name: 'admin.cms.edit',
        component: () => import('@admin/dynamic/pages/cms/edit/CmsEdit.vue')
    },
]