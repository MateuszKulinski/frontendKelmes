import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/core/stores/authStore";
import { useI18n } from "vue-i18n";
import { useNavigation } from "@/composables/useNavigation";


export function useUserMenu() {
    const { t } = useI18n();
    const auth = useAuthStore();
    const router = useRouter();
    const { goTo } = useNavigation();

    const open = ref(false);
    const menuRef = ref<HTMLElement | null>(null);

    const toggleMenu = () => {
        open.value = !open.value;
    };


    const navigate = (name: string) => {
        closeMenu();
        goTo(name);
    };


    const logout = () => {
        open.value = false;
        auth.logout();
        router.push("/");
    };

    const closeMenu = () => {
        open.value = false;
    };

    const isAdminRoute = computed(() => {
        return router.currentRoute.value.path.startsWith('/admin')
    })

    const handleClickOutside = (event: MouseEvent) => {
        if (!menuRef.value) return;

        if (!menuRef.value.contains(event.target as Node)) {
            closeMenu();
        }
    };

    const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    };

    onMounted(() => {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
    });

    onBeforeUnmount(() => {
        document.removeEventListener("click", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
    });

    return {
        auth,
        open,
        menuRef,
        toggleMenu,
        navigate,
        logout,
        closeMenu,
        isAdminRoute,
        t
    };
}