export default [
    {
        path: 'site-meta-data',
        name: 'admin.site-meta-data',
        component: () => import('@admin/dynamic/pages/siteMetaData/SiteMetaDataView.vue'),
        meta: { title: 'siteMetaData.title', requiresSuperAdmin: true },
    },
];
