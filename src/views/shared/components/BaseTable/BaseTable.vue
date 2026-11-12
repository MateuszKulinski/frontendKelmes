<template>
  <div class="base-table">
    <table class="table">
      <thead>
        <tr>
          <th v-for="col in props.columns" :key="col.key" @click="handleSort(col)" :class="[
            col.sortable ? 'sortable' : '',
            props.sortBy === col.key ? 'sorted' : '',
          ]">
            <div class="th-wrapper">
              <div class="th-inner">
                <slot :name="`header-${col.key}`" :col="col">
                  <div class="th-label">
                    {{ col.label ?? (col.key === 'lp' ? t('common.no') : col.key) }}
                  </div>
                </slot>
              </div>

              <div v-if="col.sortable" class="sort-icon">
                <BaseIcon name="sortUp" :class="{ active: props.sortBy === col.key && props.sortDir === 'asc' }" />
                <BaseIcon name="sortDown" :class="{ active: props.sortBy === col.key && props.sortDir === 'desc' }" />
              </div>
            </div>
          </th>
        </tr>
      </thead>

      <draggable v-if="props.draggable && !props.loading && props.data.length" tag="tbody" :modelValue="internalData"
        item-key="id" @update:modelValue="onDrag">
        <template #item="{ element: row, index }">
          <tr class="tr-row draggable">
            <td v-for="col in props.columns" :key="col.key">
              <!-- LP -->
              <template v-if="col.key === 'lp'">
                {{ index + 1 }}
              </template>

              <!-- SLOT -->
              <slot :name="`cell-${col.key}`" :row="row" :index="index">
                {{ col.formatter ? col.formatter(row, index) : row[col.key] }}
              </slot>
            </td>
          </tr>
        </template>
      </draggable>

      <!-- NORMAL tbody -->
      <tbody v-else>
        <tr v-if="props.loading">
          <td :colspan="props.columns.length" class="state">Ładowanie...</td>
        </tr>

        <tr v-else-if="!props.data.length">
          <td :colspan="props.columns.length" class="state">Brak danych</td>
        </tr>

        <tr v-else v-for="(row, index) in props.data" :key="row[props.rowKey]" @click="emit('row-click', row)"
          class="tr-row">
          <td v-for="col in props.columns" :key="col.key">
            <template v-if="col.key === 'lp'">
              {{ (props.currentPage - 1) * props.perPage + index + 1 }}.
            </template>

            <slot :name="`cell-${col.key}`" :row="row" :index="index">
              {{ col.formatter ? col.formatter(row, index) : row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import "./BaseTable.css";
import { useI18n } from "vue-i18n";
import BaseIcon from "../../ui/BaseIcon.vue";
import draggable from "vuedraggable";
import { ref, watch } from "vue";

const { t } = useI18n();

type Column = {
  key: string;
  label?: string;
  sortable?: boolean;
  formatter?: (row: any, index?: number) => any;
};

const props = withDefaults(
  defineProps<{
    columns: Column[];
    data: Record<string, any>[];
    loading?: boolean;
    rowKey?: string;
    currentPage?: number;
    perPage?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
    draggable?: boolean;
  }>(),
  {
    loading: false,
    rowKey: "id",
    currentPage: 1,
    perPage: 10,
    sortBy: "",
    sortDir: "asc",
    draggable: false,
  }
);

const emit = defineEmits<{
  (e: "sort", payload: { sortBy: string; sortDir: "asc" | "desc" }): void;
  (e: "row-click", row: any): void;
  (e: "reorder", data: any[]): void;
}>();

const internalData = ref<any[]>([]);

watch(
  () => props.data,
  (val) => {
    internalData.value = [...val];
  },
  { immediate: true }
);

const onDrag = (newList: any[]) => {
  internalData.value = newList;
  emit("reorder", newList);
};

const handleSort = (col: Column) => {
  if (!col.sortable) return;

  let dir: "asc" | "desc" = "asc";

  if (props.sortBy === col.key) {
    dir = props.sortDir === "asc" ? "desc" : "asc";
  }

  emit("sort", { sortBy: col.key, sortDir: dir });
};
</script>

<style scoped>
.th-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
}

.th-inner {
  flex: 1;
}

.th-label {
  font-weight: 600;
  margin-bottom: 4px;
}

.sort-icon {
  display: flex;
  flex-direction: column;
  font-size: 10px;
}

.sort-icon i {
  opacity: 0.3;
}

.sort-icon i.active {
  opacity: 1;
}

.draggable {
  cursor: grab;
}
</style>