<template>
  <div class="autocomplete">
    <BaseInput
      v-model="searchValue"
      @input="onInput"
      @focus="open = true"
      :placeholder="placeholder"
    />

    <div v-if="open && items.length" class="dropdown">
      <div
        v-for="item in items"
        :key="item[idKey]"
        class="dropdown-item"
        @click="select(item)"
      >
        <div class="title">{{ item[labelKey] }}</div>
        <div v-if="subLabelKey" class="subtitle">
          {{ item[subLabelKey] }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBaseAutocomplete } from "../BaseAutocomplete/BaseAutocomplete";
import BaseInput from "../../ui/BaseInput.vue";

const props = withDefaults(
  defineProps<{
    items: any[];
    placeholder?: string;
    idKey?: string;
    labelKey?: string;
    subLabelKey?: string;
  }>(),
  {
    idKey: "id",
    labelKey: "name",
  }
);

const emit = defineEmits(["select", "search"]);

const { searchValue, open, onInput, select } = useBaseAutocomplete(props, emit);
</script>

<style scoped src="./BaseAutocomplete.css"></style>