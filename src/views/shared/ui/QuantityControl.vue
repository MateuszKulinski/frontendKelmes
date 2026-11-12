<template>
    <div class="qty-control">
        <button class="qty-btn qty-minus" @click="decrement" :disabled="modelValue <= min" type="button">
            −
        </button>

        <input class="qty-input" type="number" :min="min" :max="max" :value="modelValue" @change="onInput"
            @blur="onBlur" @keydown.enter.prevent="($event.target as HTMLInputElement).blur()" />

        <button class="qty-btn qty-plus" @click="increment" :disabled="max !== undefined && modelValue >= max"
            type="button">
            +
        </button>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        modelValue: number
        min?: number
        max?: number
    }>(),
    {
        min: 1
    }
)

const emit = defineEmits<{
    (e: 'update:modelValue', val: number): void
}>()

function increment() {
    if (props.max !== undefined && props.modelValue >= props.max) {
        return
    }

    emit(
        'update:modelValue',
        Math.min(
            props.modelValue + 1,
            props.max ?? Infinity
        )
    )
}

function decrement() {
    if (props.modelValue > props.min) {
        emit('update:modelValue', props.modelValue - 1)
    }
}

function onInput(e: Event) {
    const input = e.target as HTMLInputElement
    const raw = parseInt(input.value, 10)

    if (isNaN(raw)) {
        return
    }

    const value = Math.max(
        props.min,
        props.max !== undefined ? Math.min(raw, props.max) : raw
    )

    emit('update:modelValue', value)
    input.value = String(value)
}

function onBlur(e: Event) {
    const input = e.target as HTMLInputElement
    const raw = parseInt(input.value, 10)

    if (
        isNaN(raw) ||
        raw < props.min ||
        (props.max !== undefined && raw > props.max)
    ) {
        input.value = String(props.modelValue)
    }
}
</script>

<style scoped>
.qty-control {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: var(--bg-surface);
    height: 34px;
    user-select: none;
    font-weight: 400;
}

.qty-btn {
    width: 30px;
    height: 100%;
    border: none;
    background: transparent;
    color: var(--text-primary);
    font-size: var(--font-size-lg-plus);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-default);
}

.qty-btn:hover:not(:disabled) {
    background: var(--bg-muted);
}

.qty-btn:disabled {
    opacity: 0.35;
    cursor: default;
}

.qty-input {
    width: 60px;
    height: 100%;
    border: none;
    background: transparent;
    text-align: center;
    font-size: var(--font-size-md);
    color: var(--text-primary);
    outline: none;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
