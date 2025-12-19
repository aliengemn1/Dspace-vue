<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import InformationArchitectureMap from '@/components/sitemap/InformationArchitectureMap.vue'
import UserJourneyMap from '@/components/sitemap/UserJourneyMap.vue'
import UXRecommendations from '@/components/sitemap/UXRecommendations.vue'

const { t, locale } = useI18n()

const isRtl = computed(() => locale.value === 'ar')

// Active tab
const activeTab = ref('architecture')

const tabs = [
  { id: 'architecture', icon: 'grid' },
  { id: 'journey', icon: 'map' },
  { id: 'ux', icon: 'lightbulb' }
]

// Breadcrumb
const breadcrumbItems = computed(() => [
  { label: t('nav.home'), path: '/' },
  { label: t('sitemap.title'), path: '/sitemap' }
])

function setActiveTab(tabId) {
  activeTab.value = tabId
}
</script>

<template>
  <div class="sitemap-page" :class="{ 'is-rtl': isRtl }">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
      </div>
    </div>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
          </div>
          <h1 class="hero-title">{{ $t('sitemap.heroTitle') }}</h1>
          <p class="hero-description">{{ $t('sitemap.heroDescription') }}</p>
        </div>
      </div>
    </section>

    <!-- Tabs Navigation -->
    <div class="tabs-section">
      <div class="container">
        <div class="tabs-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-btn"
            :class="{ 'is-active': activeTab === tab.id }"
            @click="setActiveTab(tab.id)"
          >
            <!-- Grid Icon -->
            <svg v-if="tab.icon === 'grid'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <!-- Map Icon -->
            <svg v-else-if="tab.icon === 'map'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
            <!-- Lightbulb Icon -->
            <svg v-else-if="tab.icon === 'lightbulb'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="9" y1="18" x2="15" y2="18"/>
              <line x1="10" y1="22" x2="14" y2="22"/>
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
            </svg>
            <span>{{ $t(`sitemap.tabs.${tab.id}`) }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab Content -->
    <main class="tab-content">
      <div class="container">
        <Transition name="fade" mode="out-in">
          <!-- Information Architecture Map -->
          <InformationArchitectureMap v-if="activeTab === 'architecture'" key="architecture" />

          <!-- User Journey Map -->
          <UserJourneyMap v-else-if="activeTab === 'journey'" key="journey" />

          <!-- UX Recommendations -->
          <UXRecommendations v-else-if="activeTab === 'ux'" key="ux" />
        </Transition>
      </div>
    </main>

    <!-- Print/Export Section -->
    <section class="export-section">
      <div class="container">
        <div class="export-content">
          <h3 class="export-title">{{ $t('sitemap.exportTitle') }}</h3>
          <p class="export-description">{{ $t('sitemap.exportDescription') }}</p>
          <div class="export-buttons">
            <button class="export-btn" @click="window.print()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              {{ $t('sitemap.print') }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.sitemap-page {
  min-height: 100vh;
  background-color: $bg-primary;

  &.is-rtl {
    direction: rtl;
  }
}

.page-header {
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
  padding: $spacing-4 0;
}

// Hero Section
.hero-section {
  background: linear-gradient(135deg, $primary-color 0%, color.adjust($primary-color, $lightness: -15%) 100%);
  color: $white;
  padding: $spacing-12 0;
  text-align: center;
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
}

.hero-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: rgba($white, 0.15);
  border-radius: 50%;
  margin-bottom: $spacing-4;

  svg {
    color: $white;
  }
}

.hero-title {
  @include heading-1;
  margin-bottom: $spacing-3;
}

.hero-description {
  font-size: $font-size-lg;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
}

// Tabs Section
.tabs-section {
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
}

.tabs-nav {
  display: flex;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-2 0;

  @include media-down('sm') {
    flex-direction: column;
    gap: $spacing-1;
  }
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-6;
  background-color: transparent;
  border: 2px solid transparent;
  border-radius: $border-radius-lg;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $text-secondary;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    color: $primary-color;
    background-color: rgba($primary-color, 0.05);
  }

  &.is-active {
    color: $primary-color;
    background-color: rgba($primary-color, 0.1);
    border-color: $primary-color;

    svg {
      color: $primary-color;
    }
  }

  svg {
    color: $text-muted;
    transition: $transition-fast;
  }

  @include media-down('sm') {
    width: 100%;
    justify-content: center;
  }
}

// Tab Content
.tab-content {
  padding: $spacing-8 0;
  min-height: 600px;
}

// Export Section
.export-section {
  background-color: $bg-secondary;
  border-top: 1px solid $border-color-light;
  padding: $spacing-8 0;
}

.export-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.export-title {
  @include heading-4;
  color: $text-primary;
  margin-bottom: $spacing-2;
}

.export-description {
  font-size: $font-size-base;
  color: $text-muted;
  margin-bottom: $spacing-4;
}

.export-buttons {
  display: flex;
  justify-content: center;
  gap: $spacing-3;
  flex-wrap: wrap;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-5;
  background-color: $white;
  border: 2px solid $border-color;
  border-radius: $border-radius-md;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $text-primary;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    border-color: $primary-color;
    color: $primary-color;
    background-color: rgba($primary-color, 0.05);
  }

  svg {
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

// Print Styles
@media print {
  .page-header,
  .tabs-section,
  .export-section {
    display: none;
  }

  .hero-section {
    padding: $spacing-4 0;
    background: $white;
    color: $text-primary;
  }

  .tab-content {
    padding: 0;
  }
}
</style>
