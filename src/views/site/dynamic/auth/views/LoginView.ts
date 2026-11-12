import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useI18n } from "vue-i18n";

import { useAuthStore } from "@/core/stores/authStore";

export function useLogin() {
    const { t } = useI18n();
    const router = useRouter();
    const auth = useAuthStore();

    const rememberedLoginKey = "remembered_login";
    const login = ref(localStorage.getItem(rememberedLoginKey) || "");
    const password = ref("");
    const rememberMe = ref(true);

    const errorMessage = ref("");
    const loginError = ref("");
    const passwordError = ref("");
    const loading = ref(false);

    const appName = import.meta.env.VITE_APP_NAME;

    const errorMap: Record<string, string> = {
        INVALID_CREDENTIALS: "login.invalid",
    };

    const handleLogin = async () => {
        errorMessage.value = "";
        loginError.value = "";
        passwordError.value = "";

        if (!login.value) {
            loginError.value = t("login.required");
        }

        if (!password.value) {
            passwordError.value = t("login.required");
        }

        if (loginError.value || passwordError.value) return;

        loading.value = true;

        try {
            await auth.login({
                login: login.value,
                password: password.value,
            });

            if (rememberMe.value) {
                localStorage.setItem(rememberedLoginKey, login.value);
            } else {
                localStorage.removeItem(rememberedLoginKey);
            }

            router.push("/");
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const code = error.response?.data?.code;
                errorMessage.value = t(errorMap[code] || "login.error_generic");
            } else {
                errorMessage.value = t("login.error_generic");
            }
        } finally {
            loading.value = false;
        }
    };

    return {
        login,
        password,
        errorMessage,
        loginError,
        passwordError,
        loading,
        rememberMe,
        handleLogin,
        appName,
        t,
    };
}
