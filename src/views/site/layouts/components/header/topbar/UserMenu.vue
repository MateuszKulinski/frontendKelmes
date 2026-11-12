<template>
  <button v-if="!auth.isLogged" type="button" class="d-flex flex-column align-items-center login-avatar"
    :class="{ 'compact-login': compact }" :aria-label="t('login.login_top_btn')"
    @click="navigate('login')">
    <BaseIcon name="user" class="login-icon primary-color" aria-hidden="true" />
    <span class="item-title login-label primary-color">{{ t("login.login_top_btn") }}</span>
  </button>
  <div v-else class="dropdown d-inline-block" :class="{ 'compact-user-menu': compact }" ref="menuRef">
    <button type="button" class="d-flex flex-column align-items-center login-avatar" :aria-label="t('user.my_account')"
      :aria-expanded="open" @click.stop="toggleMenu">
      <BaseIcon name="user" />
      <span v-if="limitApprovalStore.pendingCount > 0" class="cart-badge white account-approval-badge">
        {{ limitApprovalStore.pendingCount }}
      </span>
      <span class="item-title">{{ t('user.my_account') }}</span>
    </button>
    <div v-if="open" class="dropdown-menu dropdown-menu-end show">
      <div class="dropdown-header">
        <strong>{{ auth.fullName }}</strong>
        <div class="text-muted small">
          {{ auth.currentUnitName }}
        </div>
        <BaseButton v-if="auth.canSwitchUnit" class="dropdown-item-menu" @click="openSwitchUnitModal">
          {{ t("changeUnit.title") }}
        </BaseButton>
      </div>

      <hr class="dropdown-divider" />

      <LanguageSwitcher />
      <CurrencySwitcher />

      <!-- <BaseButton variant="dropdown" class="dropdown-item-menu" @click="navigate('dashboard')">
        {{ t("menu.dashboard") }}
      </BaseButton> -->

      <BaseButton variant="dropdown" class="dropdown-item-menu" @click="navigate('panel')">
        {{ t("menu.panel") }}
      </BaseButton>

      <BaseButton variant="dropdown" v-if="isAdminRoute" class="dropdown-item-menu text-warning"
        @click="navigate('dashboard')">
        {{ t("menu.shop") }}
      </BaseButton>

      <BaseButton variant="dropdown" v-else-if="auth.isSuperAdmin" class="dropdown-item-menu text-primary"
        @click="navigate('admin')">
        {{ t("menu.admin") }}
      </BaseButton>

      <div class="px-3 pt-2">
        <BaseButton variant="secondary" @click="logout" class="w-100">
          {{ t("login.logout") }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import LanguageSwitcher from "@topbar/LanguageSwitcher.vue";
import { useUserMenu } from "./UserMenu.ts";
import BaseButton from "@/views/shared/ui/BaseButton.vue";
import { useModalStore } from "@/core/stores/modalStore";
import SwitchUnitModal from "@/views/modals/swtichunit/SwitchUnitModal.vue";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";
import { watch, onMounted, onBeforeUnmount } from "vue";
import api from "@/core/api/axios";
import { useUiStore } from "@/core/stores/uiStore";
import { useLimitApprovalStore } from "@/core/stores/limitApprovalStore";

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });

const modal = useModalStore();
const ui = useUiStore();
const limitApprovalStore = useLimitApprovalStore();

const openSwitchUnitModal = () => {
  closeMenu();

  modal.openModal(SwitchUnitModal, {
    modalTitle: t("changeUnit.title"),
  });
};

const {
  auth,
  open,
  menuRef,
  toggleMenu,
  navigate,
  logout,
  closeMenu,
  isAdminRoute,
  t,
} = useUserMenu();

void menuRef;

async function loadPendingApprovalCount() {
  if (!auth.isAdmin) {
    limitApprovalStore.pendingCount = 0;
    return;
  }

  try {
    const { data } = await api.get<{ count: number }>('/limit-approvals/pending-count');
    limitApprovalStore.pendingCount = data.count;
  } catch {
    ui.showError(t('orderApproval.count_error'));
  }
}

function refreshApprovalCount() {
  void loadPendingApprovalCount();
}

watch(() => auth.isAdmin, refreshApprovalCount, { immediate: true });
onMounted(() => {
  window.addEventListener('limit-approval-updated', refreshApprovalCount);
});
onBeforeUnmount(() => {
  window.removeEventListener('limit-approval-updated', refreshApprovalCount);
});
</script>

<style>
.login-avatar {
  position: relative;
  font-size: 1.2rem;
  color: inherit;
  cursor: pointer;
  border: 0;
  background: transparent;
  padding: 0;
}
.account-approval-badge {
  top: -6px;
  right: -12px;
}

.item-title {
  font-size: var(--font-size-sm);
  color: #000000A6;
  font-weight: 400;
}

.dropdown-menu {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-md);
  padding: var(--padding-sm);
}

.dropdown-header {
  padding: var(--padding-sm);
  width: 100%;
}
</style>

<style scoped>
@media (max-width: 991.98px) {

  .compact-login,
  .compact-user-menu .login-avatar {
    width: 40px;
    height: 44px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary) !important;
    background: transparent !important;
    border: 0;
    font-size: 22px;
    flex-shrink: 0;
  }

  .compact-login .login-icon {
    display: inline-block;
    color: var(--accent);
    font-size: 22px;
  }

  .compact-login .login-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .compact-login:focus-visible,
  .compact-user-menu .login-avatar:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .compact-user-menu .dropdown-menu {
    right: calc(-40px - var(--header-action-gap, 4px));
    width: min(320px, calc(100vw - 24px));
    max-height: calc(100dvh - var(--header-height, 160px) - 12px);
    overflow-y: auto;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .compact-user-menu .dropdown-header {
    white-space: normal;
  }
}
</style>
