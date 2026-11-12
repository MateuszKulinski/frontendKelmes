import Layout from "@site/layouts/Layout.vue";
import PanelLayout from "@site/layouts/PanelLayout.vue";
import LoginView from "@site/dynamic/auth/views/LoginView.vue";
import DashboardView from "@/views/site/dynamic/shop/DashboardView.vue";
import DynamicPage from "@site/dynamic/DynamicPage.vue";
import NotFoundView from "@site/dynamic/errors/NotFoundView.vue";
import MainPanel from "@/views/site/dynamic/panel/mainPanel/MainPanel.vue";
import DocumentView from "@/views/site/dynamic/panel/docs/DocumentView.vue";
import DocumentsList from "@/views/site/dynamic/panel/docs/DocumentsList.vue";
import CartsList from "@/views/site/dynamic/panel/carts/CartsList.vue";
import CartView from "@/views/site/dynamic/panel/carts/CartView.vue";
import OrdersList from "@/views/site/dynamic/panel/orders/OrdersList.vue";
import OrderView from "@/views/site/dynamic/panel/orders/OrderView.vue";
import OrderApprovalsList from "@/views/site/dynamic/panel/approvals/OrderApprovalsList.vue";
import Inquiries from "@/views/site/dynamic/panel/inquiries/Inquiries.vue";
import Offers from "@/views/site/dynamic/panel/offers/Offers.vue";
import InquiryCreate from "@/views/site/dynamic/panel/inquiries/create/InquiryCreate.vue";
import EditInquiry from "@/views/site/dynamic/panel/inquiries/edit/EditInquiry.vue";
import InquiryView from "@/views/site/dynamic/panel/inquiries/view/InquiryView.vue";
import ShopCart from "@/views/site/dynamic/shop/ShopCartView/ShopCart.vue";
import ShopCartsView from "@/views/site/dynamic/panel/shopCarts/ShopCartsView.vue";
import FavouritesPanel from "@/views/site/dynamic/panel/favourites/FavouritesPanel.vue";
import OfferCompanies from "@/views/site/dynamic/panel/offers/_companies/OfferCompanies.vue";
import OfferCompanyView from "@/views/site/dynamic/panel/offers/_companies/view/OfferCompanyView.vue";
import OfferCompanyCreate from "@/views/site/dynamic/panel/offers/_companies/create/OfferCompanyCreate.vue";
import OfferCompanyEdit from "@/views/site/dynamic/panel/offers/_companies/edit/OfferCompanyEdit.vue";
import ProductCompare from "@/views/site/components/compare/ProductCompare.vue";
import PromotionList from "@/views/site/dynamic/panel/promotions/list/PromotionList.vue";
import PromotionView from "@/views/site/dynamic/panel/promotions/view/PromotionView.vue";
import ClaimDocumentsList from "@/views/site/dynamic/panel/claims/docs/list/ClaimDocumentsList.vue";
import ClaimDocumentView from "@/views/site/dynamic/panel/claims/docs/view/ClaimDocumentView.vue";
import ClaimCaseView from "@/views/site/dynamic/panel/claims/docs/view/ClaimCaseView.vue";
import CenterCostsList from "@/views/site/dynamic/panel/center_cost/list/CenterCostsList.vue";
import CenterCostCreate from "@/views/site/dynamic/panel/center_cost/create/CenterCostCreate.vue";
import CenterCostEdit from "@/views/site/dynamic/panel/center_cost/edit/CenterCostEdit.vue";
import Contact from "@/views/site/dynamic/contact/Contact.vue";
import SearchView from "@/views/site/dynamic/shop/SearchView/SearchView.vue";
import PromotionProductsView from "@/views/site/dynamic/shop/PromotionView/PromotionProductsView.vue";

export const userRoutes = [
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "",
        name: "dashboard",
        component: DashboardView,
        meta: { usesPageMetaData: true },
      },
      {
        path: "",
        name: "shop",
        component: DashboardView,
        meta: { usesPageMetaData: true },
      },

      {
        path: "login",
        alias: ["logowanie", "anmeldung"],
        name: "login",
        component: LoginView,
        meta: {
          title: "login.title",
        },
      },

      {
        path: "cart",
        alias: ["koszyk", "warenkorb"],
        name: "shopCart",
        component: ShopCart,
        meta: { requiresAuth: true },
      },

      {
        path: "contact",
        alias: ["kontakt", "kontakt"],
        name: "Contact",
        component: Contact,
        meta: { usesPageMetaData: true },
      },

      {
        path: "o-nas",
        name: "about",
        component: () => import("@/views/site/dynamic/pages/AboutPage/AboutView.vue"),
        meta: { usesPageMetaData: true },
      },

      {
        path: "outlet",
        name: "outlet",
        component: () => import("@/views/site/dynamic/pages/OutletPage/OutletView.vue"),
        meta: { title: "outlet.title" },
      },

      {
        path: "brands",
        alias: ["marki", "producenci", "marken", "hersteller"],
        name: "brands",
        component: () => import("@/views/site/dynamic/pages/BrandsPage/BrandsView.vue"),
        meta: { title: "brands.title" },
      },

      {
        path: "aktualnosci",
        alias: ["news", "neuigkeiten"],
        name: "news.list",
        component: () =>
          import("@/views/site/dynamic/pages/news/NewsListView.vue"),
      },

      {
        path: "aktualnosci/:idSlug",
        alias: ["news/:idSlug", "neuigkeiten/:idSlug"],
        name: "news.detail",
        component: () =>
          import("@/views/site/dynamic/pages/news/NewsDetailView.vue"),
      },

      {
        path: ":type/:slug",
        name: "dynamic",
        component: DynamicPage,
      },

      {
        path: ":pathMatch(.*)*",
        name: "NotFound",
        component: NotFoundView,
      },
      {
        path: "compare",
        alias: ["porownywarka", "vergleich"],
        name: "compare",
        component: ProductCompare,
      },
      {
        path: "search",
        alias: ["szukaj", "suchen"],
        name: "search",
        component: SearchView,
      },

      {
        path: "promotions/products",
        alias: ["promocje/produkty", "aktionen/produkte"],
        name: "promotions.products",
        component: PromotionProductsView
      },

      /* PANEL UŻYTKOWNIKA  */
      {
        path: "panel",
        component: PanelLayout,
        meta: { requiresAuth: true },
        children: [
          {
            path: "",
            name: "panel",
            component: MainPanel,
          },

          {
            path: "after-sales/documents",
            alias: ["posprzedaz/dokumenty", "after-sales/documente"],
            name: "panel.claims.documents",
            component: ClaimDocumentsList,
          },

          {
            path: "after-sales/documents/new",
            alias: ["posprzedaz/dokumenty/nowe", "after-sales/documente/neu"],
            name: "panel.claims.documents.new",
            component: ClaimDocumentsList,
          },

          {
            path: "after-sales/documents/:id",
            alias: ["posprzedaz/dokumenty/:id", "after-sales/documente/:id"],
            name: "panel.claims.document",
            component: ClaimDocumentView,
          },

          {
            path: "after-sales/claims/:id/edit",
            alias: [
              "posprzedaz/zgloszenie/:id/edycja",
              "after-sales/claim/:id/edit",
            ],
            name: "panel.claims.edit",
            component: () =>
              import("@/views/site/dynamic/panel/claims/docs/view/ClaimCaseEditView.vue"),
          },

          {
            path: "after-sales/claims/:id",
            alias: ["posprzedaz/zgloszenie/:id", "after-sales/claim/:id"],
            name: "panel.claims.detail",
            component: ClaimCaseView,
          },

          {
            path: "promotions",
            alias: ["promocje", "aktionen"],
            name: "panel.promotions",
            component: PromotionList,
          },
          {
            path: "promotions/:id",
            alias: ["promocje/:id", "sonderangebot/:id"],
            name: "panel.promotion",
            component: PromotionView,
          },

          {
            path: "documents",
            alias: ["dokumenty", "dokumente"],
            name: "panel.documents",
            component: DocumentsList,
          },
          {
            path: "documents/:id",
            alias: ["dokumenty/:id", "dokumente/:id"],
            name: "panel.document",
            component: DocumentView,
          },

          {
            path: "carts",
            alias: ["koszyki", "warenkoerbe"],
            name: "panel.carts",
            component: CartsList,
          },
          {
            path: "carts/:id",
            alias: ["koszyki/:id", "warenkoerbe/:id"],
            name: "panel.cart",
            component: CartView,
          },

          {
            path: "orders",
            alias: ["zamowienia", "bestellungen"],
            name: "panel.orders",
            component: OrdersList,
          },
          {
            path: "orders/:id",
            alias: ["zamowienia/:id", "bestellungen/:id"],
            name: "panel.order",
            component: OrderView,
          },
          {
            path: "akceptacje",
            alias: ["approvals", "genehmigungen"],
            name: "panel.approvals",
            component: OrderApprovalsList,
            meta: { requiresAdmin: true },
          },
          {
            path: "akceptacje/:id",
            alias: ["approvals/:id", "genehmigungen/:id"],
            name: "panel.approval",
            component: OrderView,
            props: { approvalMode: true },
            meta: { requiresAdmin: true },
          },

          {
            path: "inquiries",
            alias: ["zapytania", "anfragen"],
            name: "panel.inquiries",
            meta: { requiresAuth: true },
            component: Inquiries,
          },
          {
            path: "inquiries/create",
            alias: ["zapytania/dodaj", "anfragen/neu"],
            name: "panel.inquiryCreate",
            component: InquiryCreate,
          },
          {
            path: "inquiries/:id",
            alias: ["zapytania/:id", "anfragen/:id"],
            name: "panel.inquiry",
            component: InquiryView,
          },
          {
            path: "inquiries/edit/:id",
            alias: ["zapytania/edycja/:id", "anfragen/bearbeiten/:id"],
            name: "panel.inquiryEdit",
            component: EditInquiry,
          },

          {
            path: "centerCosts",
            alias: ["centraKosztow", "centerCosts"],
            name: "panel.centerCosts",
            component: CenterCostsList,
          },
          {
            path: "centerCosts/create",
            alias: ["centraKosztow/dodaj", "centerCosts/new"],
            name: "panel.centerCostCreate",
            component: CenterCostCreate,
          },
          {
            path: "centerCosts/edit/:id",
            alias: ["centraKosztow/edycja/:id", "centerCosts/edit/:id"],
            name: "panel.centerCostEdit",
            component: CenterCostEdit,
          },
          {
            path: "offers",
            alias: ["oferty", "angebot"],
            name: "panel.offers",
            component: Offers,
          },

          {
            path: "offerCompanies",
            alias: ["oferty/firmy", "angebote/unternehmen"],
            name: "panel.offers.companies",
            component: OfferCompanies,
          },
          {
            path: "offerCompanies/:id",
            alias: ["oferty/firmy/:id", "angebote/unternehmen/:id"],
            name: "panel.offers.company",
            component: OfferCompanyView,
          },
          {
            path: "offerCompanies/create",
            alias: ["oferty/firmy/dodaj", "angebote/unternehmen/neu"],
            name: "panel.offers.companyCreate",
            component: OfferCompanyCreate,
          },
          {
            path: "offerCompanies/edit/:id",
            alias: [
              "oferty/firmy/edycja/:id",
              "angebote/unternehmen/bearbeiten/:id",
            ],
            name: "panel.offers.companyEdit",
            component: OfferCompanyEdit,
          },

          // {
          //     path: 'inquiries',
          //     alias: ['zapytania', 'anfragen'],
          //     name: 'panel.inquiries',
          //     component: Inquiries,
          // },
          // {
          //     path: 'inquiries/create',
          //     alias: ['zapytania/dodaj', 'anfragen/neu'],
          //     name: 'panel.inquiryCreate',
          //     component: InquiryCreate,
          // },
          // {
          //     path: 'inquiries/:id',
          //     alias: ['zapytania/:id', 'anfragen/:id'],
          //     name: 'panel.inquiry',
          //     component: InquiryView,
          // },
          // {
          //     path: 'inquiries/edit/:id',
          //     alias: ['zapytania/edycja/:id', 'anfragen/bearbeiten/:id'],
          //     name: 'panel.inquiryEdit',
          //     component: EditInquiry,
          // },

          {
            path: "my-carts",
            alias: ["moje-koszyki", "meine-warenkobe"],
            name: "panel.shopCarts",
            component: ShopCartsView,
          },

          {
            path: "favourites",
            alias: ["ulubione", "favoriten"],
            name: "panel.favourites",
            component: FavouritesPanel,
          },
        ],
      },
    ],
  },
];
