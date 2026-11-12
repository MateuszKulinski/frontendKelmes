import { watch } from "vue";
import { useLangStore } from "@/core/stores/langStore";
import { useIndexStore } from "@/composables/indexStore";

export function useSliderView() {
    const langStore = useLangStore();
    const indexStore = useIndexStore();

    // 🔁 reaguje na zmianę języka i montowanie komponentu
    watch(
        () => langStore.current,
        () => indexStore.fetchHomePage(),
        { immediate: true }
    );

    return { indexStore };
}
