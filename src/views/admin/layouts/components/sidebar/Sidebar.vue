<template>
  <aside class="sidebar" :class="{ collapsed: !open }">
    <!-- HEADER -->
    <div class="sidebar-header d-flex align-items-center justify-content-between">
      <span class="sidebar-title" :class="{ hidden: !open }">{{ t('menu.admin') }}</span>

      <button type="button" class="sidebar-toggle" :aria-label="t(open ? 'menu.close' : 'menu.open')"
        @click="$emit('toggle')">
        <BaseIcon name="chLeft" :class="{ rotated: !open }" />
      </button>
    </div>

    <nav class="sidebar-inner" :aria-label="t('menu.admin')">
      <ul class="nav flex-column sidebar-nav">
        <li class="sidebar-dashboard">
          <router-link class="sidebar-dashboard__link" :title="!open ? t('menu.dashboard') : undefined"
            :to="{ name: 'admin.dashboard' }">
            <BaseIcon name="dashboard" class="me-2" />
            <span :class="{ hidden: !open }">{{ t('menu.dashboard') }}</span>
          </router-link>
        </li>

        <li v-for="group in groups" :key="group.id" class="sidebar-group">
          <button type="button" class="sidebar-group__toggle"
            :class="{ active: isGroupActive(group), expanded: sections[group.id] }" :aria-expanded="sections[group.id]"
            :aria-label="t(group.label)" :title="!open ? t(group.label) : undefined"
            @click="toggleSection(group.id)">
            <span class="sidebar-group__title">
              <BaseIcon :name="group.icon" class="me-2" />
              <span :class="{ hidden: !open }">{{ t(group.label) }}</span>
            </span>
            <BaseIcon v-if="open" name="chDown" class="sidebar-group__chevron"
              :class="{ rotate: sections[group.id] }" />
          </button>

          <ul v-show="sections[group.id]" class="nav flex-column sidebar-group__items">
            <li v-for="item in group.items" :key="item.route" class="nav-item">
              <router-link class="nav-link" :title="!open ? t(item.label) : undefined" :to="{ name: item.route }">
                <BaseIcon :name="item.icon" class="me-2" />
                <span :class="{ hidden: !open }">{{ t(item.label) }}</span>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </aside>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import "./sidebar.css";
import { useI18n } from "vue-i18n";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";
import { useAuthStore } from "@/core/stores/authStore";
const auth = useAuthStore();

const { t } = useI18n();

defineProps<{
  open: boolean;
}>();

const route = useRoute();

type GroupId = "sales" | "service" | "customers" | "catalog" | "limits" | "content" | "settings";
type SidebarItem = { route: string; label: string; icon: string; visible: boolean };
type SidebarGroup = { id: GroupId; label: string; icon: string; items: SidebarItem[] };

const groups = computed<SidebarGroup[]>(() => ([
  {
    id: "sales",
    label: "menu.adminSales",
    icon: "order",
    items: [
      { route: "admin.orders", label: "order.title", icon: "order", visible: true },
      { route: "admin.carts", label: "cart.title", icon: "cart", visible: true },
    ],
  },
  {
    id: "service" as const,
    label: "menu.adminService",
    icon: "doc",
    items: [
      { route: "admin.docs", label: "docs.title", icon: "doc", visible: true },
      { route: "admin.claims", label: "claims.title", icon: "doc", visible: auth.isAdmin },
    ],
  },
  {
    id: "customers",
    label: "menu.adminCustomers",
    icon: "users",
    items: [
      { route: "admin.users", label: "user.title", icon: "users", visible: true },
      { route: "admin.users.create", label: "user.create_user", icon: "plus", visible: true },
      { route: "admin.units", label: "unit.title", icon: "unit", visible: true },
    ],
  },
  {
    id: "catalog",
    label: "menu.adminCatalog",
    icon: "categories",
    items: [
      { route: "admin.categories", label: "categories.title", icon: "categories", visible: auth.isAdmin },
      { route: "admin.manufacturers", label: "manufacturer.title_list", icon: "industry", visible: auth.isSuperAdmin },
      { route: "admin.features", label: "features.title", icon: "features", visible: auth.isAdmin },
    ],
  },
  {
    id: "limits",
    label: "menu.adminLimits",
    icon: "features",
    items: [
      { route: "admin.limits", label: "limits.title", icon: "features", visible: auth.isAdmin },
      { route: "admin.limits.create", label: "limits.add", icon: "plus", visible: auth.isAdmin },
    ],
  },
  {
    id: "content",
    label: "menu.adminContent",
    icon: "image",
    items: [
      { route: "admin.banners", label: "banner.title_list", icon: "image", visible: auth.isSuperAdmin },
      { route: "admin.cms", label: "cms.title_list", icon: "doc", visible: auth.isSuperAdmin },
      { route: "admin.news", label: "news.title_list", icon: "doc", visible: auth.isSuperAdmin },
      { route: "admin.news-categories", label: "news.title_list_categories", icon: "doc", visible: auth.isSuperAdmin },
      { route: "admin.newsletterSubscribers", label: "newsletter.main_title", icon: "newsletter", visible: auth.isAdmin },
      { route: "admin.sliders", label: "slider.title_list", icon: "image", visible: auth.isSuperAdmin },
      { route: "admin.seo", label: "seo.menu", icon: "seo", visible: auth.isSuperAdmin },
      { route: "admin.site-meta-data", label: "siteMetaData.title", icon: "seo", visible: auth.isSuperAdmin },
      { route: "admin.menu", label: "menu.manage", icon: "categories", visible: auth.isSuperAdmin },
    ],
  },
  {
    id: "settings",
    label: "menu.adminSettings",
    icon: "configuration",
    items: [
      { route: "admin.payments", label: "payment.title", icon: "payment", visible: auth.isSuperAdmin },
      { route: "admin.deliveries", label: "delivery.title", icon: "delivery", visible: auth.isSuperAdmin },
      { route: "admin.configuration", label: "configuration.edit", icon: "configuration", visible: auth.isAdmin },
      { route: "admin.outlet", label: "outlet.admin_title", icon: "configuration", visible: auth.isAdmin },
      { route: "admin.cache", label: "cache.title", icon: "configuration", visible: auth.isSuperAdmin },
    ],
  },
 ] satisfies SidebarGroup[]).map((group) => ({ ...group, items: group.items.filter((item) => item.visible) }))
  .filter((group) => group.items.length > 0));

const matchesRoute = (item: SidebarItem) =>
  route.name === item.route
  || (typeof route.name === "string" && route.name.startsWith(`${item.route}.`));

const activeGroup = () => groups.value.find((group) => group.items.some(matchesRoute))?.id;
const sections = ref<Record<GroupId, boolean>>({
  sales: false,
  service: false,
  customers: false,
  catalog: false,
  limits: false,
  content: false,
  settings: false,
});

const toggleSection = (id: GroupId) => {
  sections.value[id] = !sections.value[id];
};

const isGroupActive = (group: SidebarGroup) => group.items.some(matchesRoute);

watch(() => route.name, () => {
  const group = activeGroup();
  if (group) sections.value[group] = true;
}, { immediate: true });
</script>
