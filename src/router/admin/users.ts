import Users from '@/views/admin/dynamic/pages/users/Users.vue';

export default [
    {
        path: 'users',
        name: 'admin.users',
        component: Users
    },
    {
        path: 'users/create',
        name: 'admin.users.create',
        component: () => import('@/views/admin/dynamic/pages/users/create/UserCreate.vue')
    },
    {
        path: 'users/:id/edit',
        name: 'admin.users.edit',
        component: () => import('@/views/admin/dynamic/pages/users/edit/UserEdit.vue')
    },
    {
        path: 'users/:id/view',
        name: 'admin.user',
        component: () => import('@admin/dynamic/pages/users/view/UserView.vue')
    },

]