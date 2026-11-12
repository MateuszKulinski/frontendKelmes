export default [
    {
        path: 'banners',
        name: 'admin.banners',
        component: () => import('@admin/dynamic/pages/banners/Banners.vue')
    },
    {
        path: 'banner/create',
        name: 'admin.banner.create',
        component: () => import('@admin/dynamic/pages/banners/create/BannerCreate.vue')
    },
    {
        path: 'banner/:id/edit',
        name: 'admin.banner.edit',
        component: () => import('@admin/dynamic/pages/banners/edit/BannerEdit.vue')
    },
]