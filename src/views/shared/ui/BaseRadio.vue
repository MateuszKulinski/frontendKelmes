<template>
    <label class="base-radio">
        <input :checked="modelValue" :disabled="disabled" type="radio" :name="name" @change="onChange" />

        <span class="radiomark"></span>

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
        name?: string;
    }>(),
    {
        disabled: false,
        name: undefined,
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
.base-radio {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
    font-size: var(--font-size-md);
    color: var(--accent);
}

.base-radio input {
    display: none;
}

.radiomark {
    width: 20px;
    height: 20px;
    min-width: 20px;
    border: 1px solid var(--border-light);
    border-radius: 50%;
    background: white;
    position: relative;
    transition: .2s;
}

.base-radio input:checked+.radiomark {
    border-color: var(--accent);
}

.base-radio input:checked+.radiomark::after {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    left: 4px;
    top: 4px;
    border-radius: 50%;
    background: var(--accent);
}

.base-radio input:disabled+.radiomark {
    opacity: .5;
}

.base-radio input:disabled~.label {
    opacity: .5;
}

.label {
    line-height: 1.3;
    color: var(--text-primary);
    font-size: var(--font-size-sm-plus);
}
</style>