<template>
  <div class="menu d-flex align-items-center">
    <!-- CATEGORY -->
    <div class="col-md-2 d-flex">
      <MegaMenu v-for="item in categoryItems" :key="item.id" :item="item" />
    </div>

    <div class="d-flex align-items-center justify-content-center gap-4 flex-grow-1">
      <template v-for="item in otherItems" :key="item.id">
        <!-- SPECIAL CATEGORY -->
        <Menu
          v-if="item.type === 'special_category'"
          as="div"
          class="position-relative d-inline-block"
        >
          <MenuButton class="btn p-0 text-decoration-none">
            {{ item.name }}
            <BaseIcon name="chDown" />
          </MenuButton>

          <MenuItems
            class="position-absolute bg-white border mt-2 shadow"
            style="z-index: 1000; min-width: 200px"
          >
            <MenuItem
              v-for="child in item.children"
              :key="child.id"
              v-slot="{ active, close }"
            >
              <router-link
                :to="resolve(child.url)"
                class="dropdown-item text-dark"
                :class="{ 'bg-light': active }"
                @click="close"
              >
                {{ child.name }}
              </router-link>
            </MenuItem>
          </MenuItems>
        </Menu>

        <!-- CMS -->
        <router-link
          v-else-if="item.type === 'cms'"
          :to="resolve(item.url)"
          class="text-decoration-none"
        >
          {{ item.name }}
        </router-link>

        <!-- EXTERNAL -->
        <router-link
          v-else-if="item.type === 'external'"
          :to="resolve(item.url)"
          class="text-decoration-none"
        >
          {{ item.name }}
        </router-link>
      </template>
    </div>
    <div class="col-md-3">
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { useContentStore } from "@/core/stores/contentStore";
import { storeToRefs } from "pinia";
import MegaMenu from "./MegaMenu.vue";
import { useUrlResolver } from "@/composables/useUrlResolver";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";

const { resolve } = useUrlResolver();

const contentStore = useContentStore();
const { menu: items } = storeToRefs(contentStore);

const categoryItems = computed(() => items.value.filter((i) => i.type === "category"));
const otherItems = computed(() => items.value.filter((i) => i.type !== "category"));
</script>
<style scoped>
.menu a{
  color: #fff;
}
</style>