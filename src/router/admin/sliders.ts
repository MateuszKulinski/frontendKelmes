export default [
    {
        path: 'sliders',
        name: 'admin.sliders',
        component: () => import('@admin/dynamic/pages/sliders/Slider.vue')
    },
    {
        path: 'sliders/create',
        name: 'admin.slider.create',
        component: () => import('@admin/dynamic/pages/sliders/create/SliderCreate.vue')
    },
    {
        path: 'sliders/:id/edit',
        name: 'admin.slider.edit',
        component: () => import('@admin/dynamic/pages/sliders/edit/SliderEdit.vue')
    },
]