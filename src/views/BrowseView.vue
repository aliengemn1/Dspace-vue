<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import Pagination from '@/components/common/Pagination.vue'
import ItemCard from '@/components/common/ItemCard.vue'
import { browse, items as itemsApi, utils } from '@/services/dspace'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const browseType = ref('author')
const entries = ref([])
const searchResults = ref([])
const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalResults = ref(0)
const searchQuery = ref('')
const viewMode = ref('entries') // 'entries' or 'results'
const selectedSort = ref('count_desc')

const sortOptions = computed(() => [
  { value: 'name_asc', label: locale.value === 'ar' ? 'الاسم (أ-ي)' : 'Name (A-Z)' },
  { value: 'name_desc', label: locale.value === 'ar' ? 'الاسم (ي-أ)' : 'Name (Z-A)' },
  { value: 'count_desc', label: locale.value === 'ar' ? 'الأكثر عناصر' : 'Most items' },
  { value: 'count_asc', label: locale.value === 'ar' ? 'الأقل عناصر' : 'Least items' }
])

// Browse types - static list
const browseTypes = computed(() => [
  { id: 'author', label: t('browse.byAuthor'), icon: 'users', description: locale.value === 'ar' ? 'تصفح حسب المؤلفين' : 'Browse by authors' },
  { id: 'subject', label: t('browse.bySubject'), icon: 'tag', description: locale.value === 'ar' ? 'تصفح حسب الموضوعات' : 'Browse by subjects' },
  { id: 'dateissued', label: t('browse.byDate'), icon: 'calendar', description: locale.value === 'ar' ? 'تصفح حسب التاريخ' : 'Browse by date' },
  { id: 'type', label: t('browse.byType'), icon: 'layers', description: locale.value === 'ar' ? 'تصفح حسب النوع' : 'Browse by type' },
  { id: 'publisher', label: t('browse.byPublisher'), icon: 'building', description: locale.value === 'ar' ? 'تصفح حسب الناشرين' : 'Browse by publishers' }
])

const icons = {
  'users': 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  'tag': 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01',
  'calendar': 'M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z M16 2v4 M8 2v4 M3 10h18',
  'layers': 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  'building': 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-4 M9 9v.01 M9 12v.01 M9 15v.01 M9 18v.01'
}

const currentBrowseType = computed(() => {
  return browseTypes.value.find(t => t.id === browseType.value) || browseTypes.value[0]
})

const breadcrumbItems = computed(() => [
  { label: t('nav.home'), path: '/' },
  { label: t('nav.browse'), path: '/browse' }
])

const errorMessage = ref('')
const availableIndices = ref([])

// Fetch available browse indices from server
async function loadAvailableIndices() {
  try {
    const response = await browse.getIndices()
    const indices = response?._embedded?.browses || []
    availableIndices.value = indices.map(idx => idx.id)
    console.log('Server available browse indices:', availableIndices.value)
  } catch (error) {
    console.error('Failed to load browse indices:', error)
  }
}

async function loadEntries() {
  isLoading.value = true
  viewMode.value = 'entries'
  errorMessage.value = ''

  try {
    console.log('Loading browse entries for:', browseType.value)

    // Log server indices for debugging
    if (availableIndices.value.length === 0) {
      await loadAvailableIndices()
    }

    const response = await browse.byIndex(browseType.value, {
      page: currentPage.value - 1,
      size: 20
    })
    console.log('Browse response:', response)

    // Handle different response formats
    let entriesData = []
    if (response._embedded?.entries) {
      entriesData = response._embedded.entries
    } else if (response._embedded?.browseIndexEntries) {
      entriesData = response._embedded.browseIndexEntries
    } else if (response._embedded?.values) {
      // Some DSpace versions return values instead of entries
      entriesData = response._embedded.values.map(v => ({
        value: v.value || v.label || v,
        count: v.count || v.frequency || 0
      }))
    } else if (response.entries) {
      entriesData = response.entries
    } else if (Array.isArray(response)) {
      entriesData = response
    }

    // Ensure entries have value and count properties
    entries.value = entriesData.map(entry => ({
      value: entry.value || entry.label || entry.authority || entry,
      count: entry.count || entry.frequency || entry.numberOfResults || 0
    }))

    totalPages.value = response.page?.totalPages || 1
    totalResults.value = response.page?.totalElements || entriesData.length || 0
    console.log('Loaded entries:', entries.value.length)
  } catch (error) {
    console.error('Failed to load browse entries:', error)
    entries.value = []
    totalPages.value = 1
    totalResults.value = 0
    errorMessage.value = locale.value === 'ar'
      ? 'فشل تحميل البيانات. قد لا يكون هذا النوع من التصفح متاحًا.'
      : 'Failed to load data. This browse type may not be available.'
  } finally {
    isLoading.value = false
    // Apply initial sort if we have entries
    if (entries.value.length > 0) {
      handleSortChange({ target: { value: selectedSort.value } })
    }
  }
}

async function loadItems(filterValue) {
  isLoading.value = true
  viewMode.value = 'results'
  searchQuery.value = filterValue
  errorMessage.value = ''

  try {
    console.log('Loading items for filter:', filterValue, 'browseType:', browseType.value)

    // Use browse API to get items by entry value
    const response = await browse.getItemsByEntry(browseType.value, filterValue, {
      page: currentPage.value - 1,
      size: 12
    })
    console.log('Browse items response:', response)

    // Handle different response formats from browse/search APIs
    let itemsData = []

    // Format 1: Browse items API format
    if (response._embedded?.items) {
      itemsData = response._embedded.items
    }
    // Format 2: Search result format
    else if (response._embedded?.searchResult?._embedded?.objects) {
      itemsData = response._embedded.searchResult._embedded.objects.map(obj => obj._embedded?.indexableObject).filter(Boolean)
    }
    // Format 3: Direct objects array
    else if (response._embedded?.objects) {
      itemsData = response._embedded.objects.map(obj => obj._embedded?.indexableObject || obj).filter(Boolean)
    }

    console.log('Parsed items data:', itemsData.length, 'items')

    if (itemsData.length > 0) {
      searchResults.value = itemsData.map(item => {
        if (!item) return null

        // Get thumbnail URL - check multiple sources
        let thumbnailUrl = null
        if (item._embedded?.thumbnail?._links?.content?.href) {
          thumbnailUrl = item._embedded.thumbnail._links.content.href
        } else if (item._links?.thumbnail?.href) {
          thumbnailUrl = item._links.thumbnail.href
        }

        return {
          id: item.uuid || item.id,
          title: utils.getMetadataValue(item.metadata, 'dc.title') || item.name || 'بدون عنوان',
          author: utils.getMetadataValue(item.metadata, 'dc.contributor.author') || 'غير معروف',
          date: utils.getMetadataValue(item.metadata, 'dc.date.issued') || '',
          type: utils.getMetadataValue(item.metadata, 'dc.type') || '',
          collection: '',
          thumbnail: thumbnailUrl
        }
      }).filter(Boolean)

      totalResults.value = response.page?.totalElements || itemsData.length
      totalPages.value = response.page?.totalPages || Math.ceil(totalResults.value / 12)
    } else {
      searchResults.value = []
      totalResults.value = 0
      totalPages.value = 1
    }
  } catch (error) {
    console.error('Failed to load items:', error)
    searchResults.value = []
    totalResults.value = 0
    totalPages.value = 1
    errorMessage.value = locale.value === 'ar'
      ? 'فشل تحميل العناصر. يرجى المحاولة مرة أخرى.'
      : 'Failed to load items. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function selectBrowseType(type) {
  browseType.value = type
  currentPage.value = 1
  viewMode.value = 'entries'
  searchQuery.value = ''
  router.push({ query: { type } })
  loadEntries()
}

function handlePageChange(page) {
  currentPage.value = page
  if (viewMode.value === 'entries') {
    loadEntries()
  } else {
    loadItems(searchQuery.value)
  }
}

function goToItems(entry) {
  loadItems(entry.value)
  router.push({
    query: {
      type: browseType.value,
      filter: entry.value
    }
  })
}

function backToEntries() {
  viewMode.value = 'entries'
  searchQuery.value = ''
  currentPage.value = 1
  router.push({ query: { type: browseType.value } })
  loadEntries()
}

function formatCount(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function handleSortChange(event) {
  selectedSort.value = event.target.value
  const sorted = [...entries.value]
  switch (selectedSort.value) {
    case 'name_asc':
      sorted.sort((a, b) => a.value.localeCompare(b.value, 'ar'))
      break
    case 'name_desc':
      sorted.sort((a, b) => b.value.localeCompare(a.value, 'ar'))
      break
    case 'count_desc':
      sorted.sort((a, b) => b.count - a.count)
      break
    case 'count_asc':
      sorted.sort((a, b) => a.count - b.count)
      break
  }
  entries.value = sorted
}

onMounted(async () => {
  // First load available indices from server for debugging
  await loadAvailableIndices()

  if (route.query.type) {
    browseType.value = route.query.type
  }
  if (route.query.filter || route.query.q) {
    loadItems(route.query.filter || route.query.q)
  } else {
    loadEntries()
  }
})

watch(() => route.query, (newQuery) => {
  if (newQuery.type && newQuery.type !== browseType.value) {
    browseType.value = newQuery.type
    if (newQuery.filter || newQuery.q) {
      loadItems(newQuery.filter || newQuery.q)
    } else {
      loadEntries()
    }
  }
})
</script>

<template>
  <div class="browse-view">
    <!-- Breadcrumb -->
    <div class="breadcrumb-section">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
      </div>
    </div>

    <!-- Header -->
    <div class="browse-header">
      <div class="container">
        <div class="header-content">
          <h1 class="page-title">{{ $t('browse.title') }}</h1>
          <p class="page-description">{{ locale === 'ar' ? 'استكشف محتويات المكتبة الرقمية' : 'Explore digital library contents' }}</p>
        </div>

        <!-- Browse Type Tabs -->
        <div class="browse-tabs">
          <button
            v-for="type in browseTypes"
            :key="type.id"
            class="browse-tab"
            :class="{ 'active': browseType === type.id }"
            @click="selectBrowseType(type.id)"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path :d="icons[type.icon]"/>
            </svg>
            <div class="tab-content">
              <span class="tab-label">{{ type.label }}</span>
              <span class="tab-description">{{ type.description }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="browse-content">
      <div class="container">
        <!-- Controls Bar -->
        <div class="controls-bar">
          <div class="controls-start">
            <!-- Back button when viewing results -->
            <button v-if="viewMode === 'results'" class="btn btn-secondary" @click="backToEntries">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              {{ locale === 'ar' ? 'العودة للقائمة' : 'Back to list' }}
            </button>

            <div class="results-info">
              <span v-if="viewMode === 'entries'" class="results-count">
                {{ totalResults }} {{ currentBrowseType.label }}
              </span>
              <span v-else class="results-count">
                <strong>{{ searchQuery }}</strong> - {{ totalResults }} {{ locale === 'ar' ? 'نتيجة' : 'results' }}
              </span>
            </div>
          </div>

          <div class="controls-end">
            <!-- Sort (only for entries view) -->
            <div v-if="viewMode === 'entries'" class="sort-wrapper">
              <label for="sort-select">{{ locale === 'ar' ? 'ترتيب:' : 'Sort:' }}</label>
              <select id="sort-select" class="sort-select" :value="selectedSort" @change="handleSortChange">
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="loading-container">
          <div class="spinner"></div>
          <p>{{ $t('common.loading') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="error-container">
          <div class="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3>{{ locale === 'ar' ? 'حدث خطأ' : 'An error occurred' }}</h3>
          <p>{{ errorMessage }}</p>
          <button class="btn btn-primary" @click="viewMode === 'entries' ? loadEntries() : loadItems(searchQuery)">
            {{ locale === 'ar' ? 'إعادة المحاولة' : 'Try again' }}
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="viewMode === 'entries' && entries.length === 0" class="empty-container">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h3>{{ locale === 'ar' ? 'لا توجد بيانات' : 'No data found' }}</h3>
          <p>{{ locale === 'ar' ? 'لم يتم العثور على ' + currentBrowseType.label + ' في هذا التصنيف' : 'No ' + currentBrowseType.label + ' found in this category' }}</p>
        </div>

        <!-- Entries View -->
        <template v-else-if="viewMode === 'entries' && entries.length > 0">
          <div class="entries-grid">
            <button
              v-for="entry in entries"
              :key="entry.value"
              class="entry-card"
              @click="goToItems(entry)"
            >
              <div class="entry-content">
                <span class="entry-value">{{ entry.value }}</span>
                <span class="entry-description" v-if="browseType === 'author'">{{ locale === 'ar' ? 'مؤلف' : 'Author' }}</span>
                <span class="entry-description" v-else-if="browseType === 'subject'">{{ locale === 'ar' ? 'موضوع' : 'Subject' }}</span>
                <span class="entry-description" v-else-if="browseType === 'dateissued'">{{ locale === 'ar' ? 'سنة النشر' : 'Year' }}</span>
                <span class="entry-description" v-else-if="browseType === 'type'">{{ locale === 'ar' ? 'نوع المحتوى' : 'Type' }}</span>
                <span class="entry-description" v-else-if="browseType === 'publisher'">{{ locale === 'ar' ? 'ناشر' : 'Publisher' }}</span>
              </div>
              <div class="entry-count-wrapper">
                <span class="entry-count">{{ formatCount(entry.count) }}</span>
                <span class="count-label">{{ locale === 'ar' ? 'عنصر' : 'items' }}</span>
              </div>
              <div class="entry-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </button>
          </div>
        </template>

        <!-- Results View -->
        <template v-else>
          <div v-if="searchResults.length === 0" class="no-results">
            <div class="no-results-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </div>
            <h3>{{ locale === 'ar' ? 'لا توجد نتائج' : 'No results found' }}</h3>
            <p>{{ locale === 'ar' ? 'لم يتم العثور على عناصر مطابقة لـ "' + searchQuery + '"' : 'No items matching "' + searchQuery + '" were found' }}</p>
            <button class="btn btn-primary" @click="backToEntries">{{ locale === 'ar' ? 'العودة للتصفح' : 'Back to browse' }}</button>
          </div>

          <div v-else class="results-grid">
            <ItemCard
              v-for="item in searchResults"
              :key="item.id"
              :item="item"
            />
          </div>
        </template>

        <!-- Pagination -->
        <Pagination
          v-if="totalPages > 1 && !isLoading"
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.browse-view {
  min-height: 100vh;
  background-color: $bg-secondary;
}

.breadcrumb-section {
  padding: $spacing-3 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
}

// Header
.browse-header {
  padding: $spacing-8 0;
  background: linear-gradient(135deg, $primary-darker 0%, $primary-dark 50%, $primary-color 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 20% 80%, rgba($accent-color, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba($accent-light, 0.1) 0%, transparent 50%);
  }
}

.header-content {
  position: relative;
  text-align: center;
  margin-bottom: $spacing-8;
}

.page-title {
  font-size: 2rem;
  font-weight: $font-weight-bold;
  color: $white;
  margin-bottom: $spacing-2;

  @include media-down('md') {
    font-size: 1.5rem;
  }
}

.page-description {
  color: rgba($white, 0.8);
  font-size: $font-size-lg;

  @include media-down('md') {
    font-size: $font-size-base;
  }
}

// Browse Tabs
.browse-tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: $spacing-4;

  @include media-down('lg') {
    grid-template-columns: repeat(3, 1fr);
  }

  @include media-down('md') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include media-down('sm') {
    grid-template-columns: 1fr;
  }
}

.browse-tab {
  display: flex;
  align-items: flex-start;
  gap: $spacing-3;
  padding: $spacing-4;
  background-color: rgba($white, 0.1);
  border: 2px solid transparent;
  border-radius: $border-radius-lg;
  color: $white;
  cursor: pointer;
  transition: $transition-fast;
  text-align: start;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }

  &:hover {
    background-color: rgba($white, 0.2);
    border-color: rgba($white, 0.3);
  }

  &.active {
    background-color: $white;
    color: $primary-color;
    border-color: $white;

    .tab-description {
      color: $text-muted;
    }
  }
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.tab-label {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
}

.tab-description {
  font-size: $font-size-xs;
  opacity: 0.8;
}

// Content
.browse-content {
  padding: $spacing-8 0;
}

// Controls Bar
.controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: $spacing-4;
  margin-bottom: $spacing-6;
  padding: $spacing-4;
  background-color: $white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;
}

.controls-start,
.controls-end {
  display: flex;
  align-items: center;
  gap: $spacing-4;
}

.results-count {
  color: $text-secondary;
  font-size: $font-size-sm;

  strong {
    color: $primary-color;
  }
}

.sort-wrapper {
  display: flex;
  align-items: center;
  gap: $spacing-2;

  label {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.sort-select {
  padding: $spacing-2 $spacing-3;
  font-size: $font-size-sm;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  background-color: $white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

// Loading
.loading-container {
  @include flex-column-center;
  padding: $spacing-12;
  gap: $spacing-4;
}

// Entries Grid
.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: $spacing-4;
}

.entry-card {
  @include card;
  display: flex;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-5;
  text-align: start;
  cursor: pointer;
  transition: all $transition-duration-normal $transition-timing-cubic;
  border: 1px solid $border-color-light;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
    border-color: $primary-color;

    .entry-value {
      color: $primary-color;
    }

    .entry-arrow {
      transform: translateX(-4px);
      color: $primary-color;
    }
  }
}

.entry-content {
  flex: 1;
  min-width: 0;
}

.entry-value {
  display: block;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-1;
  transition: color $transition-duration-fast ease;
  @include truncate(1);
}

.entry-description {
  font-size: $font-size-xs;
  color: $text-muted;
}

.entry-count-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-2 $spacing-3;
  background-color: $primary-lighter;
  border-radius: $border-radius-md;
  min-width: 60px;
}

.entry-count {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $primary-color;
}

.count-label {
  font-size: $font-size-xs;
  color: $primary-color;
  opacity: 0.8;
}

.entry-arrow {
  color: $text-muted;
  transition: all $transition-duration-fast ease;
}

// Results Grid
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $spacing-4;
}

// No Results
.no-results {
  @include flex-column-center;
  padding: $spacing-12;
  background-color: $white;
  border-radius: $border-radius-lg;
  text-align: center;
}

.no-results-icon {
  color: $text-light;
  margin-bottom: $spacing-4;
}

.no-results h3 {
  @include heading-4;
  margin-bottom: $spacing-2;
}

.no-results p {
  color: $text-muted;
  margin-bottom: $spacing-6;
}

// Error State
.error-container,
.empty-container {
  @include flex-column-center;
  padding: $spacing-12;
  background-color: $white;
  border-radius: $border-radius-lg;
  text-align: center;

  h3 {
    @include heading-4;
    margin-bottom: $spacing-2;
  }

  p {
    color: $text-muted;
    margin-bottom: $spacing-6;
  }
}

.error-icon {
  color: $error-color;
  margin-bottom: $spacing-4;
}

.empty-icon {
  color: $text-light;
  margin-bottom: $spacing-4;
}
</style>
