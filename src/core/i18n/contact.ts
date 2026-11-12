import type { ModuleTranslations } from "./buildLang";

const contact: ModuleTranslations = {
  pl: {
    title: "Formularz kontaktowy",
    description:
      "Wypęłnij formularz kontaktowy, a skontaktujemy się z Tobą tak szybko, jak to możliwe.",

    question: "Masz pytania?",
    contactCompany: "Skontaktuj się z",
    loading: "Ładowanie...",

    sections: {
      customerService: "Biuro Obsługi Klienta",
      address: "Adres",
    },

    labels: {
      phone: "Tel:",
      email: "E-mail:",
      openingHours: "Pn-Pt:",
      online: "Online 24h:",
      stationaryStorePhone: "sklep stacjonarny tel:",
      nip: "NIP",
      regon: "REGON",
    },

    missingData: "BRAK DANYCH",

    fields: {
      subject: "Temat",
      company: "Firma",
      firstName: "Imię",
      lastName: "Nazwisko",
      phone: "Telefon",
      email: "E-mail",
      message: "Wiadomość",
      consent: "Wyrażam zgodę na kontakt w sprawie przesłanego zapytania.",
    },

    placeholders: {
      subject: "Temat wiadomości",
      company: "Nazwa firmy",
      firstName: "Jan",
      lastName: "Kowalski",
      phone: "+48 000 000 000",
      email: "jan{'@'}example.com",
      message: "W czym możemy Ci pomóc?",
    },

    buttons: {
      submit: "Wyślij wiadomość",
    },

    validation: {
      subject_required: "Podaj temat wiadomości.",
      first_name_required: "Podaj swoje imię.",
      last_name_required: "Podaj swoje nazwisko.",
      phone_required: "Podaj numer telefonu.",
      phone_invalid: "Podaj poprawny numer telefonu.",
      email_required: "Podaj adres e-mail.",
      email_invalid: "Podaj poprawny adres e-mail.",
      message_required: "Wpisz wiadomość.",
      consent_required: "Wyrażenie zgody na kontakt jest wymagane.",
      recaptcha_required: "Potwierdź, że nie jesteś robotem.",
      recaptcha_error:
        "Nie udało się zweryfikować reCAPTCHA. Spróbuj ponownie.",
      recaptcha_config: "reCAPTCHA nie jest poprawnie skonfigurowana.",
    },

    messages: {
      success: "Dziękujemy za wiadomość. Skontaktujemy się z Tobą wkrótce.",
      error: "Nie udało się wysłać wiadomości. Spróbuj ponownie.",
    },
  },

  en: {
    title: "Contact Form",
    description:
      "Fill out the contact form, and we will get back to you as soon as possible.",

    question: "Have questions?",
    contactCompany: "Contact {{company}}",
    loading: "Loading...",

    sections: {
      customerService: "Customer Service",
      address: "Address",
    },

    labels: {
      phone: "Phone:",
      email: "Email:",
      openingHours: "Mon-Fri:",
      online: "Online 24h:",
      stationaryStorePhone: "store phone:",
      nip: "Tax ID",
      regon: "REGON",
    },

    missingData: "NO DATA",

    fields: {
      subject: "Subject",
      company: "Company",
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone",
      email: "Email",
      message: "Message",
      consent: "I agree to be contacted regarding my inquiry.",
    },

    placeholders: {
      subject: "Message subject",
      company: "Company name",
      firstName: "John",
      lastName: "Smith",
      phone: "+1 000 000 0000",
      email: "john{'@'}example.com",
      message: "How can we help you?",
    },

    buttons: {
      submit: "Send message",
    },

    validation: {
      subject_required: "Please enter the subject.",
      first_name_required: "Please enter your first name.",
      last_name_required: "Please enter your last name.",
      phone_required: "Please enter your phone number.",
      phone_invalid: "Please enter a valid phone number.",
      email_required: "Please enter your email address.",
      email_invalid: "Please enter a valid email address.",
      message_required: "Please enter a message.",
      consent_required: "Your consent to be contacted is required.",
      recaptcha_required: "Please confirm that you are not a robot.",
      recaptcha_error: "The reCAPTCHA verification failed. Please try again.",
      recaptcha_config: "reCAPTCHA is not configured correctly.",
    },

    messages: {
      success: "Thank you for your message. We will get back to you soon.",
      error: "The message could not be sent. Please try again.",
    },
  },

  de: {
    title: "Kontaktformular",
    description:
      "Füllen Sie das Kontaktformular aus, und wir werden uns so schnell wie möglich bei Ihnen melden.",

    question: "Haben Sie Fragen?",

    contactCompany: "Kontaktieren Sie {{company}}",
    loading: "Wird geladen...",

    sections: {
      customerService: "Kundenservice",
      address: "Adresse",
    },

    labels: {
      phone: "Tel.:",
      email: "E-Mail:",
      openingHours: "Mo-Fr:",
      online: "Online 24h:",
      stationaryStorePhone: "Telefon im Ladengeschäft:",
      nip: "Steuer-ID",
      regon: "REGON",
    },

    missingData: "KEINE DATEN",

    fields: {
      subject: "Betreff",
      company: "Unternehmen",
      firstName: "Vorname",
      lastName: "Nachname",
      phone: "Telefon",
      email: "E-Mail",
      message: "Nachricht",
      consent:
        "Ich bin damit einverstanden, bezüglich meiner Anfrage kontaktiert zu werden.",
    },

    placeholders: {
      subject: "Betreff der Nachricht",
      company: "Name des Unternehmens",
      firstName: "Max",
      lastName: "Mustermann",
      phone: "+49 000 000000",
      email: "max{'@'}example.com",
      message: "Wie können wir Ihnen helfen?",
    },

    buttons: {
      submit: "Nachricht senden",
    },

    validation: {
      subject_required: "Bitte geben Sie einen Betreff ein.",
      first_name_required: "Bitte geben Sie Ihren Vornamen ein.",
      last_name_required: "Bitte geben Sie Ihren Nachnamen ein.",
      phone_required: "Bitte geben Sie Ihre Telefonnummer ein.",
      phone_invalid: "Bitte geben Sie eine gültige Telefonnummer ein.",
      email_required: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
      email_invalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      message_required: "Bitte geben Sie eine Nachricht ein.",
      consent_required: "Ihre Zustimmung zur Kontaktaufnahme ist erforderlich.",
      recaptcha_required: "Bitte bestätigen Sie, dass Sie kein Roboter sind.",
      recaptcha_error:
        "Die reCAPTCHA-Verifizierung ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
      recaptcha_config: "reCAPTCHA ist nicht korrekt konfiguriert.",
    },

    messages: {
      success:
        "Vielen Dank für Ihre Nachricht. Wir werden uns bald bei Ihnen melden.",
      error:
        "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
    },
  },
};

export default contact;
