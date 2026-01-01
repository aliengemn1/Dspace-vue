<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)

const isFormValid = computed(() => {
  return email.value.trim() && password.value.trim()
})

async function handleSubmit() {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true
  authStore.clearError()

  try {
    await authStore.login(email.value, password.value)
    // Redirect to original destination or profile
    const redirectPath = route.query.redirect || '/profile'
    router.push(redirectPath)
  } catch (err) {
    // Error is handled by the store
  } finally {
    isSubmitting.value = false
  }
}

function togglePassword() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <!-- Header -->
        <div class="login-header">
          <div class="login-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 class="login-title">{{ $t('auth.login') }}</h1>
          <p class="login-subtitle">{{ $t('auth.loginSubtitle') }}</p>
        </div>

        <!-- Error Message -->
        <Transition name="fade">
          <div v-if="authStore.error" class="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ authStore.error }}</span>
          </div>
        </Transition>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">{{ $t('auth.email') }}</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                id="email"
                v-model="email"
                type="email"
                class="form-input"
                :placeholder="$t('auth.emailPlaceholder')"
                required
                autocomplete="email"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">{{ $t('auth.password') }}</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :placeholder="$t('auth.passwordPlaceholder')"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                class="password-toggle"
                @click="togglePassword"
                :aria-label="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"
              >
                <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="submit-btn"
            :disabled="!isFormValid || isSubmitting"
          >
            <span v-if="isSubmitting" class="loading-spinner"></span>
            <span v-else>{{ $t('auth.loginButton') }}</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="login-footer">
          <router-link to="/" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {{ $t('auth.backToHome') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-6;
  background: linear-gradient(135deg, $bg-secondary 0%, $white 100%);
}

.login-container {
  width: 100%;
  max-width: 440px;
}

.login-card {
  background: $white;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-lg;
  padding: $spacing-8;

  @include media-down('sm') {
    padding: $spacing-6;
  }
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-6;
}

.login-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: $primary-lighter;
  color: $primary-color;
  border-radius: 50%;
  margin-bottom: $spacing-4;
}

.login-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin: 0 0 $spacing-2;
}

.login-subtitle {
  font-size: $font-size-base;
  color: $text-muted;
  margin: 0;
}

.error-message {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
  background: rgba($error-color, 0.1);
  border: 1px solid rgba($error-color, 0.2);
  border-radius: $border-radius-md;
  color: $error-color;
  font-size: $font-size-sm;
  margin-bottom: $spacing-4;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.form-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  right: $spacing-3;
  color: $text-muted;
  pointer-events: none;

  [dir="ltr"] & {
    right: auto;
    left: $spacing-3;
  }
}

.form-input {
  width: 100%;
  padding: $spacing-3 $spacing-4;
  padding-right: $spacing-10;
  font-size: $font-size-base;
  border: 2px solid $border-color;
  border-radius: $border-radius-md;
  background: $white;
  color: $text-primary;
  transition: $transition-fast;

  [dir="ltr"] & {
    padding-right: $spacing-4;
    padding-left: $spacing-10;
  }

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
  }

  &::placeholder {
    color: $text-muted;
  }
}

.password-toggle {
  position: absolute;
  left: $spacing-3;
  background: none;
  border: none;
  padding: $spacing-1;
  color: $text-muted;
  cursor: pointer;
  transition: color $transition-duration-fast ease;

  [dir="ltr"] & {
    left: auto;
    right: $spacing-3;
  }

  &:hover {
    color: $primary-color;
  }
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  width: 100%;
  padding: $spacing-4;
  margin-top: $spacing-2;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $white;
  background: $primary-color;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: $transition-fast;

  &:hover:not(:disabled) {
    background: $primary-dark;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba($white, 0.3);
  border-top-color: $white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  margin-top: $spacing-6;
  padding-top: $spacing-4;
  border-top: 1px solid $border-color;
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  color: $text-muted;
  text-decoration: none;
  font-size: $font-size-sm;
  transition: color $transition-duration-fast ease;

  &:hover {
    color: $primary-color;
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
