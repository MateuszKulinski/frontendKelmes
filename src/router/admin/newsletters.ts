export default [
    {
        path: 'newsletter-subscribers',
        name: 'admin.newsletterSubscribers',
        component: () => import('@admin/dynamic/pages/newsletterSubscribers/NewsletterSubscribers.vue')
    },
    {
        path: 'newsletter-subjects',
        name: 'admin.newsletterSubjects',
        component: () => import('@admin/dynamic/pages/newsletterSubjects/NewsletterSubjects.vue')
    },
    {
        path: 'newsletter-subjects/create',
        name: 'admin.newsletterSubjects.create',
        component: () => import('@admin/dynamic/pages/newsletterSubjects/create/NewsletterSubjectCreate.vue')
    },
    {
        path: 'newsletter-subjects/:id/edit',
        name: 'admin.newsletterSubjects.edit',
        component: () => import('@admin/dynamic/pages/newsletterSubjects/edit/NewsletterSubjectEdit.vue')
    },
]