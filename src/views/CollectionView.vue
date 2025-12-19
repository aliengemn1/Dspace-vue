<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import ItemCard from '@/components/common/ItemCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import { collections } from '@/services/dspace'

const route = useRoute()
const { t } = useI18n()

const collection = ref(null)
const itemsList = ref([])
const isLoading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)

const breadcrumbItems = computed(() => [
  { label: t('nav.home'), path: '/' },
  { label: t('nav.collections'), path: '/communities' },
  { label: collection.value?.name || t('collection.title'), path: null }
])

// Mock data
const mockCollection = {
  id: '1',
  name: 'رسائل جامعة الملك سعود',
  description: 'رسائل الماجستير والدكتوراه المقدمة لجامعة الملك سعود في مختلف التخصصات',
  itemCount: 15000
}

const mockItems = [
  {
    id: 1,
    title: 'أثر استخدام تقنيات الذكاء الاصطناعي في تطوير خدمات المكتبات',
    author: 'أحمد محمد السعيد',
    date: '2024',
    type: 'رسالة ماجستير',
    collection: 'رسائل جامعة الملك سعود'
  },
  {
    id: 2,
    title: 'تقييم جودة الخدمات المكتبية في المكتبات الجامعية السعودية',
    author: 'سارة عبدالله الحمد',
    date: '2024',
    type: 'رسالة دكتوراه',
    collection: 'رسائل جامعة الملك سعود'
  },
  {
    id: 3,
    title: 'دور المكتبات الرقمية في دعم التعلم عن بعد',
    author: 'محمد علي الشهري',
    date: '2023',
    type: 'رسالة ماجستير',
    collection: 'رسائل جامعة الملك سعود'
  }
]

async function loadCollection() {
  isLoading.value = true

  try {
    const collectionId = route.params.id
    collection.value = await collections.getById(collectionId)

    const itemsResponse = await collections.getItems(collectionId, {
      page: currentPage.value - 1,
      size: 12
    })

    itemsList.value = itemsResponse._embedded?.searchResult?._embedded?.objects || []
    totalPages.value = itemsResponse.page?.totalPages || 1
  } catch (error) {
    collection.value = mockCollection
    itemsList.value = mockItems
    totalPages.value = 1
  } finally {
    isLoading.value = false
  }
}

function handlePageChange(page) {
  currentPage.value = page
  loadCollection()
}

function formatCount(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K+'
  }
  return num.toLocaleString('ar-SA')
}

onMounted(() => {
  loadCollection()
})
</script>

<template>
  <div class="collection-view">
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
    <template v-else-if="collection">
      <!-- Header -->
      <div class="collection-header">
        <div class="container">
          <div class="header-content">
            <div class="header-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div class="header-text">
              <h1 class="collection-name">{{ collection.name }}</h1>
              <p v-if="collection.description" class="collection-description">
                {{ collection.description }}
              </p>
              <div class="collection-meta">
                <span class="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  </svg>
                  {{ formatCount(collection.itemCount || itemsList.length) }} {{ $t('browse.items') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="items-section">
        <div class="container">
          <h2 class="section-title">{{ $t('collection.recentItems') }}</h2>

          <div v-if="itemsList.length > 0" class="items-grid">
            <ItemCard
              v-for="item in itemsList"
              :key="item.id"
              :item="item"
            />
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <p>لا توجد عناصر في هذه المجموعة</p>
          </div>

          <Pagination
            v-if="totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.collection-view {
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

.collection-header {
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
  background-color: $accent-color;
  background-color: rgba($accent-color, 0.15);
  border-radius: $border-radius-xl;
  color: $accent-color;
  flex-shrink: 0;
}

.header-text {
  flex: 1;
}

.collection-name {
  @include heading-2;
  margin-bottom: $spacing-3;
}

.collection-description {
  color: $text-secondary;
  line-height: $line-height-relaxed;
  margin-bottom: $spacing-4;
}

.collection-meta {
  display: flex;
  gap: $spacing-4;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  font-size: $font-size-sm;
  color: $text-muted;
}

.items-section {
  padding: $spacing-8 0;
}

.section-title {
  @include heading-3;
  margin-bottom: $spacing-6;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: $spacing-4;
}

.empty-state {
  @include flex-column-center;
  padding: $spacing-12;
  background-color: $white;
  border-radius: $border-radius-lg;
  text-align: center;

  .empty-icon {
    color: $text-light;
    margin-bottom: $spacing-4;
  }

  p {
    color: $text-muted;
  }
}
</style>
