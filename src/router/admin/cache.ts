export default [
    {
        path: 'cache',
        name: 'admin.cache',
        component: () => import('@admin/dynamic/pages/cache/CacheView.vue'),
        meta: { title: 'cache.title', requiresSuperAdmin: true },
    },
];
