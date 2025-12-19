<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const isVisible = ref(false)
const STORAGE_KEY = 'kfnl-cookies-consent'

onMounted(() => {
  const consent = localStorage.getItem(STORAGE_KEY)
  if (!consent) {
    isVisible.value = true
  }
})

function acceptAll() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    necessary: true,
    analytics: true,
    marketing: true,
    timestamp: Date.now()
  }))
  isVisible.value = false
}

function acceptNecessary() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: Date.now()
  }))
  isVisible.value = false
}

function close() {
  isVisible.value = false
}
</script>

<template>
  <Transition name="slide-up">
    <div v-if="isVisible" class="cookies-consent">
      <div class="cookies-content">
        <div class="cookies-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="8" cy="9" r="1" fill="currentColor"/>
            <circle cx="15" cy="8" r="1" fill="currentColor"/>
            <circle cx="10" cy="14" r="1" fill="currentColor"/>
            <circle cx="16" cy="13" r="1" fill="currentColor"/>
            <circle cx="13" cy="17" r="1" fill="currentColor"/>
          </svg>
        </div>
        <div class="cookies-text">
          <h3 class="cookies-title">{{ $t('cookies.title') }}</h3>
          <p class="cookies-description">{{ $t('cookies.description') }}</p>
        </div>
        <div class="cookies-actions">
          <button class="btn btn-primary" @click="acceptAll">
            {{ $t('cookies.acceptAll') }}
          </button>
          <button class="btn btn-secondary" @click="acceptNecessary">
            {{ $t('cookies.acceptNecessary') }}
          </button>
        </div>
        <button class="cookies-close" @click="close" :aria-label="$t('common.close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.cookies-consent {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $z-index-toast;
  padding: $spacing-4;
  background-color: $white;
  border-top: 1px solid $border-color;
  box-shadow: $shadow-lg;
}

.cookies-content {
  display: flex;
  align-items: center;
  gap: $spacing-4;
  max-width: $container-max-width;
  margin: 0 auto;

  @include media-down('md') {
    flex-direction: column;
    text-align: center;
  }
}

.cookies-icon {
  flex-shrink: 0;
  color: $accent-color;

  @include media-down('md') {
    display: none;
  }
}

.cookies-text {
  flex: 1;
}

.cookies-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-1;
}

.cookies-description {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin: 0;
}

.cookies-actions {
  display: flex;
  gap: $spacing-2;
  flex-shrink: 0;

  @include media-down('sm') {
    flex-direction: column;
    width: 100%;
  }
}

.btn {
  @include button-base;
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-sm;

  &.btn-primary {
    background-color: $primary-color;
    color: $white;

    &:hover {
      background-color: $primary-dark;
    }
  }

  &.btn-secondary {
    background-color: transparent;
    color: $primary-color;
    border: 1px solid $primary-color;

    &:hover {
      background-color: $primary-lighter;
    }
  }
}

.cookies-close {
  position: absolute;
  top: $spacing-2;
  right: $spacing-2;
  padding: $spacing-1;
  background: transparent;
  border: none;
  color: $text-muted;
  cursor: pointer;
  border-radius: $border-radius-md;
  transition: $transition-fast;

  &:hover {
    color: $text-primary;
    background-color: $gray-100;
  }

  [dir='rtl'] & {
    right: auto;
    left: $spacing-2;
  }
}

// Transition
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all $transition-duration-normal ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
