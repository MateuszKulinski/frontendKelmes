import { ref, computed } from "vue";
import { useLangStore } from "@/core/stores/langStore";
import { useI18n } from "vue-i18n";
import type { Locale } from "@/core/i18n/types";
import { onMounted, onBeforeUnmount } from "vue";

export function useLanguageSwitcher() {
    const open = ref(false);

    const langStore = useLangStore();
    const { locale } = useI18n();

    const langs = computed(() => langStore.langs);
    const current = computed(() => langStore.current);

    const flagCode = (code: string) => {
        return code === "en" ? "gb" : code;
    };

    const toggle = () => {
        open.value = !open.value;
    };

    const select = (code: Locale) => {
        langStore.setLang(code);
        locale.value = code;
        open.value = false;
    };

    const containerRef = ref<HTMLElement | null>(null);

    const handleClickOutside = (event: MouseEvent) => {
        if (!containerRef.value) return;

        if (!containerRef.value.contains(event.target as Node)) {
            open.value = false;
        }
    };

    const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            open.value = false;
        }
    };


    onMounted(() => {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
    });

    onBeforeUnmount(() => {
        document.removeEventListener("click", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
    });

    return {
        containerRef,
        open,
        langs,
        current,
        toggle,
        select,
        flagCode,
    };
}