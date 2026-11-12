import { ref } from "vue";

export function useBaseAutocomplete(props: any, emit: any) {
    const searchValue = ref("");
    const open = ref(false);

    const onInput = () => {
        emit("search", searchValue.value);
    };

    const select = (item: any) => {
        searchValue.value = item[props.labelKey || "name"];
        open.value = false;
        emit("select", item);
    };

    return {
        searchValue,
        open,
        onInput,
        select,
    };
}