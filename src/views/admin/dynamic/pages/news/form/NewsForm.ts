import { reactive } from "vue";

import { useLangStore } from "@/core/stores/langStore";

interface NewsFormLang {
  lang_id: number;
  title: string;
  short_description: string;
  content: string;
  image: File | null;
  current_image: string | null;
}

export interface NewsAssignment {
  news_relation_type: "category" | "product";
  relation_id: number;
  name?: string;
}

interface NewsFormState {
  news_category_id: number;
  is_active: boolean;
  publish_date: string;
  relations: NewsAssignment[];
  langs: NewsFormLang[];
}

type Emit = (event: "submit", payload: FormData) => void;

export function useNewsForm(emit: Emit, categoryId: number | null) {
  const langStore = useLangStore();

  const form = reactive<NewsFormState>({
    news_category_id: categoryId ?? 0,
    is_active: true,
    publish_date: "",
    relations: [],
    langs: [],
  });

  const errors = reactive<Record<string, string>>({});

  const ensureLangs = () => {
    if (form.langs.length || !langStore.langs.length) {
      return;
    }

    form.langs = langStore.langs.map((lang) => ({
      lang_id: lang.id,
      title: "",
      short_description: "",
      content: "",
      image: null,
      current_image: null,
    }));
  };

  const setFormData = (data: any) => {
    form.news_category_id = data.news_category_id ?? categoryId ?? 0;

    form.is_active = data.is_active ?? true;

    form.relations = data.relations ?? [];

    form.publish_date = data.publish_date
      ? String(data.publish_date).replace(" ", "T").slice(0, 16)
      : "";

    if (data.langs?.length) {
      form.langs = data.langs.map((lang: any) => ({
        lang_id: lang.lang_id,
        title: lang.title ?? "",
        short_description: lang.short_description ?? "",
        content: lang.content ?? "",
        image: null,
        current_image: lang.image_url ?? lang.image ?? null,
      }));
    } else {
      ensureLangs();
    }
  };

  const onLangImageChange = (event: Event, lang: NewsFormLang) => {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      lang.image = null;
      return;
    }

    lang.image = input.files[0];
  };

  const clearErrors = () => {
    Object.keys(errors).forEach((key) => {
      delete errors[key];
    });
  };

  const setBackendErrors = (backendErrors: Record<string, string[]>) => {
    clearErrors();

    Object.entries(backendErrors).forEach(([key, value]) => {
      errors[key] = value?.[0] ?? "";
    });
  };

  const buildFormData = (): FormData => {
    const formData = new FormData();

    if (form.news_category_id > 0) {
      formData.append("news_category_id", String(form.news_category_id));
    }

    formData.append("is_active", String(Number(form.is_active)));

    if (form.publish_date) {
      formData.append("publish_date", form.publish_date);
    }

    form.relations.forEach((relation, index) => {
      formData.append(
        `relations[${index}][news_relation_type]`,
        relation.news_relation_type,
      );

      formData.append(
        `relations[${index}][relation_id]`,
        String(relation.relation_id),
      );
    });

    form.langs.forEach((lang, index) => {
      formData.append(`langs[${index}][lang_id]`, String(lang.lang_id));

      formData.append(`langs[${index}][title]`, lang.title);

      formData.append(
        `langs[${index}][short_description]`,
        lang.short_description ?? "",
      );

      formData.append(`langs[${index}][content]`, lang.content ?? "");

      if (lang.image instanceof File) {
        formData.append(`langs[${index}][image]`, lang.image);
      }
    });

    return formData;
  };

  const submit = () => {
    emit("submit", buildFormData());
  };

  ensureLangs();

  return {
    form,
    errors,

    ensureLangs,
    setFormData,
    onLangImageChange,

    submit,

    handleValidationError: setBackendErrors,
  };
}
