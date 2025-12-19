<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import SearchBox from './SearchBox.vue'

const { t, locale } = useI18n()
const router = useRouter()

const isMenuOpen = ref(false)
const isSearchOpen = ref(false)

const currentLang = computed(() => locale.value)

const navItems = computed(() => [
  { name: t('nav.home'), path: '/', icon: 'home' },
  { name: t('nav.browse'), path: '/browse', icon: 'folder' },
  { name: t('nav.communities'), path: '/communities', icon: 'users' },
  { name: t('nav.search'), path: '/search', icon: 'search' },
  // { name: t('nav.virtualTour'), path: '/virtual-tour', icon: 'tour', highlight: true },
  { name: t('nav.about'), path: '/about', icon: 'info' },
  { name: t('nav.help'), path: '/help', icon: 'help' }
])

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) {
    isSearchOpen.value = false
  }
}

function toggleSearch() {
  isSearchOpen.value = !isSearchOpen.value
  if (isSearchOpen.value) {
    isMenuOpen.value = false
  }
}

function toggleLanguage() {
  locale.value = locale.value === 'ar' ? 'en' : 'ar'
  document.documentElement.lang = locale.value
  document.documentElement.dir = locale.value === 'ar' ? 'rtl' : 'ltr'
}

function closeMenu() {
  isMenuOpen.value = false
}

function handleSearch(query) {
  if (query.trim()) {
    router.push({ path: '/search', query: { q: query } })
    isSearchOpen.value = false
  }
}
</script>

<template>
  <header class="app-header">
    <!-- Top Bar -->
    <div class="header-top">
      <div class="container">
        <div class="header-top-content">
          <div class="header-links">
            <a href="https://kfnl.gov.sa" target="_blank" rel="noopener" class="header-link">
              {{ $t('header.mainSite') }}
            </a>
            <a href="/contact" class="header-link">
              {{ $t('nav.contact') }}
            </a>
          </div>
          <div class="header-actions">
            <button
              class="lang-toggle"
              @click="toggleLanguage"
              :aria-label="$t('header.switchLanguage')"
            >
              <span class="lang-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </span>
              <span class="lang-text">{{ currentLang === 'ar' ? 'English' : 'العربية' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Header -->
    <div class="header-main">
      <div class="container">
        <div class="header-main-content">
          <!-- Logo -->
          <router-link to="/" class="header-logo" :aria-label="$t('header.goToHome')">
            <img src="/images/kfnl-logo.png" :alt="$t('header.title')" class="logo-image" />
            <div class="logo-text">
              <span class="logo-title">{{ $t('header.title') }}</span>
              <span class="logo-subtitle">{{ $t('header.subtitle') }}</span>
            </div>
          </router-link>

          <!-- Desktop Navigation -->
          <nav class="header-nav hide-md-down" role="navigation" :aria-label="$t('nav.main')">
            <ul class="nav-list">
              <li v-for="item in navItems" :key="item.path" class="nav-item">
                <router-link
                  :to="item.path"
                  class="nav-link"
                  :class="{ 'nav-link-highlight': item.highlight }"
                  active-class="active"
                  exact-active-class="exact-active"
                >
                  {{ item.name }}
                </router-link>
              </li>
            </ul>
          </nav>

          <!-- Desktop Search -->
          <div class="header-search hide-md-down">
            <SearchBox
              :placeholder="$t('search.placeholder')"
              @search="handleSearch"
              compact
            />
          </div>

          <!-- Mobile Actions -->
          <div class="header-mobile-actions hide-md-up">
            <button
              class="mobile-action-btn"
              @click="toggleSearch"
              :aria-label="$t('search.toggle')"
              :aria-expanded="isSearchOpen"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <button
              class="mobile-action-btn menu-toggle"
              @click="toggleMenu"
              :aria-label="$t('nav.toggleMenu')"
              :aria-expanded="isMenuOpen"
            >
              <span class="menu-icon" :class="{ 'is-open': isMenuOpen }">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Search Panel -->
    <Transition name="slide-down">
      <div v-if="isSearchOpen" class="mobile-search-panel hide-md-up">
        <div class="container">
          <SearchBox
            :placeholder="$t('search.placeholder')"
            @search="handleSearch"
            autofocus
          />
        </div>
      </div>
    </Transition>

    <!-- Mobile Navigation Panel -->
    <Transition name="slide-down">
      <div v-if="isMenuOpen" class="mobile-nav-panel hide-md-up">
        <div class="container">
          <nav role="navigation" :aria-label="$t('nav.mobile')">
            <ul class="mobile-nav-list">
              <li v-for="item in navItems" :key="item.path" class="mobile-nav-item">
                <router-link
                  :to="item.path"
                  class="mobile-nav-link"
                  @click="closeMenu"
                  active-class="active"
                >
                  {{ item.name }}
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.app-header {
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
  background-color: $white;
  box-shadow: $shadow-sm;
}

// Top Bar
.header-top {
  background-color: $primary-color;
  color: $white;
  padding: $spacing-2 0;
  font-size: $font-size-sm;

  .header-top-content {
    @include flex-between;
  }

  .header-links {
    display: flex;
    gap: $spacing-4;
  }

  .header-link {
    color: rgba($white, 0.9);
    text-decoration: none;
    transition: color $transition-duration-fast ease;

    &:hover {
      color: $white;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: $spacing-4;
  }
}

.lang-toggle {
  @include flex-center;
  gap: $spacing-2;
  padding: $spacing-1 $spacing-3;
  background-color: rgba($white, 0.1);
  border: 1px solid rgba($white, 0.2);
  border-radius: $border-radius-full;
  color: $white;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: rgba($white, 0.2);
  }

  .lang-icon {
    display: flex;
  }

  .lang-text {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }
}

// Main Header
.header-main {
  padding: $spacing-5 0;

  @include media-down('md') {
    padding: $spacing-4 0;
  }

  .header-main-content {
    @include flex-between;
    gap: $spacing-6;
  }
}

// Logo
.header-logo {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  text-decoration: none;
  color: $text-primary;

  .logo-image {
    height: 50px;
    width: auto;
    flex-shrink: 0;

    @include media-down('sm') {
      height: 40px;
    }
  }

  .logo-text {
    display: flex;
    flex-direction: column;

    @include media-down('sm') {
      display: none;
    }
  }

  .logo-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $primary-color;
    line-height: 1.2;

    @include media-down('md') {
      font-size: $font-size-base;
    }
  }

  .logo-subtitle {
    font-size: $font-size-sm;
    color: $text-muted;
    line-height: 1.2;

    @include media-down('md') {
      font-size: $font-size-xs;
    }
  }
}

// Desktop Navigation
.header-nav {
  flex: 1;
  display: flex;
  justify-content: center;

  .nav-list {
    display: flex;
    align-items: center;
    gap: $spacing-1;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-item {
    display: flex;
    align-items: center;
  }

  .nav-link {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-2 $spacing-3;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    text-decoration: none;
    border-radius: $border-radius-md;
    transition: $transition-fast;
    white-space: nowrap;
    height: 40px;

    &:hover {
      color: $primary-color;
      background-color: $primary-lighter;
    }

    &.active,
    &.exact-active {
      color: $primary-color;
      background-color: $primary-lighter;
    }

    &.nav-link-highlight {
      background: linear-gradient(135deg, $accent-color, color.adjust($accent-color, $lightness: -10%));
      color: $primary-dark;
      font-weight: $font-weight-semibold;

      &:hover {
        background: linear-gradient(135deg, color.adjust($accent-color, $lightness: 5%), $accent-color);
        color: $primary-dark;
      }
    }
  }
}

// Desktop Search
.header-search {
  width: 280px;
  flex-shrink: 0;
}

// Mobile Actions
.header-mobile-actions {
  display: flex;
  align-items: center;
  gap: $spacing-2;
}

.mobile-action-btn {
  @include flex-center;
  width: 44px;
  height: 44px;
  background-color: transparent;
  border: none;
  border-radius: $border-radius-md;
  color: $text-primary;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: $bg-secondary;
  }
}

// Hamburger Menu Icon
.menu-icon {
  position: relative;
  width: 24px;
  height: 18px;

  span {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: currentColor;
    border-radius: 2px;
    transition: $transition-fast;

    &:nth-child(1) {
      top: 0;
    }

    &:nth-child(2) {
      top: 50%;
      transform: translateY(-50%);
    }

    &:nth-child(3) {
      bottom: 0;
    }
  }

  &.is-open {
    span:nth-child(1) {
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
    }

    span:nth-child(2) {
      opacity: 0;
    }

    span:nth-child(3) {
      bottom: 50%;
      transform: translateY(50%) rotate(-45deg);
    }
  }
}

// Mobile Search Panel
.mobile-search-panel {
  padding: $spacing-4 0;
  background-color: $bg-secondary;
  border-top: 1px solid $border-color;
}

// Mobile Navigation Panel
.mobile-nav-panel {
  padding: $spacing-4 0;
  background-color: $white;
  border-top: 1px solid $border-color;
  box-shadow: $shadow-md;

  .mobile-nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .mobile-nav-link {
    display: block;
    padding: $spacing-3 $spacing-4;
    font-size: $font-size-lg;
    font-weight: $font-weight-medium;
    color: $text-primary;
    text-decoration: none;
    border-radius: $border-radius-md;
    transition: $transition-fast;

    &:hover,
    &.active {
      color: $primary-color;
      background-color: $primary-lighter;
    }
  }
}

// Transitions
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all $transition-duration-normal ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
