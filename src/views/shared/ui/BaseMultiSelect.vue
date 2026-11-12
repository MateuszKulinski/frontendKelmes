<template>

    <div class="base-multi-select" ref="wrapper">


        <div class="base-multi-select__control" @click="toggle">

            <span v-if="selectedOptions.length">

                {{ displayValue }}

            </span>

            <span v-else class="placeholder">

                {{ placeholder }}

            </span>

            <span class="arrow">

                ▼

            </span>

        </div>

        <div v-if="opened" class="base-multi-select__dropdown">


            <div v-if="searchable" class="base-multi-select__search">

                <input ref="searchInput" v-model="search" type="text" class="form-control"
                    :placeholder="$t('common.search')" @click.stop>

            </div>

            <label v-for="option in filteredOptions" :key="option[valueKey]" class="base-multi-select__option"
                @click.stop>

                <input type="checkbox" :checked="isSelected(option)" @change="toggleOption(option)" @click.stop>

                {{ getLabel(option) }}

            </label>
            <div v-if="!filteredOptions.length" class="base-multi-select__empty">

                {{ t('common.no_results') }}

            </div>
            <div v-if="!options.length" class="base-multi-select__empty">
                {{ t('common.no_results') }}

            </div>

        </div>

    </div>

</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import {
    computed,
    ref,
    onMounted,
    onUnmounted,
    nextTick
} from "vue";

type Option = Record<string, any>;
const { t } = useI18n();
const search = ref("");
const searchInput = ref<HTMLInputElement>();

const props = withDefaults(

    defineProps<{

        modelValue: (string | number)[];

        options: Option[];

        labelKey?: string;

        valueKey?: string;

        placeholder?: string;

        labelFn?: (option: Option) => string;

        searchable?: boolean;

    }>(),

    {

        labelKey: "label",

        valueKey: "value",

        placeholder: "Wybierz",

        searchable: true

    }

);

const emit = defineEmits([
    "update:modelValue"
]);

const wrapper = ref<HTMLElement>();

const opened = ref(false);


const toggle = async () => {

    if (opened.value) {
        close();
        return;
    }

    opened.value = true;

    await nextTick();

    searchInput.value?.focus();

};

const close = () => {

    opened.value = false;
    search.value = "";

};

const selectedOptions = computed(() => {

    return props.options.filter(option =>

        props.modelValue.includes(
            option[props.valueKey]
        )

    );

});

const filteredOptions = computed(() => {

    if (!props.searchable || !search.value.trim()) {
        return props.options;
    }

    const value = search.value.toLowerCase();

    return props.options.filter(option =>
        getLabel(option)
            .toString()
            .toLowerCase()
            .includes(value)
    );

});

const displayValue = computed(() => {

    const labels = selectedOptions.value.map(getLabel);

    if (labels.length <= 2) {
        return labels.join(", ");
    }

    return `${labels[0]}, ${labels[1]} +${labels.length - 2}`;
});

function getLabel(option: Option) {

    if (props.labelFn) {

        return props.labelFn(option);

    }

    return option[
        props.labelKey
    ];

}

function isSelected(option: Option) {

    return props.modelValue.includes(

        option[
        props.valueKey
        ]

    );

}

function toggleOption(option: Option) {

    const value = option[
        props.valueKey
    ];

    const list = [...props.modelValue];

    const index = list.indexOf(value);

    if (index > -1) {

        list.splice(index, 1);

    } else {

        list.push(value);

    }

    emit(
        "update:modelValue",
        list
    );

}

function clickOutside(e: MouseEvent) {

    if (

        wrapper.value &&

        !wrapper.value.contains(

            e.target as Node

        )

    ) {

        close();

    }

}

onMounted(() => {

    document.addEventListener(
        "click",
        clickOutside
    );

});

onUnmounted(() => {

    document.removeEventListener(
        "click",
        clickOutside
    );

});
</script>

<style src="./BaseMultiSelect.css" scoped></style>