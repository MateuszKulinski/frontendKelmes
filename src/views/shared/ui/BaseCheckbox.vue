<template>
    <label class="base-checkbox">

        <input :checked="modelValue" :disabled="disabled" type="checkbox" @change="onChange" />

        <span class="checkmark"></span>

        <span class="label">
            <slot />
        </span>

    </label>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        modelValue: boolean;
        disabled?: boolean;
    }>(),
    {
        disabled: false,
    }
);

const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void;
}>();

const onChange = (e: Event) => {
    emit(
        "update:modelValue",
        (e.target as HTMLInputElement).checked
    );
};
</script>

<style scoped>
.base-checkbox {
    display: inline-flex;
    align-items: center;
    gap: 10px;

    cursor: pointer;

    user-select: none;

    font-size: var(--font-size-md);
    color: var(--text-primary);
}

.base-checkbox input {
    display: none;
}

.checkmark {
    width: 20px;
    height: 20px;

    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);

    background: white;

    position: relative;

    transition: .2s;
}

.base-checkbox input:checked+.checkmark {
    background: var(--color-primary);
    border-color: var(--color-primary);
}

.base-checkbox input:checked+.checkmark::after {
    content: "";

    position: absolute;

    left: 6px;
    top: 2px;

    width: 5px;
    height: 10px;

    border: solid white;
    border-width: 0 2px 2px 0;

    transform: rotate(45deg);
}

.base-checkbox input:disabled+.checkmark {
    opacity: .5;
}

.base-checkbox input:disabled~.label {
    opacity: .5;
}

.label {
    line-height: 1.3;
}
</style>