<template>
  <div ref="wrapper" class="base-select">
    <div class="base-select__control form-control" :class="{
      'base-select__control--open': opened
    }" @click="toggle">
      <span v-if="selectedOption" class="base-select__value">
        {{ getLabel(selectedOption) }}
      </span>

      <span v-else class="base-select__placeholder">
        {{ placeholder }}
      </span>

      <span class="base-select__arrow">
        ▼
      </span>
    </div>

    <div v-if="opened" class="base-select__dropdown">
      <div v-if="searchable" class="base-select__search">
        <input ref="searchInput" v-model="search" type="text" class="form-control" :placeholder="$t('common.search')"
          @click.stop />
      </div>

      <div v-for="option in filteredOptions" :key="String(option[valueKey])" class="base-select__option" :class="{
        'base-select__option--selected':
          isSelected(option)
      }" @click.stop="selectOption(option)">
        {{ getLabel(option) }}
      </div>

      <div v-if="!filteredOptions.length" class="base-select__empty">
        {{ $t('common.no_results') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'

type Option = Record<string, any>

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null
    options: Option[]
    labelKey?: string
    valueKey?: string
    labelFn?: (option: Option) => string
    placeholder?: string
    searchable?: boolean
  }>(),
  {
    labelKey: 'label',
    valueKey: 'value',
    placeholder: 'Wybierz',
    searchable: true,
  }
)

const emit = defineEmits<{
  'update:modelValue': [
    value: string | number | null
  ]
}>()

const wrapper = ref<HTMLElement>()
const searchInput = ref<HTMLInputElement>()

const opened = ref(false)
const search = ref('')

const selectedOption = computed(() => {
  return props.options.find(
    option =>
      String(option[props.valueKey]) ===
      String(props.modelValue)
  )
})

const filteredOptions = computed(() => {
  const query = search.value
    .trim()
    .toLowerCase()

  if (!query) {
    return props.options
  }

  return props.options.filter(option =>
    getLabel(option)
      .toLowerCase()
      .includes(query)
  )
})

function getLabel(option: Option): string {
  if (props.labelFn) {
    return props.labelFn(option)
  }

  return String(
    option[props.labelKey] ?? ''
  )
}

function isSelected(option: Option): boolean {
  return (
    String(option[props.valueKey]) ===
    String(props.modelValue)
  )
}

async function toggle() {
  if (opened.value) {
    close()
    return
  }

  opened.value = true

  if (props.searchable) {
    await nextTick()
    searchInput.value?.focus()
  }
}

function selectOption(option: Option) {
  const value = option[props.valueKey]

  emit(
    'update:modelValue',
    value
  )

  close()
}

function close() {
  opened.value = false
  search.value = ''
}

function clickOutside(event: MouseEvent) {
  if (
    wrapper.value &&
    !wrapper.value.contains(
      event.target as Node
    )
  ) {
    close()
  }
}

onMounted(() => {
  document.addEventListener(
    'click',
    clickOutside
  )
})

onUnmounted(() => {
  document.removeEventListener(
    'click',
    clickOutside
  )
})
</script>

<style scoped>
.base-select {
  position: relative;
  width: 100%;
}

.base-select__control {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  min-height: 38px;

  cursor: pointer;
  background: #fff;

  user-select: none;
}

.base-select__value,
.base-select__placeholder {
  display: block;

  flex: 1;
  min-width: 0;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.base-select__placeholder {
  color: #6c757d;
}

.base-select__arrow {
  flex-shrink: 0;
  margin-left: 8px;
  color: #6c757d;
  font-size: 12px;
}

.base-select__dropdown {
  position: absolute;
  z-index: 1000;

  top: calc(100% + 2px);
  left: 0;
  right: 0;

  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;

  max-height: 300px;
  overflow-y: auto;

  box-shadow:
    0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.base-select__search {
  position: sticky;
  top: 0;
  z-index: 1;

  padding: 8px;

  background: #fff;
}

.base-select__option {
  padding: 8px 12px;
  cursor: pointer;
}

.base-select__option:hover,
.base-select__option--selected {
  background: #f8f9fa;
}

.base-select__empty {
  padding: 12px;
  color: #6c757d;
  text-align: center;
}
</style>