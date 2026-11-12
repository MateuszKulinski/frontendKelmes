<template>
    <div class="image-upload">
        <div v-if="preview" class="image-upload__preview">
            <img :src="preview" alt="" class="image-upload__image" />

            <button type="button" class="image-upload__remove" :disabled="disabled" @click="removeImage">
                ×
            </button>
        </div>

        <label v-else :for="inputId" class="image-upload__dropzone">
            <span class="image-upload__plus">+</span>
            <span>Wybierz obraz</span>
        </label>

        <input :id="inputId" ref="input" type="file" accept="image/*" class="image-upload__input" :disabled="disabled"
            @change="handleChange" />

        <button v-if="preview" type="button" class="btn btn-sm btn-outline-secondary mt-2" :disabled="disabled"
            @click="openPicker">
            Zmień obraz
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type ImageValue = string | File | null;

const props = withDefaults(
    defineProps<{
        modelValue: ImageValue;
        id?: string;
        disabled?: boolean;
    }>(),
    {
        modelValue: null,
        disabled: false,
    },
);

const emit = defineEmits<{
    "update:modelValue": [value: ImageValue];
}>();

const input = ref<HTMLInputElement | null>(null);
const objectUrl = ref<string | null>(null);

const inputId =
    props.id ??
    `image-upload-${Math.random().toString(36).slice(2)}`;

const preview = computed(() => {
    if (props.modelValue instanceof File) {
        if (!objectUrl.value) {
            objectUrl.value = URL.createObjectURL(
                props.modelValue,
            );
        }

        return objectUrl.value;
    }

    return props.modelValue;
});

const openPicker = () => {
    input.value?.click();
};

const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
        return;
    }

    if (objectUrl.value) {
        URL.revokeObjectURL(objectUrl.value);
        objectUrl.value = null;
    }

    emit("update:modelValue", file);
};

const removeImage = () => {
    if (objectUrl.value) {
        URL.revokeObjectURL(objectUrl.value);
        objectUrl.value = null;
    }

    emit("update:modelValue", null);

    if (input.value) {
        input.value.value = "";
    }
};
</script>

<style scoped>
.image-upload {
    width: 100%;
}

.image-upload__input {
    display: none;
}

.image-upload__dropzone {
    min-height: 180px;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    color: #6c757d;
    background: #f8f9fa;
}

.image-upload__plus {
    font-size: 32px;
    line-height: 1;
}

.image-upload__preview {
    position: relative;
    min-height: 180px;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    overflow: hidden;
    background: #f8f9fa;
}

.image-upload__image {
    display: block;
    width: 100%;
    height: 180px;
    object-fit: contain;
}

.image-upload__remove {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
}
</style>