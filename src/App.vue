<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import CookiesConsent from '@/components/common/CookiesConsent.vue'

const { locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')
</script>

<template>
  <div
    id="kfnl-app"
    class="app-container"
    :class="{ 'rtl': isRTL, 'ltr': !isRTL }"
    :dir="isRTL ? 'rtl' : 'ltr'"
  >
    <!-- Skip to main content link for accessibility -->
    <a href="#main-content" class="skip-link">
      {{ $t('accessibility.skipToContent') }}
    </a>

    <!-- Header -->
    <AppHeader />

    <!-- Main Content -->
    <main id="main-content" class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Cookies Consent -->
    <CookiesConsent />
  </div>
</template>

<style lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $bg-primary;
}

.main-content {
  flex: 1;
  width: 100%;
}

// Skip link for accessibility
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 9999;
  padding: $spacing-sm $spacing-md;
  background-color: $primary-color;
  color: $white;
  text-decoration: none;
  border-radius: 0 0 $border-radius-md $border-radius-md;

  &:focus {
    top: 0;
  }
}

// Page transition animations
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
