import axios from "axios";

import { API_BASE_URL } from "../config/client";

import { useUiStore } from "@/core/stores/uiStore";

const api = axios.create({
  baseURL: API_BASE_URL,
});

const NO_LOADER_ENDPOINTS = [
  "/heartbeat",
  "/ai-chat",
];

const useLoader = (url?: string): boolean =>
  !NO_LOADER_ENDPOINTS.some(endpoint => url?.startsWith(endpoint));

const showLoader = (url?: string): void => {
  if (useLoader(url)) {
    useUiStore().showLoader();
  }
};

const hideLoader = (url?: string): void => {
  if (useLoader(url)) {
    useUiStore().hideLoader();
  }
};

// REQUEST
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  const lang =
    localStorage.getItem("lang") || "pl";

  const langId =
    localStorage.getItem("lang_id");

  showLoader(config.url);

  if (config.headers) {

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    config.headers["Accept-Language"] =
      lang;

    if (langId) {

      config.headers["X-Lang-Id"] =
        langId;
    }
  }

  return config;
});

// RESPONSE
api.interceptors.response.use(

  (response) => {

    hideLoader(response.config.url);

    return response;
  },

  (error) => {

    hideLoader(error.config?.url);

    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    const ui = useUiStore();

    // Unauthorized
    if (error.response?.status === 401) {

      localStorage.removeItem("token");

      const isMeEndpoint =
        error.config?.url === "/me";

      const isAlreadyOnLogin =
        window.location.pathname === "/login" ||
        window.location.pathname === "/logowanie" ||
        window.location.pathname === "/anmeldung";

      if (!isMeEndpoint && !isAlreadyOnLogin) {

        ui.showError(
          "Sesja wygasła"
        );

        window.location.href =
          "/login";
      }
    }

    // Serwer
    else if (
      error.response?.status >= 500
    ) {

      ui.showError(
        "Błąd serwera"
      );
    }

    // Network error
    else if (!error.response) {

      ui.showError(
        "Brak połączenia z serwerem"
      );
    }

    return Promise.reject(error);
  }
);

export default api;
