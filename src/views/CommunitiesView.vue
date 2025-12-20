<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import { communities } from '@/services/dspace'

const { t, locale } = useI18n()

const communityList = ref([])
const isLoading = ref(true)

const error = ref(null)

const breadcrumbItems = computed(() => [
  { label: t('nav.home'), path: '/' },
  { label: t('nav.communities'), path: null }
])

async function loadCommunities() {
  isLoading.value = true

  try {
    const response = await communities.getTopLevel()
    const communitiesData = response._embedded?.communities || []

    // Map community data with proper field names from DSpace API
    communityList.value = communitiesData.map(community => ({
      id: community.uuid || community.id,
      name: community.name || '',
      description: community.metadata?.['dc.description']?.[0]?.value || '',
      // DSpace 7 uses archivedItemsCount for item count
      itemCount: community.archivedItemsCount || 0,
      // Collection count will be fetched separately
      collectionCount: 0
    }))

    console.log('Loaded communities:', communityList.value)

    // Fetch collection counts for each community in parallel
    await Promise.all(communityList.value.map(async (community) => {
      try {
        const collectionsResponse = await communities.getCollections(community.id, { size: 1 })
        // Get total count from page info
        community.collectionCount = collectionsResponse.page?.totalElements || 0
      } catch (err) {
        console.error('Error loading collections for community:', community.id, err)
        community.collectionCount = 0
      }
    }))

    console.log('Communities with collection counts:', communityList.value)
  } catch (err) {
    console.error('Error loading communities:', err)
    error.value = err.message || t('common.error')
  } finally {
    isLoading.value = false
  }
}

function formatCount(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K+'
  }
  return num.toLocaleString('ar-SA')
}

onMounted(() => {
  loadCommunities()
})
</script>

<template>
  <div class="communities-view">
    <!-- Breadcrumb -->
    <div class="breadcrumb-section">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
      </div>
    </div>

    <!-- Header -->
    <div class="communities-header">
      <div class="container">
        <h1 class="page-title">{{ $t('browse.communities') }}</h1>
        <p class="page-description">
          {{ locale === 'ar' ? 'استعرض مجتمعات المستودع الرقمي والوصول إلى مجموعاتها المختلفة' : 'Browse digital repository communities and access their collections' }}
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="communities-content">
      <div class="container">
        <!-- Loading -->
        <div v-if="isLoading" class="loading-container">
          <div class="spinner"></div>
          <p>{{ $t('common.loading') }}</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="error-container">
          <div class="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p>{{ error }}</p>
          <button @click="loadCommunities" class="retry-btn">{{ $t('common.retry') }}</button>
        </div>

        <!-- Communities Grid -->
        <div v-else class="communities-grid">
          <router-link
            v-for="community in communityList"
            :key="community.id"
            :to="`/community/${community.id}`"
            class="community-card"
          >
            <div class="community-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div class="community-content">
              <h2 class="community-name">{{ community.name }}</h2>
              <p class="community-description">{{ community.description }}</p>
              <div class="community-stats">
                <span class="stat">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  {{ formatCount(community.itemCount || 0) }} {{ $t('browse.items') }}
                </span>
                <span class="stat">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  {{ community.collectionCount || 0 }} {{ $t('browse.collections') }}
                </span>
              </div>
            </div>
            <div class="community-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.communities-view {
  min-height: 100vh;
  background-color: $bg-secondary;
}

.breadcrumb-section {
  padding: $spacing-3 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
}

.communities-header {
  padding: $spacing-8 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
  text-align: center;
}

.page-title {
  @include heading-2;
  margin-bottom: $spacing-3;
}

.page-description {
  color: $text-muted;
  max-width: 600px;
  margin: 0 auto;
}

.communities-content {
  padding: $spacing-8 0;
}

.loading-container {
  @include flex-column-center;
  padding: $spacing-12;
  gap: $spacing-4;
}

.error-container {
  @include flex-column-center;
  padding: $spacing-12;
  gap: $spacing-4;
  text-align: center;

  .error-icon {
    color: $text-light;
  }

  p {
    color: $text-muted;
  }

  .retry-btn {
    @include button-primary;
    margin-top: $spacing-4;
  }
}

.communities-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.community-card {
  @include card;
  display: flex;
  align-items: center;
  gap: $spacing-5;
  padding: $spacing-6;
  text-decoration: none;
  color: inherit;
  transition: $transition-default;

  &:hover {
    transform: translateX(-4px);
    box-shadow: $shadow-md;
    border-color: $primary-color;

    [dir='ltr'] & {
      transform: translateX(4px);
    }

    .community-icon {
      background-color: $primary-color;
      color: $white;
    }

    .community-arrow {
      color: $primary-color;
    }
  }
}

.community-icon {
  @include flex-center;
  width: 72px;
  height: 72px;
  background-color: $primary-lighter;
  border-radius: $border-radius-xl;
  color: $primary-color;
  flex-shrink: 0;
  transition: $transition-default;
}

.community-content {
  flex: 1;
  min-width: 0;
}

.community-name {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-2;
}

.community-description {
  font-size: $font-size-sm;
  color: $text-muted;
  margin-bottom: $spacing-3;
  @include truncate(2);
}

.community-stats {
  display: flex;
  gap: $spacing-4;
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1;
  font-size: $font-size-sm;
  color: $text-secondary;

  svg {
    color: $text-muted;
  }
}

.community-arrow {
  color: $text-light;
  flex-shrink: 0;
  transition: color $transition-duration-fast ease;

  [dir='rtl'] & {
    transform: rotate(180deg);
  }
}
</style>
