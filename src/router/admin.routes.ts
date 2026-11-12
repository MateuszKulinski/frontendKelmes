import Layout from "@admin/layouts/Layout.vue";
import dashboard from "./admin/dashboard";
import configuration from "./admin/configuration";
import users from "./admin/users";
import units from "./admin/units";
import address from "./admin/address";
import documents from "./admin/documents";
import carts from "./admin/carts";
import orders from "./admin/orders";
import payments from "./admin/payments";
import deliveries from "./admin/deliveries";
import banners from "./admin/banners";
import news from "./admin/news";
import cms from "./admin/cms";
import menu from "./admin/menu";
import manufacturers from "./admin/manufacturers";
import sliders from "./admin/sliders";
import newsletters from "./admin/newsletters";
import seo from "./admin/seo";
import siteMetaData from "./admin/site-meta-data";
import categories from "./admin/categories";
import claims from "./admin/claims";
import limits from "./admin/limits";
import cache from "./admin/cache";

export const adminRoutes = [
  {
    path: "/admin",
    component: Layout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      ...dashboard,
      ...configuration,
      ...users,
      ...units,
      ...address,
      ...documents,
      ...carts,
      ...orders,
      ...payments,
      ...deliveries,
      ...banners,
      ...news,
      ...cms,
      ...menu,
      ...manufacturers,
      ...sliders,
      ...newsletters,
      ...seo,
      ...siteMetaData,
      ...categories,
      ...claims,
      ...limits,
      ...cache,
    ],
  },
];
