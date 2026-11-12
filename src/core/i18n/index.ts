import { createI18n } from "vue-i18n";
import { buildLang } from "./buildLang";

import cart from "./cart";
import category from "./category";
import changeUnit from "./changeUnit";
import common from "./common";
import company from "./company";
import docs from "./docs";
import errors from "./errors";
import login from "./login";
import menu from "./menu";
import order from "./order";
import orderApproval from "./orderApproval";
import panelDashboard from "./panelDashboard";
import products from "./products";
import url from "./url";
import user from "./user";
import payment from "./payment";
import delivery from "./delivery";
import inquiry from "./inquiry";
import banner from "./banner";
import cms from "./cms";
import news from "./news";
import favourite from "./favourite";
import richTextEditor from "./richTextEditor";
import manufacturer from "./manufacturer";
import slider from "./slider";
import unit from "./unit";
import address from "./address";
import offer from "./offer";
import configuration from "./configuration";
import newsletter from "./newsletters";
import compare from "./compare";
import features from "./features";
import promotions from "./promotions";
import claims from "./claims";
import limits from "./limits";
import seo from "./seo";
import siteMetaData from "./siteMetaData";
import categories from "./categories";
import center_cost from "./center_cost";
import contact from "./contact";
import aiChat from "./aiChat";
import about from "./about";
import outlet from "./outlet";
import brands from "./brands";
import cache from "./cache";

const messages = buildLang({
  cart,
  category,
  changeUnit,
  common,
  company,
  docs,
  errors,
  login,
  menu,
  order,
  orderApproval,
  panelDashboard,
  products,
  url,
  user,
  payment,
  delivery,
  inquiry,
  banner,
  cms,
  news,
  favourite,
  richTextEditor,
  manufacturer,
  slider,
  unit,
  address,
  offer,
  configuration,
  newsletter,
  compare,
  features,
  promotions,
  claims,
  limits,
  seo,
  siteMetaData,
  categories,
  center_cost,
  contact,
  aiChat,
  about,
  outlet,
  brands,
  cache,
});

const savedLang =
  localStorage.getItem("lang_selected") === "true"
    ? localStorage.getItem("lang") || "pl"
    : "pl";

export const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: "en",
  messages,
  pluralRules: {
    pl: (choice: number) => {
      if (choice === 1) return 1;
      const mod10 = choice % 10;
      const mod100 = choice % 100;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 2;
      return 0;
    },
  },
  missing: (locale, key) => {
    console.warn(`[i18n missing] ${locale}.${key}`);
    return key;
  },
});
