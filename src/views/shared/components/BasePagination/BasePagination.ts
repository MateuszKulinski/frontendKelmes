import { computed, ref, watch } from "vue";

export function useBasePagination(
    props: {
        page: number;
        perPage: number;
        total: number;
        lastPage: number;
        disabled?: boolean;
    },
    emit: (e: "change", page: number) => void
) {
    const inputPage = ref(props.page);

    /* sync input */
    watch(
        () => props.page,
        (val) => {
            inputPage.value = val;
        }
    );

    /* pages */
    const pages = computed(() => {
        const range: (number | string)[] = [];
        const delta = 2;

        for (let i = 1; i <= props.lastPage; i++) {
            if (
                i === 1 ||
                i === props.lastPage ||
                (i >= props.page - delta && i <= props.page + delta)
            ) {
                range.push(i);
            }
        }

        const result: (number | string)[] = [];
        let prev: number | null = null;

        for (let i of range) {
            if (prev && (i as number) - prev > 1) result.push("...");
            result.push(i);
            prev = i as number;
        }

        return result;
    });

    /* range */
    const from = computed(() =>
        props.total === 0 ? 0 : (props.page - 1) * props.perPage + 1
    );

    const to = computed(() =>
        Math.min(props.page * props.perPage, props.total)
    );

    /* actions */
    const emitChange = (p: number) => emit("change", p);

    const goToInputPage = () => {
        let val = Number(inputPage.value);

        if (!val || val < 1) val = 1;
        if (val > props.lastPage) val = props.lastPage;

        emitChange(val);
    };

    const normalizeInput = () => {
        let val = Number(inputPage.value);

        if (!val || val < 1) val = 1;
        if (val > props.lastPage) val = props.lastPage;

        inputPage.value = val;
    };

    return {
        pages,
        from,
        to,
        inputPage,
        emitChange,
        goToInputPage,
        normalizeInput,
    };
}