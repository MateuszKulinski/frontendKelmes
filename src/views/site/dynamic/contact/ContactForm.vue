<template>
    <div class="col-12 col-lg-6">
        <div class="contact-section__header mb-4">
            <h2 class="h3 mb-2">
                {{ t('contact.title') }}
            </h2>

            <p class="text-muted mb-0">
                {{ t('contact.description') }}
            </p>
        </div>

        <form @submit.prevent="submitForm" novalidate>
            <div class="row g-3">

                <!-- Temat -->
                <div class="col-12">
                    <BaseLabel for-id="contact-subject" :required="true" :error="!!errors.subject">
                        {{ t('contact.fields.subject') }}
                    </BaseLabel>

                    <BaseInput id="contact-subject" v-model="form.subject" :placeholder="t('contact.placeholders.subject')
                        " :error="!!errors.subject" autocomplete="off" @blur="validateField('subject')" />

                    <small v-if="errors.subject" class="text-danger d-block mt-1">
                        {{ errors.subject }}
                    </small>
                </div>

                <!-- Firma -->
                <div class="col-12 col-md-6">
                    <BaseLabel for-id="contact-company" :error="!!errors.company">
                        {{ t('contact.fields.company') }}
                    </BaseLabel>

                    <BaseInput id="contact-company" v-model="form.company" :placeholder="t('contact.placeholders.company')
                        " :error="!!errors.company" autocomplete="organization" @blur="validateField('company')" />

                    <small v-if="errors.company" class="text-danger d-block mt-1">
                        {{ errors.company }}
                    </small>
                </div>

                <!-- Imię -->
                <div class="col-12 col-md-6">
                    <BaseLabel for-id="contact-first-name" :required="true" :error="!!errors.firstName">
                        {{ t('contact.fields.firstName') }}
                    </BaseLabel>

                    <BaseInput id="contact-first-name" v-model="form.firstName" :placeholder="t('contact.placeholders.firstName')
                        " :error="!!errors.firstName" autocomplete="given-name"
                        @blur="validateField('firstName')" />

                    <small v-if="errors.firstName" class="text-danger d-block mt-1">
                        {{ errors.firstName }}
                    </small>
                </div>

                <!-- Nazwisko -->
                <div class="col-12 col-md-6">
                    <BaseLabel for-id="contact-last-name" :required="true" :error="!!errors.lastName">
                        {{ t('contact.fields.lastName') }}
                    </BaseLabel>

                    <BaseInput id="contact-last-name" v-model="form.lastName" :placeholder="t('contact.placeholders.lastName')
                        " :error="!!errors.lastName" autocomplete="family-name"
                        @blur="validateField('lastName')" />

                    <small v-if="errors.lastName" class="text-danger d-block mt-1">
                        {{ errors.lastName }}
                    </small>
                </div>

                <!-- Telefon -->
                <div class="col-12 col-md-6">
                    <BaseLabel for-id="contact-phone" :required="true" :error="!!errors.phone">
                        {{ t('contact.fields.phone') }}
                    </BaseLabel>

                    <BaseInput id="contact-phone" v-model="form.phone" type="tel" :placeholder="t('contact.placeholders.phone')
                        " :error="!!errors.phone" autocomplete="tel" @blur="validateField('phone')" />

                    <small v-if="errors.phone" class="text-danger d-block mt-1">
                        {{ errors.phone }}
                    </small>
                </div>

                <!-- Email -->
                <div class="col-12 col-md-6">
                    <BaseLabel for-id="contact-email" :required="true" :error="!!errors.email">
                        {{ t('contact.fields.email') }}
                    </BaseLabel>

                    <BaseInput id="contact-email" v-model="form.email" type="email" :placeholder="t('contact.placeholders.email')
                        " :error="!!errors.email" autocomplete="email" @blur="validateField('email')" />

                    <small v-if="errors.email" class="text-danger d-block mt-1">
                        {{ errors.email }}
                    </small>
                </div>

                <!-- Wiadomość -->
                <div class="col-12">
                    <BaseLabel for-id="contact-message" :required="true" :error="!!errors.message">
                        {{ t('contact.fields.message') }}
                    </BaseLabel>

                    <textarea id="contact-message" v-model="form.message" class="form-control" rows="6" :placeholder="t('contact.placeholders.message')
                        " :class="{
                                    'is-invalid':
                                        !!errors.message,
                                }" @blur="validateField('message')" />

                    <small v-if="errors.message" class="text-danger d-block mt-1">
                        {{ errors.message }}
                    </small>
                </div>

                <!-- Obowiązkowa zgoda -->
                <div class="col-12">
                    <div class="form-check">
                        <input id="contact-consent" v-model="form.consent" type="checkbox" class="form-check-input"
                            :class="{
                                'is-invalid':
                                    !!errors.consent,
                            }" @change="
                                    validateField('consent')
                                    " />

                        <label for="contact-consent" class="form-check-label">
                            {{ t('contact.fields.consent') }}
                            <span class="text-danger">
                                *
                            </span>
                        </label>
                    </div>

                    <small v-if="errors.consent" class="text-danger d-block mt-1">
                        {{ errors.consent }}
                    </small>
                </div>

                <!-- reCAPTCHA -->
                <div class="col-12">
                    <div ref="recaptchaContainer" class="contact-recaptcha" />

                    <small v-if="errors.recaptcha" class="text-danger d-block mt-1">
                        {{ errors.recaptcha }}
                    </small>
                </div>

                <!-- Submit -->
                <div class="col-12 d-flex justify-content-end">
                    <BaseButton type="submit" variant="primary" size="md" :loading="isSubmitting"
                        :disabled="isSubmitting">
                        {{ t('contact.buttons.submit') }}
                    </BaseButton>
                </div>
            </div>

            <!-- Success -->
            <div v-if="successMessage" class="alert alert-success mt-4 mb-0" role="status">
                {{ successMessage }}
            </div>

            <!-- Error -->
            <div v-if="submitError" class="alert alert-danger mt-4 mb-0" role="alert">
                {{ submitError }}
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import {
    nextTick,
    onBeforeUnmount,
    onMounted,
    reactive,
    ref,
} from 'vue';

import { useI18n } from 'vue-i18n';

import BaseButton from '@shared/ui/BaseButton.vue';
import BaseInput from '@shared/ui/BaseInput.vue';
import BaseLabel from '@shared/ui/BaseLabel.vue';

type FormField =
    | 'subject'
    | 'company'
    | 'firstName'
    | 'lastName'
    | 'phone'
    | 'email'
    | 'message'
    | 'consent'
    | 'recaptcha';

interface ContactForm {
    subject: string;
    company: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    message: string;
    consent: boolean;
}

interface ContactErrors {
    subject?: string;
    company?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    message?: string;
    consent?: string;
    recaptcha?: string;
}

interface RecaptchaInstance {
    render: (
        element: HTMLElement,
        options: {
            sitekey: string;
            callback?: (token: string) => void;
            'expired-callback'?: () => void;
            'error-callback'?: () => void;
        },
    ) => number;

    getResponse: (
        widgetId?: number,
    ) => string;

    reset: (
        widgetId?: number,
    ) => void;
}

declare global {
    interface Window {
        grecaptcha?: RecaptchaInstance;
    }
}

const { t } = useI18n();

const emit = defineEmits<{
    (
        event: 'submit',
        formData: FormData,
    ): void;
}>();

const form = reactive<ContactForm>({
    subject: '',
    company: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: '',
    consent: false,
});

const errors = reactive<ContactErrors>({});

const isSubmitting = ref(false);
const successMessage = ref('');
const submitError = ref('');

const recaptchaContainer =
    ref<HTMLElement | null>(null);

const recaptchaToken = ref('');

const recaptchaWidgetId =
    ref<number | null>(null);

const RECAPTCHA_SITE_KEY =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY as string;

let recaptchaScript:
    | HTMLScriptElement
    | null = null;

/**
 * Load Google reCAPTCHA script.
 */
const loadRecaptcha = (): Promise<void> => {
    if (window.grecaptcha) {
        return Promise.resolve();
    }

    return new Promise(
        (resolve, reject) => {
            const existingScript =
                document.querySelector(
                    'script[src="https://www.google.com/recaptcha/api.js"]',
                ) as HTMLScriptElement | null;

            if (existingScript) {
                existingScript.addEventListener(
                    'load',
                    () => resolve(),
                );

                existingScript.addEventListener(
                    'error',
                    reject,
                );

                return;
            }

            recaptchaScript =
                document.createElement(
                    'script',
                );

            recaptchaScript.src =
                'https://www.google.com/recaptcha/api.js?render=explicit';

            recaptchaScript.async = true;
            recaptchaScript.defer = true;

            recaptchaScript.onload =
                () => resolve();

            recaptchaScript.onerror =
                () =>
                    reject(
                        new Error(
                            'reCAPTCHA script failed to load',
                        ),
                    );

            document.head.appendChild(
                recaptchaScript,
            );
        },
    );
};

/**
 * Render reCAPTCHA.
 */
const renderRecaptcha = async () => {
    if (
        !recaptchaContainer.value ||
        !RECAPTCHA_SITE_KEY
    ) {
        errors.recaptcha = t(
            'contact.validation.recaptcha_config',
        );

        return;
    }

    try {
        await loadRecaptcha();

        await nextTick();

        if (
            !window.grecaptcha ||
            !recaptchaContainer.value
        ) {
            errors.recaptcha = t(
                'contact.validation.recaptcha_error',
            );

            return;
        }

        recaptchaWidgetId.value =
            window.grecaptcha.render(
                recaptchaContainer.value,
                {
                    sitekey:
                        RECAPTCHA_SITE_KEY,

                    callback: (
                        token: string,
                    ) => {
                        recaptchaToken.value =
                            token;

                        delete errors.recaptcha;
                    },

                    'expired-callback': () => {
                        recaptchaToken.value =
                            '';

                        errors.recaptcha =
                            t(
                                'contact.validation.recaptcha_required',
                            );
                    },

                    'error-callback': () => {
                        recaptchaToken.value =
                            '';

                        errors.recaptcha =
                            t(
                                'contact.validation.recaptcha_error',
                            );
                    },
                },
            );
    } catch {
        errors.recaptcha = t(
            'contact.validation.recaptcha_error',
        );
    }
};

/**
 * Validate single field.
 */
const validateField = (
    field: FormField,
) => {
    delete errors[field];

    switch (field) {
        case 'subject':
            if (!form.subject.trim()) {
                errors.subject = t(
                    'contact.validation.subject_required',
                );
            }

            break;

        case 'firstName':
            if (!form.firstName.trim()) {
                errors.firstName = t(
                    'contact.validation.first_name_required',
                );
            }

            break;

        case 'lastName':
            if (!form.lastName.trim()) {
                errors.lastName = t(
                    'contact.validation.last_name_required',
                );
            }

            break;

        case 'phone': {
            if (!form.phone.trim()) {
                errors.phone = t(
                    'contact.validation.phone_required',
                );

                break;
            }

            const phoneRegex =
                /^[+0-9\s().-]{7,20}$/;

            if (
                !phoneRegex.test(
                    form.phone.trim(),
                )
            ) {
                errors.phone = t(
                    'contact.validation.phone_invalid',
                );
            }

            break;
        }

        case 'email': {
            if (!form.email.trim()) {
                errors.email = t(
                    'contact.validation.email_required',
                );

                break;
            }

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !emailRegex.test(
                    form.email.trim(),
                )
            ) {
                errors.email = t(
                    'contact.validation.email_invalid',
                );
            }

            break;
        }

        case 'message':
            if (!form.message.trim()) {
                errors.message = t(
                    'contact.validation.message_required',
                );
            }

            break;

        case 'consent':
            if (!form.consent) {
                errors.consent = t(
                    'contact.validation.consent_required',
                );
            }

            break;

        case 'recaptcha':
            if (!recaptchaToken.value) {
                errors.recaptcha = t(
                    'contact.validation.recaptcha_required',
                );
            }

            break;

        case 'company':
            // Firma jest opcjonalna.
            break;
    }
};

/**
 * Validate whole form.
 */
const validateForm = (): boolean => {
    validateField('subject');
    validateField('firstName');
    validateField('lastName');
    validateField('phone');
    validateField('email');
    validateField('message');
    validateField('consent');
    validateField('recaptcha');

    return (
        Object.keys(errors).length === 0
    );
};

/**
 * Create FormData for API.
 */
const createFormData = (): FormData => {
    const formData = new FormData();

    formData.append(
        'subject',
        form.subject.trim(),
    );

    formData.append(
        'company',
        form.company.trim(),
    );

    formData.append(
        'firstName',
        form.firstName.trim(),
    );

    formData.append(
        'lastName',
        form.lastName.trim(),
    );

    formData.append(
        'phone',
        form.phone.trim(),
    );

    formData.append(
        'email',
        form.email.trim(),
    );

    formData.append(
        'message',
        form.message.trim(),
    );

    formData.append(
        'consent',
        form.consent ? '1' : '0',
    );

    formData.append(
        'recaptchaToken',
        recaptchaToken.value,
    );

    return formData;
};

/**
 * Reset form.
 */
const resetForm = () => {
    form.subject = '';
    form.company = '';
    form.firstName = '';
    form.lastName = '';
    form.phone = '';
    form.email = '';
    form.message = '';
    form.consent = false;

    recaptchaToken.value = '';

    Object.keys(errors).forEach(
        (key) => {
            delete errors[
                key as FormField
            ];
        },
    );

    if (
        window.grecaptcha &&
        recaptchaWidgetId.value !== null
    ) {
        window.grecaptcha.reset(
            recaptchaWidgetId.value,
        );
    }
};

/**
 * Handle backend validation errors.
 */
const handleValidationError = (
    backendErrors: Record<
        string,
        string[] | string
    >,
) => {
    Object.keys(errors).forEach(
        (key) => {
            delete errors[
                key as FormField
            ];
        },
    );

    Object.entries(
        backendErrors,
    ).forEach(
        ([field, messages]) => {
            const message =
                Array.isArray(messages)
                    ? messages[0]
                    : messages;

            let normalizedField =
                field;

            if (
                field ===
                'recaptchaToken'
            ) {
                normalizedField =
                    'recaptcha';
            }

            if (
                normalizedField in errors ||
                normalizedField ===
                'recaptcha'
            ) {
                errors[
                    normalizedField as FormField
                ] = message;
            }
        },
    );
};

/**
 * Submit form.
 */
const submitForm = () => {
    successMessage.value = '';
    submitError.value = '';

    if (!validateForm()) {
        return;
    }

    isSubmitting.value = true;

    emit(
        'submit',
        createFormData(),
    );
};

/**
 * Set loading state.
 */
const setSubmitting = (
    value: boolean,
) => {
    isSubmitting.value = value;
};

/**
 * Set success message.
 */
const setSuccess = (
    message: string,
) => {
    successMessage.value = message;
    submitError.value = '';

    setSubmitting(false);

    resetForm();
};

/**
 * Set submit error.
 */
const setError = (
    message: string,
) => {
    submitError.value = message;

    setSubmitting(false);
};

defineExpose({
    handleValidationError,
    setSubmitting,
    setSuccess,
    setError,
    resetForm,
});

onMounted(() => {
    renderRecaptcha();
});

onBeforeUnmount(() => {
    if (
        recaptchaScript?.parentNode
    ) {
        recaptchaScript.parentNode.removeChild(
            recaptchaScript,
        );
    }
});
</script>