export default [
    {
        path: 'news-categories',
        name: 'admin.news-categories',
        component: () => import('@admin/dynamic/pages/newsCategories/NewsCategories.vue')
    },
    {
        path: 'news-categories/create',
        name: 'admin.news-categories.create',
        component: () => import('@admin/dynamic/pages/newsCategories/create/NewsCategoriesCreate.vue')
    },
    {
        path: 'news-categories/:id/edit',
        name: 'admin.news-categories.edit',
        component: () => import('@admin/dynamic/pages/newsCategories/edit/NewsCategoriesEdit.vue')
    },
    {
        path: 'news-categories/:id',
        name: 'admin.news-categories.view',
        component: () => import('@admin/dynamic/pages/newsCategories/view/NewsCategoriesView.vue')
    },
    {
        path: 'news',
        name: 'admin.news',
        component: () => import('@admin/dynamic/pages/news/News.vue')
    },
    {
        path: 'news/create',
        name: 'admin.news.create',
        component: () => import('@admin/dynamic/pages/news/create/NewsCreate.vue')
    },
    {
        path: 'news/:id/edit',
        name: 'admin.news.edit',
        component: () => import('@admin/dynamic/pages/news/edit/NewsEdit.vue')
    },
]