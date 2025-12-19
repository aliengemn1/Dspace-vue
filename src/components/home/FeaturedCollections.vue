<script setup>
import { ref, onMounted } from 'vue'
import { collections as collectionsApi, utils } from '@/services/dspace'

const isLoading = ref(true)
const collections = ref([])
const error = ref(null)

// Colors for collections
const collectionColors = ['#006C35', '#C8A415', '#17A2B8', '#1B4D3E', '#6F42C1', '#E83E8C']

const icons = {
  'graduation-cap': 'M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5',
  'scroll': 'M8 21h12a2 2 0 002-2v-2H10v2a2 2 0 11-4 0V5a2 2 0 112 2h12v12',
  'newspaper': 'M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2 M18 14h-8 M15 18h-5 M10 6h8v4h-8z',
  'library': 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
  'image': 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z M21 15l-5-5L5 21',
  'headphones': 'M3 18v-6a9 9 0 0118 0v6 M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z',
  'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'
}

const iconKeys = Object.keys(icons)

function formatCount(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K+'
  }
  return num.toLocaleString('ar-SA')
}

async function fetchCollections() {
  isLoading.value = true
  error.value = null

  try {
    const response = await collectionsApi.getAll({ size: 6 })
    if (response._embedded?.collections) {
      collections.value = response._embedded.collections.map((collection, index) => ({
        id: collection.uuid,
        title: utils.getMetadataValue(collection.metadata, 'dc.title') || collection.name || 'Untitled',
        description: utils.getMetadataValue(collection.metadata, 'dc.description.abstract') ||
                     utils.getMetadataValue(collection.metadata, 'dc.description') || '',
        itemCount: collection.archivedItemsCount || 0,
        icon: iconKeys[index % iconKeys.length],
        color: collectionColors[index % collectionColors.length]
      }))
    } else {
      collections.value = []
    }
  } catch (err) {
    console.error('Failed to fetch collections:', err)
    error.value = err.message || 'فشل تحميل المجموعات'
    collections.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchCollections()
})
</script>

<template>
  <section class="featured-section page-section" aria-labelledby="featured-title">
    <div class="container">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h2 id="featured-title" class="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="section-icon">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            {{ $t('home.featured.title') }}
          </h2>
        </div>
        <router-link to="/communities" class="view-all-link">
          {{ $t('home.featured.viewAll') }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="arrow-icon">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="collections-grid">
        <div v-for="i in 6" :key="i" class="skeleton-collection">
          <div class="skeleton skeleton-icon"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p class="empty-text">{{ error }}</p>
        <button class="btn btn-primary btn-sm" @click="fetchCollections">إعادة المحاولة</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="collections.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <p class="empty-text">لا توجد مجموعات للعرض</p>
      </div>

      <!-- Collections Grid -->
      <div v-else class="collections-grid">
        <router-link
          v-for="collection in collections"
          :key="collection.id"
          :to="`/collection/${collection.id}`"
          class="collection-card"
          :style="{ '--accent-color': collection.color }"
        >
          <div class="collection-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="icons[collection.icon]"/>
            </svg>
          </div>
          <h3 class="collection-title">{{ collection.title }}</h3>
          <p class="collection-description">{{ collection.description }}</p>
          <div class="collection-count">
            <span class="count-value">{{ formatCount(collection.itemCount) }}</span>
            <span class="count-label">{{ $t('browse.items') }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.featured-section {
  background-color: $bg-secondary;
}

.section-header {
  @include flex-between;
  margin-bottom: $spacing-6;

  @include media-down('sm') {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-3;
  }
}

.section-title {
  @include heading-3;
  display: flex;
  align-items: center;
  gap: $spacing-3;
  margin: 0;
}

.section-icon {
  color: $accent-color;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $primary-color;
  text-decoration: none;
  transition: $transition-fast;

  &:hover {
    color: $primary-dark;

    .arrow-icon {
      transform: translateX(-4px);

      [dir='ltr'] & {
        transform: translateX(4px);
      }
    }
  }
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-6;

  @include media-down('lg') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include media-down('sm') {
    grid-template-columns: 1fr;
  }
}

.collection-card {
  @include card;
  padding: $spacing-6;
  text-decoration: none;
  color: inherit;
  text-align: center;
  transition: $transition-default;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
    border-color: var(--accent-color);

    .collection-icon {
      transform: scale(1.1);
      background-color: var(--accent-color);
      color: $white;
    }

    .collection-title {
      color: var(--accent-color);
    }
  }
}

.collection-icon {
  @include flex-center;
  width: 72px;
  height: 72px;
  margin: 0 auto $spacing-4;
  background-color: $bg-secondary;
  border-radius: $border-radius-xl;
  color: var(--accent-color);
  transition: $transition-default;
}

.collection-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-2;
  transition: color $transition-duration-fast ease;
}

.collection-description {
  font-size: $font-size-sm;
  color: $text-muted;
  line-height: $line-height-relaxed;
  margin-bottom: $spacing-4;
  @include truncate(2);
}

.collection-count {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: $spacing-2;
  padding-top: $spacing-4;
  border-top: 1px solid $border-color-light;
}

.count-value {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: var(--accent-color);
}

.count-label {
  font-size: $font-size-sm;
  color: $text-muted;
}

// Skeleton Loading
.skeleton-collection {
  @include card;
  padding: $spacing-6;
  text-align: center;
}

.skeleton-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto $spacing-4;
  border-radius: $border-radius-xl;
}

.skeleton-title {
  height: 24px;
  width: 60%;
  margin: 0 auto $spacing-2;
}

.skeleton-text {
  height: 16px;
  width: 80%;
  margin: 0 auto;
}
</style>
