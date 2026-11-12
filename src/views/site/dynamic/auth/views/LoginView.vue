<template>
  <section class="login-view" aria-labelledby="login-title">
    <div class="login-panel">
      <header class="login-header">
        <div class="login-avatar" aria-hidden="true">
          <BaseIcon name="user" class="login-user-icon" />
        </div>
        <h1 id="login-title" class="login-title">{{ t("login.heading") }}</h1>
        <p class="login-subtitle">{{ t("login.subtitle") }}</p>
      </header>

      <form class="login-form" novalidate :aria-busy="loading" @submit.prevent="handleLogin">
        <div class="login-field">
          <BaseLabel
            forId="login"
            :error="!!loginError"
            :disabled="loading"
          >
            {{ t("login.email") }}
          </BaseLabel>

          <div class="login-input-wrapper">
            <BaseIcon name="email" class="login-input-icon" aria-hidden="true" />
            <BaseInput
              id="login"
              v-model="login"
              name="login"
              type="text"
              inputmode="email"
              autocomplete="username"
              autocapitalize="none"
              :spellcheck="false"
              required
              :placeholder="t('login.email_placeholder')"
              :error="!!loginError"
              :disabled="loading"
              :aria-invalid="!!loginError"
              :aria-describedby="loginError ? 'login-error' : undefined"
            />
          </div>

          <div v-if="loginError" id="login-error" class="invalid-feedback d-block" role="alert">
            {{ loginError }}
          </div>
        </div>

        <div class="login-field">
          <BaseLabel
            forId="password"
            :error="!!passwordError"
            :disabled="loading"
          >
            {{ t("login.password") }}
          </BaseLabel>

          <div class="login-input-wrapper login-input-wrapper--password">
            <BaseIcon name="lock" class="login-input-icon" aria-hidden="true" />
            <BaseInput
              id="password"
              v-model="password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              :placeholder="t('login.password_placeholder')"
              :error="!!passwordError"
              :disabled="loading"
              :aria-invalid="!!passwordError"
              :aria-describedby="passwordError ? 'password-error' : undefined"
            />
            <button
              class="login-password-toggle"
              type="button"
              :aria-label="t(showPassword ? 'login.hide_password' : 'login.show_password')"
              :aria-pressed="showPassword"
              aria-controls="password"
              :disabled="loading"
              @click="showPassword = !showPassword"
            >
              <BaseIcon :name="showPassword ? 'eyeSlash' : 'eye'" aria-hidden="true" />
            </button>
          </div>

          <div v-if="passwordError" id="password-error" class="invalid-feedback d-block" role="alert">
            {{ passwordError }}
          </div>
        </div>

        <div class="login-options">
          <label class="login-remember" :title="t('login.remember_hint')">
            <input v-model="rememberMe" name="remember" type="checkbox" :disabled="loading" />
            <span>{{ t("login.remember_me") }}</span>
          </label>
          <RouterLink class="login-recovery" :to="t('url.routes.contact')" :title="t('login.recovery_hint')">
            {{ t("login.forgot_password") }}
          </RouterLink>
        </div>

        <div v-if="errorMessage" class="alert alert-danger login-error" role="alert">
          {{ errorMessage }}
        </div>

        <BaseButton class="login-submit" type="submit" :loading="loading" :disabled="loading">
          {{ t("login.button") }}
        </BaseButton>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import BaseInput from "@/views/shared/ui/BaseInput.vue";
import BaseButton from "@/views/shared/ui/BaseButton.vue";
import BaseLabel from "@/views/shared/ui/BaseLabel.vue";
import BaseIcon from "@/views/shared/ui/BaseIcon.vue";

import { useLogin } from "./LoginView";

const {
  login,
  password,
  errorMessage,
  loginError,
  passwordError,
  loading,
  rememberMe,
  handleLogin,
  t,
} = useLogin();

const showPassword = ref(false);
</script>
<style src="./LoginStyle.css" scoped></style>