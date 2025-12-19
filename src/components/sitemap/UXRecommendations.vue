<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const isRtl = computed(() => locale.value === 'ar')

// UX Recommendations categories
const recommendations = ref([
  {
    id: 'accessibility',
    icon: 'accessibility',
    color: '#006C35',
    priority: 'high',
    items: ['wcag', 'screenReader', 'keyboardNav', 'colorContrast', 'focusIndicators']
  },
  {
    id: 'performance',
    icon: 'zap',
    color: '#17A2B8',
    priority: 'high',
    items: ['lazyLoading', 'caching', 'compression', 'cdnUsage', 'codeOptimization']
  },
  {
    id: 'navigation',
    icon: 'compass',
    color: '#C8A415',
    priority: 'medium',
    items: ['breadcrumbs', 'searchSuggestions', 'facetedSearch', 'relatedContent', 'clearCTA']
  },
  {
    id: 'responsiveness',
    icon: 'smartphone',
    color: '#6F42C1',
    priority: 'high',
    items: ['mobileFirst', 'touchFriendly', 'adaptiveImages', 'responsiveTypography', 'flexibleGrids']
  },
  {
    id: 'bilingual',
    icon: 'globe',
    color: '#FD7E14',
    priority: 'high',
    items: ['rtlSupport', 'languageSwitch', 'culturalAdaptation', 'contentParity', 'dynamicDirection']
  },
  {
    id: 'sustainability',
    icon: 'shield',
    color: '#1B4D3E',
    priority: 'medium',
    items: ['persistentIds', 'metadataStandards', 'preservation', 'interoperability', 'versionControl']
  }
])

// Priority badges
const priorityColors = {
  high: '#dc3545',
  medium: '#fd7e14',
  low: '#28a745'
}

const expandedCategory = ref(null)

function toggleCategory(categoryId) {
  expandedCategory.value = expandedCategory.value === categoryId ? null : categoryId
}
</script>

<template>
  <div class="ux-recommendations" :class="{ 'is-rtl': isRtl }">
    <!-- Section Header -->
    <div class="recommendations-header">
      <h2 class="recommendations-title">{{ $t('sitemap.ux.title') }}</h2>
      <p class="recommendations-description">{{ $t('sitemap.ux.description') }}</p>
    </div>

    <!-- Recommendations Grid -->
    <div class="recommendations-grid">
      <div
        v-for="category in recommendations"
        :key="category.id"
        class="recommendation-card"
        :class="{ 'is-expanded': expandedCategory === category.id }"
        :style="{ '--card-color': category.color }"
        @click="toggleCategory(category.id)"
      >
        <!-- Card Header -->
        <div class="card-header">
          <div class="card-icon">
            <!-- Accessibility -->
            <svg v-if="category.id === 'accessibility'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="4" r="2"/>
              <path d="M12 6v8"/>
              <path d="M12 14l-4 4"/>
              <path d="M12 14l4 4"/>
              <path d="M7 10h10"/>
            </svg>
            <!-- Performance -->
            <svg v-else-if="category.id === 'performance'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <!-- Navigation -->
            <svg v-else-if="category.id === 'navigation'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
            <!-- Responsiveness -->
            <svg v-else-if="category.id === 'responsiveness'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            <!-- Bilingual -->
            <svg v-else-if="category.id === 'bilingual'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <!-- Sustainability -->
            <svg v-else-if="category.id === 'sustainability'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>

          <div class="card-info">
            <h3 class="card-title">{{ $t(`sitemap.ux.categories.${category.id}`) }}</h3>
            <span
              class="priority-badge"
              :style="{ backgroundColor: priorityColors[category.priority] }"
            >
              {{ $t(`sitemap.ux.priority.${category.priority}`) }}
            </span>
          </div>

          <div class="expand-icon" :class="{ 'is-rotated': expandedCategory === category.id }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        <!-- Card Content (Expanded) -->
        <Transition name="expand">
          <div v-if="expandedCategory === category.id" class="card-content">
            <ul class="recommendation-list">
              <li
                v-for="item in category.items"
                :key="item"
                class="recommendation-item"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>{{ $t(`sitemap.ux.items.${item}`) }}</span>
              </li>
            </ul>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="summary-section">
      <h3 class="summary-title">{{ $t('sitemap.ux.summary') }}</h3>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon" style="--icon-color: #006C35">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <div class="summary-info">
            <span class="summary-value">DSpace 9</span>
            <span class="summary-label">{{ $t('sitemap.ux.compatible') }}</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon" style="--icon-color: #17A2B8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <div class="summary-info">
            <span class="summary-value">AR / EN</span>
            <span class="summary-label">{{ $t('sitemap.ux.bilingualSupport') }}</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon" style="--icon-color: #C8A415">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="4" r="2"/>
              <path d="M12 6v8"/>
              <path d="M12 14l-4 4"/>
              <path d="M12 14l4 4"/>
              <path d="M7 10h10"/>
            </svg>
          </div>
          <div class="summary-info">
            <span class="summary-value">WCAG 2.1</span>
            <span class="summary-label">{{ $t('sitemap.ux.accessibilityLevel') }}</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon" style="--icon-color: #6F42C1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </div>
          <div class="summary-info">
            <span class="summary-value">100%</span>
            <span class="summary-label">{{ $t('sitemap.ux.responsiveDesign') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Principles -->
    <div class="principles-section">
      <h3 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
        {{ $t('sitemap.ux.keyPrinciples') }}
      </h3>

      <div class="principles-grid">
        <div class="principle-card">
          <div class="principle-number">1</div>
          <h4 class="principle-title">{{ $t('sitemap.ux.principles.userCentric') }}</h4>
          <p class="principle-desc">{{ $t('sitemap.ux.principles.userCentricDesc') }}</p>
        </div>

        <div class="principle-card">
          <div class="principle-number">2</div>
          <h4 class="principle-title">{{ $t('sitemap.ux.principles.accessible') }}</h4>
          <p class="principle-desc">{{ $t('sitemap.ux.principles.accessibleDesc') }}</p>
        </div>

        <div class="principle-card">
          <div class="principle-number">3</div>
          <h4 class="principle-title">{{ $t('sitemap.ux.principles.sustainable') }}</h4>
          <p class="principle-desc">{{ $t('sitemap.ux.principles.sustainableDesc') }}</p>
        </div>

        <div class="principle-card">
          <div class="principle-number">4</div>
          <h4 class="principle-title">{{ $t('sitemap.ux.principles.institutional') }}</h4>
          <p class="principle-desc">{{ $t('sitemap.ux.principles.institutionalDesc') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ux-recommendations {
  padding: $spacing-6;

  &.is-rtl {
    direction: rtl;
  }
}

.recommendations-header {
  text-align: center;
  margin-bottom: $spacing-8;
}

.recommendations-title {
  @include heading-2;
  color: $primary-color;
  margin-bottom: $spacing-2;
}

.recommendations-description {
  color: $text-muted;
  font-size: $font-size-base;
}

.section-title {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  @include heading-4;
  color: $text-primary;
  margin-bottom: $spacing-4;
  padding-bottom: $spacing-2;
  border-bottom: 2px solid $primary-color;

  svg {
    color: $primary-color;
  }
}

// Recommendations Grid
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-4;
  margin-bottom: $spacing-8;

  @include media-down('lg') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include media-down('sm') {
    grid-template-columns: 1fr;
  }
}

.recommendation-card {
  background-color: $white;
  border: 2px solid $border-color-light;
  border-radius: $border-radius-lg;
  overflow: hidden;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    border-color: var(--card-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.is-expanded {
    border-color: var(--card-color);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-4;
  background: linear-gradient(135deg, rgba(var(--card-color), 0.05) 0%, transparent 100%);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background-color: var(--card-color);
  border-radius: $border-radius-lg;
  color: $white;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0 0 $spacing-1;
}

.priority-badge {
  display: inline-block;
  padding: $spacing-1 $spacing-2;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  color: $white;
  border-radius: $border-radius-full;
  text-transform: uppercase;
}

.expand-icon {
  color: $text-muted;
  transition: transform 0.3s ease;

  &.is-rotated {
    transform: rotate(180deg);
  }
}

.card-content {
  padding: 0 $spacing-4 $spacing-4;
  border-top: 1px solid $border-color-light;
}

.recommendation-list {
  list-style: none;
  padding: $spacing-3 0 0;
  margin: 0;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 0;
  font-size: $font-size-sm;
  color: $text-primary;

  svg {
    color: $success-color;
    flex-shrink: 0;
  }
}

// Summary Section
.summary-section {
  margin-bottom: $spacing-8;
}

.summary-title {
  @include heading-4;
  color: $text-primary;
  margin-bottom: $spacing-4;
  text-align: center;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-4;

  @include media-down('lg') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include media-down('sm') {
    grid-template-columns: 1fr;
  }
}

.summary-card {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-4;
  background-color: $white;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  transition: $transition-fast;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: rgba(var(--icon-color), 0.1);
  border-radius: $border-radius-md;
  color: var(--icon-color);
}

.summary-info {
  display: flex;
  flex-direction: column;
}

.summary-value {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.summary-label {
  font-size: $font-size-sm;
  color: $text-muted;
}

// Principles Section
.principles-section {
  margin-bottom: $spacing-8;
}

.principles-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-4;

  @include media-down('lg') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include media-down('sm') {
    grid-template-columns: 1fr;
  }
}

.principle-card {
  position: relative;
  padding: $spacing-6 $spacing-4 $spacing-4;
  background-color: $white;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  text-align: center;
  transition: $transition-fast;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: $primary-color;

    .principle-number {
      background-color: $primary-color;
    }
  }
}

.principle-number {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $accent-color;
  color: $white;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  border-radius: 50%;
  transition: $transition-fast;
}

.principle-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0 0 $spacing-2;
}

.principle-desc {
  font-size: $font-size-sm;
  color: $text-muted;
  margin: 0;
  line-height: 1.5;
}

// Transitions
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 300px;
}
</style>
