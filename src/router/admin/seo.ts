export default [
    {
        path: 'seo',
        name: 'admin.seo',
        component: () => import('@admin/dynamic/pages/seo/SeoView.vue'),
        meta: { title: 'seo.page_title' },
    },
];
