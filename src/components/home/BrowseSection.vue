<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const browseOptions = computed(() => [
  {
    id: 'author',
    title: t('home.browse.byAuthor'),
    description: 'استعرض المحتوى حسب أسماء المؤلفين والباحثين',
    icon: 'users',
    path: '/browse?type=author',
    color: '#006C35'
  },
  {
    id: 'subject',
    title: t('home.browse.bySubject'),
    description: 'تصفح حسب الموضوعات والتخصصات العلمية',
    icon: 'tag',
    path: '/browse?type=subject',
    color: '#17A2B8'
  },
  {
    id: 'date',
    title: t('home.browse.byDate'),
    description: 'استعرض المحتوى حسب تاريخ النشر',
    icon: 'calendar',
    path: '/browse?type=date',
    color: '#C8A415'
  },
  {
    id: 'type',
    title: t('home.browse.byType'),
    description: 'تصفح حسب نوع المحتوى (رسائل، كتب، مقالات)',
    icon: 'layers',
    path: '/browse?type=type',
    color: '#6F42C1'
  }
])

const icons = {
  'users': 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 7a4 4 0 100 8 4 4 0 000-8z',
  'tag': 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01',
  'calendar': 'M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z M16 2v4 M8 2v4 M3 10h18',
  'layers': 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5'
}
</script>

<template>
  <section class="browse-section page-section" aria-labelledby="browse-title">
    <div class="container">
      <div class="section-header text-center">
        <h2 id="browse-title" class="section-title">
          {{ $t('home.browse.title') }}
        </h2>
        <p class="section-subtitle">
          اختر طريقة التصفح المناسبة للوصول إلى المحتوى المطلوب
        </p>
      </div>

      <div class="browse-grid">
        <router-link
          v-for="option in browseOptions"
          :key="option.id"
          :to="option.path"
          class="browse-card"
          :style="{ '--accent-color': option.color }"
        >
          <div class="browse-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="icons[option.icon]"/>
            </svg>
          </div>
          <div class="browse-content">
            <h3 class="browse-title">{{ option.title }}</h3>
            <p class="browse-description">{{ option.description }}</p>
          </div>
          <div class="browse-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.browse-section {
  background-color: $bg-primary;
}

.section-header {
  margin-bottom: $spacing-8;

  .section-title {
    @include heading-2;
    margin-bottom: $spacing-3;
  }

  .section-subtitle {
    font-size: $font-size-lg;
    color: $text-muted;
    max-width: 500px;
    margin-inline: auto;
  }
}

.browse-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-4;

  @include media-down('md') {
    grid-template-columns: 1fr;
  }
}

.browse-card {
  @include card;
  display: flex;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-5;
  text-decoration: none;
  color: inherit;
  transition: $transition-default;

  &:hover {
    transform: translateX(-4px);
    box-shadow: $shadow-md;
    border-color: var(--accent-color);

    [dir='ltr'] & {
      transform: translateX(4px);
    }

    .browse-icon {
      background-color: var(--accent-color);
      color: $white;
    }

    .browse-arrow {
      color: var(--accent-color);
      transform: translateX(-4px);

      [dir='ltr'] & {
        transform: translateX(4px);
      }
    }
  }
}

.browse-icon {
  @include flex-center;
  width: 56px;
  height: 56px;
  background-color: $bg-secondary;
  border-radius: $border-radius-lg;
  color: var(--accent-color);
  flex-shrink: 0;
  transition: $transition-default;
}

.browse-content {
  flex: 1;
  min-width: 0;
}

.browse-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-1;
}

.browse-description {
  font-size: $font-size-sm;
  color: $text-muted;
  margin: 0;
  @include truncate(2);
}

.browse-arrow {
  color: $text-light;
  flex-shrink: 0;
  transition: $transition-fast;

  [dir='rtl'] & {
    transform: rotate(180deg);
  }
}
</style>
