<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ItemCard from '@/components/common/ItemCard.vue'
import { search, statistics, utils } from '@/services/dspace'

const isLoading = ref(true)
const items = ref([])
const error = ref(null)
let refreshInterval = null

// Auto-refresh interval in milliseconds (60 seconds for most viewed - less frequent due to stats fetching)
const REFRESH_INTERVAL = 60 * 1000

// Fetch most viewed items from DSpace API
async function fetchMostViewedItems(showLoading = true) {
  // Only show loading on initial fetch, not on auto-refresh
  if (showLoading) {
    isLoading.value = true
  }
  error.value = null

  try {
    // Fetch recent items and get their statistics (bypass cache for fresh data)
    const response = await search.query({
      page: 0,
      size: 6,
      sort: 'dc.date.accessioned,DESC'
    }, false)

    if (response._embedded?.searchResult?._embedded?.objects) {
      const apiItems = response._embedded.searchResult._embedded.objects.map(result => {
        const item = result._embedded?.indexableObject
        if (!item) return null

        // Get thumbnail URL - check multiple sources
        let thumbnailUrl = null
        // Check embedded thumbnail (when using embed=thumbnail)
        if (item._embedded?.thumbnail?._links?.content?.href) {
          thumbnailUrl = item._embedded.thumbnail._links.content.href
        }
        // Check item's direct thumbnail link
        else if (item._links?.thumbnail?.href) {
          thumbnailUrl = item._links.thumbnail.href
        }
        // Check wrapper's embedded thumbnail
        else if (result._embedded?.thumbnail?._links?.content?.href) {
          thumbnailUrl = result._embedded.thumbnail._links.content.href
        }
        // Check wrapper object's thumbnail link
        else if (result._links?.thumbnail?.href) {
          thumbnailUrl = result._links.thumbnail.href
        }

        return {
          id: item.uuid,
          title: utils.getMetadataValue(item.metadata, 'dc.title') || 'Untitled',
          author: utils.getMetadataValue(item.metadata, 'dc.contributor.author') || 'Unknown Author',
          date: utils.getMetadataValue(item.metadata, 'dc.date.issued')?.substring(0, 4) || '',
          type: utils.getMetadataValue(item.metadata, 'dc.type') || '',
          collection: '',
          thumbnail: thumbnailUrl,
          views: 0,
          downloads: 0
        }
      }).filter(Boolean)

      // Fetch statistics for each item (bypass cache for fresh stats)
      const itemsWithStats = await Promise.all(
        apiItems.map(async (item) => {
          try {
            const stats = await statistics.getItemStats(item.id, false)
            return {
              ...item,
              views: stats.views || 0,
              downloads: stats.downloads || 0
            }
          } catch {
            return item
          }
        })
      )

      // Sort by views (most viewed first)
      itemsWithStats.sort((a, b) => b.views - a.views)
      items.value = itemsWithStats
    } else {
      items.value = []
    }
  } catch (err) {
    console.error('Failed to fetch most viewed items:', err)
    error.value = err.message || 'فشل تحميل العناصر الأكثر مشاهدة'
    items.value = []
  } finally {
    isLoading.value = false
  }
}

// Start auto-refresh
function startAutoRefresh() {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }

  // Set up periodic refresh (don't show loading spinner on auto-refresh)
  refreshInterval = setInterval(() => {
    fetchMostViewedItems(false)
  }, REFRESH_INTERVAL)
}

// Stop auto-refresh
function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Handle visibility change to pause/resume refresh
function handleVisibilityChange() {
  if (document.hidden) {
    stopAutoRefresh()
  } else {
    // Refresh immediately when tab becomes visible, then restart auto-refresh
    fetchMostViewedItems(false)
    startAutoRefresh()
  }
}

onMounted(() => {
  fetchMostViewedItems(true)
  startAutoRefresh()

  // Listen for visibility changes to optimize resource usage
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stopAutoRefresh()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <section class="most-viewed-section page-section" aria-labelledby="most-viewed-title">
    <div class="container">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h2 id="most-viewed-title" class="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="section-icon">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {{ $t('home.mostViewed.title') }}
          </h2>
        </div>
        <router-link to="/browse?sort=views" class="view-all-link">
          {{ $t('home.mostViewed.viewAll') }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="arrow-icon">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="items-grid">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <div class="skeleton skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 60%"></div>
          </div>
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
        <button class="btn btn-primary btn-sm" @click="fetchMostViewedItems">إعادة المحاولة</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="items.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <p class="empty-text">لا توجد عناصر للعرض</p>
      </div>

      <!-- Items Grid -->
      <div v-else class="items-grid">
        <ItemCard
          v-for="item in items"
          :key="item.id"
          :item="item"
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.most-viewed-section {
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

.section-title-wrapper {
  display: flex;
  align-items: center;
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

  .arrow-icon {
    transition: transform $transition-duration-fast ease;
  }
}

.items-grid {
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

// Skeleton Loading
.skeleton-card {
  @include card;
  overflow: hidden;
}

.skeleton-content {
  padding: $spacing-4;
}

.skeleton-image {
  height: 120px;
}

.skeleton-title {
  height: 20px;
  margin-bottom: $spacing-3;
}

.skeleton-text {
  height: 14px;
  margin-bottom: $spacing-2;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
