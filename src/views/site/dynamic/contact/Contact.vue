<template>
    <section class="content-container contact-section">
        <div class="row main-contact-container">
            <div class="col-12">
                <h3>
                    {{ t('contact.question') }}
                    <span class="primary-color">
                        {{ t('contact.contactCompany') }} {{ company?.name_short }}
                    </span>
                </h3>

                <div v-if="cmsStore.pageLoading" class="cms-content-loading">
                    {{ t('contact.loading') }}
                </div>

                <div v-else-if="cmsStore.currentPage?.content" class="cms-content"
                    v-html="cmsStore.currentPage.content" />
            </div>

            <div class="contact-row">
                <!-- Biuro Obsługi Klienta -->
                <div class="col-md-12 col-lg-6">
                    <div class="contact-box">
                        <div class="contact-icon">
                            <BaseIcon name="phone" />
                        </div>

                        <div class="contact-content">
                            <h3>
                                {{ t('contact.sections.customerService') }}
                            </h3>

                            <p v-if="company?.phones?.[0]">
                                <BaseIcon class="primary-color" name="phone" />

                                <span>
                                    {{ t('contact.labels.phone') }}
                                </span>

                                {{ company.phones[0] }}
                            </p>

                            <p v-if="company?.emails?.[0]">
                                <BaseIcon class="primary-color" name="email" />

                                <span>
                                    {{ t('contact.labels.email') }}
                                </span>

                                <a :href="`mailto:${company.emails[0]}`">
                                    {{ company.emails[0] }}
                                </a>
                            </p>

                            <p v-if="company?.opening_hours?.week">
                                <BaseIcon class="primary-color" name="clock" />

                                <span>
                                    {{ t('contact.labels.openingHours') }}
                                </span>

                                {{ company.opening_hours.week }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Adres -->
                <div class="col-md-12 col-lg-6">
                    <div class="contact-box">
                        <div class="contact-icon">
                            <BaseIcon name="building" />
                        </div>

                        <div class="contact-content">
                            <h3>
                                {{ t('contact.sections.address') }}
                            </h3>

                            <p v-if="company">
                                <BaseIcon class="primary-color" name="location" />

                                <strong>
                                    {{ company.name }}
                                </strong>

                                <template v-if="company.address.street">
                                    , {{ company.address.street }}
                                </template>

                                <template v-if="company.address.building_number">
                                    {{ company.address.building_number }}
                                </template>

                                <template v-if="company.address.local_number">
                                    /{{ company.address.local_number }}
                                </template>

                                <template v-if="
                                    company.address.zip_code ||
                                    company.address.city
                                ">
                                    ,
                                    {{ company.address.zip_code }}
                                    {{ company.address.city }}
                                </template>
                            </p>

                            <p v-if="company?.phones?.[1]">
                                <BaseIcon class="primary-color" name="phone" />

                                <span>
                                    {{ t('contact.labels.stationaryStorePhone') }}
                                </span>

                                {{ company.phones[1] }}
                            </p>

                            <p v-if="company?.emails?.[1]">
                                <BaseIcon class="primary-color" name="email" />

                                <span>
                                    {{ t('contact.labels.email') }}
                                </span>

                                <a :href="`mailto:${company.emails[1]}`">
                                    {{ company.emails[1] }}
                                </a>
                            </p>

                            <p v-if="company?.nip">
                                <BaseIcon class="primary-color" name="building" />

                                <span>
                                    {{ t('contact.labels.nip') }}
                                </span>

                                {{ company.nip }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="contact-row">

                <ContactForm ref="formRef" @submit="handleSubmit" />

                <div class="col-md-12 col-lg-6">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2943.381076973551!2d15.515762976920056!3d51.9383847791273!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470613da0a2301bf%3A0xbb5fbf817106d7ec!2sCliply!5e1!3m2!1spl!2spl!4v1791184797894!5m2!1spl!2spl"
                        width="100%" height="450" style="border:0;" loading="lazy"
                        referrerpolicy="strict-origin-when-cross-origin" />
                </div>
                <div class="contact-gray-bgr"></div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import api from '@/core/api/axios';
import { useUiStore } from '@/core/stores/uiStore';
import { useCmsStore } from '@/core/stores/cmsStore';
import { usePageMetaData } from '@/composables/usePageMetaData';

import ContactForm from './ContactForm.vue';
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";

import { useContentStore } from "@/core/stores/contentStore";
import { storeToRefs } from 'pinia';


const contentStore = useContentStore();
const { company } = storeToRefs(contentStore);

const { t } = useI18n();

const metadataName = 'contact';
usePageMetaData(metadataName);

interface ContactFormExpose {
    handleValidationError: (
        errors: Record<string, string[] | string>,
    ) => void;

    setSubmitting: (value: boolean) => void;

    setSuccess: (message: string) => void;

    setError: (message: string) => void;

    resetForm: () => void;
}

const ui = useUiStore();
const cmsStore = useCmsStore();

const formRef = ref<ContactFormExpose | null>(null);

onMounted(() => {
    cmsStore.fetchById(22);
});

const handleSubmit = async (formData: FormData) => {
    ui.showLoader();

    try {
        await api.post(
            '/contact',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        );

        formRef.value?.setSuccess(
            t('contact.messages.success'),
        );
    } catch (e: any) {
        if (e.response?.status === 422) {
            formRef.value?.handleValidationError(
                e.response.data?.errors ?? {},
            );
        } else {
            formRef.value?.setError(
                t('contact.messages.error'),
            );
        }
    } finally {
        formRef.value?.setSubmitting(false);
        ui.hideLoader();
    }
};
</script>

<style scoped>
h3 {
    font-weight: bold;
    text-align: center;
    margin-bottom: var(--margin-xxl);
}

.cms-content {
    margin-bottom: 0;
    text-align: center;
}

:deep(.cms-content p) {
    margin-bottom: 0;
    text-align: center;
}

.contact-row {
    gap: var(--gap-md);
    display: flex;
    position: relative;
}

.contact-box {
    position: relative;
    min-height: 198px;

    display: flex;
    align-items: center;
    gap: 60px;

    padding: 28px 55px 28px 70px;

    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 3px;

    box-shadow: 0 2px 7px rgba(0, 0, 0, .08);

    overflow: hidden;
}

.contact-box::before {
    content: "";
    position: absolute;

    left: 0;
    top: 0;

    width: 7px;
    height: 100%;

    background-color: var(--accent, #2868d8);
}

.contact-icon {
    flex: 0 0 78px;

    width: 78px;
    height: 78px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;

    background: var(--accent, #2868d8);

    color: #fff;
    font-size: 34px;
}

.contact-icon :deep(i) {
    line-height: 1;
}

.contact-content {
    flex: 1;
}

.contact-content h3 {
    margin: 0 0 10px;

    text-align: left;
    margin-bottom: var(--margin-md);

    font-size: 16px;
    font-weight: 700;

    color: #111;
}

.contact-content p {
    display: flex;
    align-items: center;
    gap: 7px;

    margin: 0 0 7px !important;

    text-align: left !important;

    font-size: 13px;
    line-height: 1.4;

    color: #111;
}

.contact-content p> :deep(i) {
    flex: 0 0 14px;

    width: 14px;

    text-align: center;

    font-size: 13px;
}

.contact-content p span {
    font-weight: 400;
}

.contact-content p strong {
    white-space: nowrap;
}

.contact-content a {
    color: #2868d8;
    text-decoration: none;
}

.contact-content a:hover {
    text-decoration: underline;
}

.main-contact-container {
    row-gap: var(--gap-mega);
}

.contact-gray-bgr {
    position: absolute;
    left: -100%;
    right: -100%;
    top: -20px;
    bottom: -60px;
    background: #F8FAFC;
    z-index: -1;
}
</style>
