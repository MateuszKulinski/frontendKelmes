
/**
 * Subject z backendu
 */
export interface NewsletterSubject {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Subject z formularza (create / edit)
 */
export interface NewsletterSubjectLang {
    lang_id: number;
    name: string;
}

/**
 * Formularz create/edit
 */
export interface NewsletterSubjectForm {
    langs: NewsletterSubjectLang[];
}

/**
 * Subscriber
 */
export interface NewsletterSubscriber {
    id: number;
    email: string;
    name: string | null;
    status: boolean;
    subjects: NewsletterSubject[];
}

/**
 * Payload subscribe
 */
export interface NewsletterSubscribePayload {
    email: string;
    name?: string;
    subjects?: number[];
}

/**
 * Standardowa odpowiedź API
 */
export interface NewsletterResponse {
    status: "success" | "error";
    message?: string;
}


export interface NewsletterSubscribeState {
    email: string;
    accepted: boolean;

    loading: boolean;
    subjectsLoading: boolean;

    subjects: NewsletterSubject[];
    selectedSubjects: number[];
}

export interface NewsletterComposable {
    state: NewsletterSubscribeState;

    isValidEmail: Readonly<boolean>;

    validate(): boolean;
    loadSubjects(): Promise<void>;
    subscribe(useSelectedSubjects?: boolean): Promise<boolean>;
    reset(): void;
}