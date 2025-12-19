<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { collections, items } from '@/services/dspace'

const { t, locale } = useI18n()

const props = defineProps({
  hall: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['back', 'view-item'])

const isLoading = ref(true)
const hallItems = ref([])
const selectedShelf = ref(0)
const hoveredItem = ref(null)

// Shelves configuration based on hall type
const shelvesConfig = {
  books: [
    { id: 0, name: 'الأدب والشعر', nameEn: 'Literature & Poetry', color: '#006C35' },
    { id: 1, name: 'التاريخ', nameEn: 'History', color: '#1B4D3E' },
    { id: 2, name: 'العلوم الإسلامية', nameEn: 'Islamic Sciences', color: '#C8A415' },
    { id: 3, name: 'العلوم والتقنية', nameEn: 'Science & Technology', color: '#17A2B8' }
  ],
  theses: [
    { id: 0, name: 'رسائل الماجستير', nameEn: 'Master Theses', color: '#006C35' },
    { id: 1, name: 'رسائل الدكتوراه', nameEn: 'PhD Dissertations', color: '#1B4D3E' },
    { id: 2, name: 'أبحاث علمية', nameEn: 'Scientific Research', color: '#6F42C1' }
  ],
  periodicals: [
    { id: 0, name: 'المجلات العلمية', nameEn: 'Scientific Journals', color: '#17A2B8' },
    { id: 1, name: 'الصحف', nameEn: 'Newspapers', color: '#757575' },
    { id: 2, name: 'النشرات الدورية', nameEn: 'Periodical Bulletins', color: '#C8A415' }
  ],
  manuscripts: [
    { id: 0, name: 'المخطوطات الإسلامية', nameEn: 'Islamic Manuscripts', color: '#C8A415' },
    { id: 1, name: 'المخطوطات التاريخية', nameEn: 'Historical Manuscripts', color: '#8B4513' },
    { id: 2, name: 'الوثائق النادرة', nameEn: 'Rare Documents', color: '#800020' }
  ],
  media: [
    { id: 0, name: 'الصور والخرائط', nameEn: 'Images & Maps', color: '#17A2B8' },
    { id: 1, name: 'التسجيلات الصوتية', nameEn: 'Audio Recordings', color: '#6F42C1' },
    { id: 2, name: 'الفيديوهات', nameEn: 'Videos', color: '#DC3545' }
  ]
}

const shelves = computed(() => {
  return shelvesConfig[props.hall.collection] || shelvesConfig.books
})

const currentShelf = computed(() => {
  return shelves.value[selectedShelf.value]
})

// Fetch items for current hall
async function fetchHallItems() {
  isLoading.value = true
  try {
    const response = await items.getRecent(12)
    hallItems.value = response.items || []
  } catch (error) {
    console.error('Failed to fetch hall items:', error)
    hallItems.value = []
  } finally {
    isLoading.value = false
  }
}

function selectShelf(index) {
  selectedShelf.value = index
  fetchHallItems()
}

function viewItemDetails(item) {
  emit('view-item', item)
}

function goBack() {
  emit('back')
}

// Generate random position for book on shelf
function getBookStyle(index) {
  const hue = (index * 30) % 360
  const saturation = 40 + (index * 5) % 30
  const lightness = 25 + (index * 3) % 20
  const height = 120 + (index * 7) % 40

  return {
    '--book-color': `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    '--book-height': `${height}px`,
    '--book-width': `${25 + (index * 3) % 15}px`,
    animationDelay: `${index * 0.1}s`
  }
}

onMounted(() => {
  fetchHallItems()
})

watch(() => props.hall.id, () => {
  selectedShelf.value = 0
  fetchHallItems()
})
</script>

<template>
  <div class="virtual-hall">
    <!-- Hall Background -->
    <div class="hall-background">
      <div class="bg-ceiling"></div>
      <div class="bg-walls"></div>
      <div class="bg-floor"></div>
    </div>

    <!-- Hall Header -->
    <div class="hall-header">
      <button class="back-button" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        {{ t('virtualTour.backToEntrance') }}
      </button>

      <div class="hall-title-area">
        <h1 class="hall-title">{{ hall.name }}</h1>
        <p class="hall-subtitle">{{ hall.nameEn }}</p>
      </div>

      <div class="hall-stats">
        <span class="items-count">{{ hallItems.length }} {{ t('virtualTour.itemsInView') }}</span>
      </div>
    </div>

    <!-- Shelves Navigation -->
    <div class="shelves-nav">
      <button
        v-for="(shelf, index) in shelves"
        :key="shelf.id"
        class="shelf-tab"
        :class="{ active: selectedShelf === index }"
        :style="{ '--shelf-color': shelf.color }"
        @click="selectShelf(index)"
      >
        <span class="shelf-name">{{ shelf.name }}</span>
        <span class="shelf-name-en">{{ shelf.nameEn }}</span>
      </button>
    </div>

    <!-- Main Hall Content -->
    <div class="hall-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="hall-loading">
        <div class="spinner"></div>
        <p>{{ t('virtualTour.loadingShelf') }}</p>
      </div>

      <!-- Bookshelf Display -->
      <div v-else class="bookshelf-container">
        <!-- Shelf Header -->
        <div class="shelf-header" :style="{ borderColor: currentShelf.color }">
          <h2 class="shelf-title">{{ currentShelf.name }}</h2>
          <span class="shelf-count">{{ hallItems.length }} {{ t('common.items') }}</span>
        </div>

        <!-- Virtual Shelf -->
        <div class="virtual-shelf">
          <!-- Shelf Structure -->
          <div class="shelf-structure">
            <div class="shelf-row" v-for="row in 2" :key="row">
              <div class="shelf-board"></div>
              <div class="shelf-books">
                <button
                  v-for="(item, index) in hallItems.slice((row - 1) * 6, row * 6)"
                  :key="item.id"
                  class="book-item"
                  :style="getBookStyle(index + (row - 1) * 6)"
                  @mouseenter="hoveredItem = item"
                  @mouseleave="hoveredItem = null"
                  @click="viewItemDetails(item)"
                >
                  <div class="book-spine">
                    <span class="book-title">{{ item.title }}</span>
                  </div>
                  <div class="book-top"></div>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="hallItems.length === 0" class="empty-shelf">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <p>{{ t('virtualTour.emptyShelf') }}</p>
          </div>
        </div>

        <!-- Hovered Item Preview -->
        <Transition name="slide-up">
          <div v-if="hoveredItem" class="item-preview">
            <div class="preview-thumbnail">
              <img
                v-if="hoveredItem.thumbnail"
                :src="hoveredItem.thumbnail"
                :alt="hoveredItem.title"
              />
              <img
                v-else
                src="/images/kfnl-logo.png"
                alt="KFNL"
                class="default-thumbnail"
              />
            </div>
            <div class="preview-info">
              <h3 class="preview-title">{{ hoveredItem.title }}</h3>
              <p class="preview-author" v-if="hoveredItem.author">{{ hoveredItem.author }}</p>
              <p class="preview-type" v-if="hoveredItem.type">{{ hoveredItem.type }}</p>
              <button class="preview-btn" @click="viewItemDetails(hoveredItem)">
                {{ t('virtualTour.viewDetails') }}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Hall Info Panel -->
    <div class="hall-info-panel">
      <h3 class="info-title">{{ t('virtualTour.aboutThisHall') }}</h3>
      <p class="info-description">{{ t(`virtualTour.hallDescription.${hall.collection}`) }}</p>

      <div class="info-features">
        <div class="feature">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>{{ t('virtualTour.searchInHall') }}</span>
        </div>
        <div class="feature">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>{{ t('virtualTour.downloadAvailable') }}</span>
        </div>
        <div class="feature">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>{{ t('virtualTour.previewFiles') }}</span>
        </div>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="hall-decorations">
      <div class="decoration-lamp lamp-left"></div>
      <div class="decoration-lamp lamp-right"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.virtual-hall {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// Background
.hall-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-ceiling {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 15%;
  background: linear-gradient(180deg, $gray-800 0%, $gray-900 100%);
  border-bottom: 2px solid rgba($accent-color, 0.3);
}

.bg-walls {
  position: absolute;
  top: 15%;
  left: 0;
  right: 0;
  bottom: 15%;
  background: linear-gradient(
    90deg,
    rgba($primary-dark, 0.9) 0%,
    rgba($gray-900, 0.95) 20%,
    rgba($gray-900, 0.95) 80%,
    rgba($primary-dark, 0.9) 100%
  );
}

.bg-floor {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 15%;
  background: linear-gradient(
    180deg,
    $gray-800 0%,
    #2c1810 100%
  );
  border-top: 3px solid rgba($accent-color, 0.2);
}

// Header
.hall-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-6 $spacing-8;
  background: rgba($gray-900, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid $gray-700;
}

.back-button {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  background: rgba($gray-700, 0.5);
  border: 1px solid $gray-600;
  border-radius: $border-radius-md;
  color: $gray-300;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background: $gray-700;
    color: $white;
    border-color: $accent-color;
  }
}

.hall-title-area {
  text-align: center;
}

.hall-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $white;
  margin-bottom: $spacing-1;
}

.hall-subtitle {
  font-size: $font-size-sm;
  color: $gray-400;
}

.hall-stats {
  padding: $spacing-2 $spacing-4;
  background: rgba($accent-color, 0.1);
  border: 1px solid rgba($accent-color, 0.3);
  border-radius: $border-radius-md;
}

.items-count {
  font-size: $font-size-sm;
  color: $accent-color;
}

// Shelves Navigation
.shelves-nav {
  position: relative;
  z-index: 10;
  display: flex;
  gap: $spacing-2;
  padding: $spacing-4 $spacing-8;
  background: rgba($gray-800, 0.5);
  backdrop-filter: blur(10px);
  overflow-x: auto;
}

.shelf-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-3 $spacing-5;
  background: rgba($gray-700, 0.3);
  border: 2px solid transparent;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: $transition-fast;
  white-space: nowrap;

  &:hover {
    background: rgba($gray-700, 0.6);
    border-color: var(--shelf-color);
  }

  &.active {
    background: rgba(var(--shelf-color), 0.2);
    border-color: var(--shelf-color);

    .shelf-name {
      color: var(--shelf-color);
    }
  }
}

.shelf-name {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $white;
  transition: $transition-fast;
}

.shelf-name-en {
  font-size: $font-size-xs;
  color: $gray-500;
}

// Main Content
.hall-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: $spacing-6 $spacing-8;
}

.hall-loading {
  flex: 1;
  @include flex-column-center;
  gap: $spacing-4;
  color: $gray-400;
}

// Bookshelf Container
.bookshelf-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shelf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: $spacing-4;
  margin-bottom: $spacing-6;
  border-bottom: 2px solid;
}

.shelf-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $white;
}

.shelf-count {
  font-size: $font-size-sm;
  color: $gray-400;
  padding: $spacing-1 $spacing-3;
  background: $gray-800;
  border-radius: $border-radius-sm;
}

// Virtual Shelf
.virtual-shelf {
  flex: 1;
  perspective: 1000px;
}

.shelf-structure {
  display: flex;
  flex-direction: column;
  gap: $spacing-8;
}

.shelf-row {
  position: relative;
}

.shelf-board {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(
    180deg,
    #5c3d2e 0%,
    #3d2820 50%,
    #2c1810 100%
  );
  border-radius: 0 0 $border-radius-sm $border-radius-sm;
  box-shadow:
    0 4px 8px rgba($black, 0.3),
    inset 0 2px 4px rgba($white, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(180deg, #7c5d4e, #5c3d2e);
  }
}

.shelf-books {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  padding: 0 $spacing-4;
  min-height: 160px;
}

.book-item {
  position: relative;
  display: flex;
  flex-direction: column;
  width: var(--book-width, 30px);
  height: var(--book-height, 140px);
  background: none;
  border: none;
  cursor: pointer;
  transform-origin: bottom center;
  transition: transform 0.3s ease;
  animation: book-appear 0.5s ease-out forwards;
  opacity: 0;

  &:hover {
    transform: translateY(-10px) rotateY(-15deg);
    z-index: 10;

    .book-spine {
      box-shadow:
        5px 0 15px rgba($black, 0.4),
        0 0 20px rgba($accent-color, 0.3);
    }
  }
}

.book-spine {
  flex: 1;
  background: var(--book-color, $primary-color);
  border-radius: 2px 0 0 2px;
  box-shadow:
    2px 0 4px rgba($black, 0.3),
    inset -2px 0 4px rgba($black, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 3px;
    background: rgba($white, 0.1);
  }

  &::after {
    content: '';
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 80%;
    border: 1px solid rgba($accent-color, 0.3);
    border-radius: 1px;
  }
}

.book-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 9px;
  color: rgba($white, 0.9);
  padding: $spacing-2;
  max-height: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-top {
  height: 8px;
  background: linear-gradient(
    90deg,
    rgba($white, 0.1),
    rgba($white, 0.2),
    rgba($white, 0.1)
  );
  border-radius: 2px 2px 0 0;
}

@keyframes book-appear {
  from {
    opacity: 0;
    transform: translateY(20px) rotateX(-20deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

// Empty Shelf
.empty-shelf {
  @include flex-column-center;
  gap: $spacing-4;
  padding: $spacing-12;
  color: $gray-500;

  svg {
    opacity: 0.5;
  }
}

// Item Preview
.item-preview {
  position: fixed;
  bottom: $spacing-8;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: $spacing-4;
  padding: $spacing-4;
  background: rgba($gray-800, 0.95);
  border: 1px solid $gray-600;
  border-radius: $border-radius-lg;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba($black, 0.4);
  max-width: 500px;
  z-index: 100;
}

.preview-thumbnail {
  width: 80px;
  height: 100px;
  flex-shrink: 0;
  border-radius: $border-radius-sm;
  overflow: hidden;
  background: $gray-700;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .default-thumbnail {
    object-fit: contain;
    padding: $spacing-2;
  }
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $white;
  margin-bottom: $spacing-2;
  @include truncate(2);
}

.preview-author,
.preview-type {
  font-size: $font-size-sm;
  color: $gray-400;
  margin-bottom: $spacing-1;
}

.preview-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  margin-top: $spacing-2;
  padding: $spacing-2 $spacing-3;
  background: $primary-color;
  border: none;
  border-radius: $border-radius-sm;
  color: $white;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background: $primary-light;
  }
}

// Info Panel
.hall-info-panel {
  position: absolute;
  left: $spacing-6;
  top: 50%;
  transform: translateY(-50%);
  width: 280px;
  padding: $spacing-5;
  background: rgba($gray-800, 0.9);
  border: 1px solid $gray-700;
  border-radius: $border-radius-lg;
  backdrop-filter: blur(10px);
  z-index: 20;
}

.info-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $accent-color;
  margin-bottom: $spacing-3;
}

.info-description {
  font-size: $font-size-sm;
  color: $gray-300;
  line-height: $line-height-relaxed;
  margin-bottom: $spacing-4;
}

.info-features {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.feature {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  font-size: $font-size-sm;
  color: $gray-400;

  svg {
    color: $accent-color;
    flex-shrink: 0;
  }
}

// Decorations
.hall-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}

.decoration-lamp {
  position: absolute;
  top: 10%;
  width: 40px;
  height: 60px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 40px;
    background: radial-gradient(ellipse at center, rgba($accent-color, 0.8) 0%, rgba($accent-color, 0.4) 50%, transparent 70%);
    border-radius: 50%;
    animation: lamp-glow 3s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 30px;
    background: linear-gradient(180deg, $accent-color, $gray-700);
  }

  &.lamp-left {
    left: 10%;
  }

  &.lamp-right {
    right: 10%;
  }
}

@keyframes lamp-glow {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

// Transitions
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

// Responsive
@include media-down('lg') {
  .hall-info-panel {
    display: none;
  }
}

@include media-down('md') {
  .hall-header {
    flex-direction: column;
    gap: $spacing-4;
    padding: $spacing-4;
  }

  .shelves-nav {
    padding: $spacing-3 $spacing-4;
  }

  .hall-content {
    padding: $spacing-4;
  }

  .shelf-books {
    flex-wrap: wrap;
    justify-content: center;
  }

  .item-preview {
    left: $spacing-4;
    right: $spacing-4;
    transform: none;
    max-width: none;
  }
}
</style>
