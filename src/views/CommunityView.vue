<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import { communities } from '@/services/dspace'

const route = useRoute()
const { t } = useI18n()

const community = ref(null)
const collectionList = ref([])
const isLoading = ref(true)

const breadcrumbItems = computed(() => [
  { label: t('nav.home'), path: '/' },
  { label: t('nav.communities'), path: '/communities' },
  { label: community.value?.name || t('community.title'), path: null }
])

// Mock data
const mockCommunity = {
  id: '1',
  name: 'الرسائل العلمية',
  description: 'رسائل الماجستير والدكتوراه من مختلف الجامعات السعودية. تشمل هذه المجموعة الرسائل العلمية في مختلف التخصصات العلمية والإنسانية.',
  itemCount: 60000
}

const mockCollections = [
  { id: '1', name: 'رسائل جامعة الملك سعود', itemCount: 15000 },
  { id: '2', name: 'رسائل جامعة الملك عبدالعزيز', itemCount: 12000 },
  { id: '3', name: 'رسائل جامعة أم القرى', itemCount: 10000 },
  { id: '4', name: 'رسائل جامعة الإمام', itemCount: 8000 },
  { id: '5', name: 'رسائل جامعة الملك فهد للبترول', itemCount: 7000 },
  { id: '6', name: 'رسائل الجامعات الأخرى', itemCount: 8000 }
]

async function loadCommunity() {
  isLoading.value = true

  try {
    const communityId = route.params.id
    community.value = await communities.getById(communityId)

    const collectionsResponse = await communities.getCollections(communityId)
    collectionList.value = collectionsResponse._embedded?.collections || []
  } catch (error) {
    community.value = mockCommunity
    collectionList.value = mockCollections
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
  loadCommunity()
})
</script>

<template>
  <div class="community-view">
    <!-- Breadcrumb -->
    <div class="breadcrumb-section">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- Content -->
    <template v-else-if="community">
      <!-- Header -->
      <div class="community-header">
        <div class="container">
          <div class="header-content">
            <div class="header-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <div class="header-text">
              <h1 class="community-name">{{ community.name }}</h1>
              <p class="community-description">{{ community.description }}</p>
              <div class="community-meta">
                <span class="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  </svg>
                  {{ formatCount(community.itemCount || 0) }} {{ $t('browse.items') }}
                </span>
                <span class="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  {{ collectionList.length }} {{ $t('browse.collections') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Collections -->
      <div class="collections-section">
        <div class="container">
          <h2 class="section-title">{{ $t('community.collections') }}</h2>

          <div class="collections-grid">
            <router-link
              v-for="collection in collectionList"
              :key="collection.id"
              :to="`/collection/${collection.id}`"
              class="collection-card"
            >
              <div class="collection-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="collection-info">
                <h3 class="collection-name">{{ collection.name }}</h3>
                <span class="collection-count">
                  {{ formatCount(collection.itemCount || 0) }} {{ $t('browse.items') }}
                </span>
              </div>
              <div class="collection-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.community-view {
  min-height: 100vh;
  background-color: $bg-secondary;
}

.breadcrumb-section {
  padding: $spacing-3 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
}

.loading-container {
  @include flex-column-center;
  padding: $spacing-16;
  gap: $spacing-4;
}

.community-header {
  padding: $spacing-8 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
}

.header-content {
  display: flex;
  gap: $spacing-6;
  align-items: flex-start;

  @include media-down('sm') {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

.header-icon {
  @include flex-center;
  width: 96px;
  height: 96px;
  background-color: $primary-lighter;
  border-radius: $border-radius-xl;
  color: $primary-color;
  flex-shrink: 0;
}

.header-text {
  flex: 1;
}

.community-name {
  @include heading-2;
  margin-bottom: $spacing-3;
}

.community-description {
  color: $text-secondary;
  line-height: $line-height-relaxed;
  margin-bottom: $spacing-4;
}

.community-meta {
  display: flex;
  gap: $spacing-4;
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  font-size: $font-size-sm;
  color: $text-muted;
}

.collections-section {
  padding: $spacing-8 0;
}

.section-title {
  @include heading-3;
  margin-bottom: $spacing-6;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: $spacing-4;
}

.collection-card {
  @include card;
  display: flex;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-4;
  text-decoration: none;
  color: inherit;
  transition: $transition-default;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
    border-color: $primary-color;

    .collection-icon {
      background-color: $primary-color;
      color: $white;
    }
  }
}

.collection-icon {
  @include flex-center;
  width: 48px;
  height: 48px;
  background-color: $bg-secondary;
  border-radius: $border-radius-lg;
  color: $primary-color;
  flex-shrink: 0;
  transition: $transition-default;
}

.collection-info {
  flex: 1;
  min-width: 0;
}

.collection-name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-1;
}

.collection-count {
  font-size: $font-size-sm;
  color: $text-muted;
}

.collection-arrow {
  color: $text-light;

  [dir='rtl'] & {
    transform: rotate(180deg);
  }
}
</style>
