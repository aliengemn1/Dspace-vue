<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import VirtualEntrance from '@/components/virtual-tour/VirtualEntrance.vue'
import VirtualHall from '@/components/virtual-tour/VirtualHall.vue'
import TourMiniMap from '@/components/virtual-tour/TourMiniMap.vue'
import TourMediaViewer from '@/components/virtual-tour/TourMediaViewer.vue'
import TourGuide from '@/components/virtual-tour/TourGuide.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Tour state
const currentLocation = ref('entrance')
const isLoading = ref(true)
const showMiniMap = ref(true)
const showGuide = ref(true)
const selectedItem = ref(null)
const showMediaViewer = ref(false)

// Available halls/locations
const locations = [
  { id: 'entrance', name: 'المدخل الرئيسي', nameEn: 'Main Entrance', icon: 'door' },
  { id: 'books', name: 'قاعة الكتب', nameEn: 'Books Hall', icon: 'book', collection: 'books' },
  { id: 'theses', name: 'قاعة الرسائل الجامعية', nameEn: 'Theses Hall', icon: 'graduation', collection: 'theses' },
  { id: 'periodicals', name: 'قاعة الدوريات', nameEn: 'Periodicals Hall', icon: 'newspaper', collection: 'periodicals' },
  { id: 'manuscripts', name: 'قاعة المخطوطات', nameEn: 'Manuscripts Hall', icon: 'scroll', collection: 'manuscripts' },
  { id: 'media', name: 'قاعة الوسائط', nameEn: 'Media Hall', icon: 'video', collection: 'media' }
]

const currentLocationData = computed(() => {
  return locations.find(l => l.id === currentLocation.value) || locations[0]
})

const isEntrance = computed(() => currentLocation.value === 'entrance')

// Navigation
function navigateTo(locationId) {
  isLoading.value = true
  currentLocation.value = locationId
  router.replace({ query: { hall: locationId } })

  setTimeout(() => {
    isLoading.value = false
  }, 800)
}

function goBack() {
  if (!isEntrance.value) {
    navigateTo('entrance')
  }
}

// Item interaction
function viewItem(item) {
  selectedItem.value = item
  showMediaViewer.value = true
}

function closeMediaViewer() {
  showMediaViewer.value = false
  selectedItem.value = null
}

// Keyboard navigation
function handleKeydown(e) {
  if (showMediaViewer.value) {
    if (e.key === 'Escape') {
      closeMediaViewer()
    }
    return
  }

  switch (e.key) {
    case 'Escape':
      if (!isEntrance.value) {
        goBack()
      }
      break
    case 'm':
    case 'M':
      showMiniMap.value = !showMiniMap.value
      break
    case 'g':
    case 'G':
      showGuide.value = !showGuide.value
      break
  }
}

// Initialize from route
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)

  const hallParam = route.query.hall
  if (hallParam && locations.find(l => l.id === hallParam)) {
    currentLocation.value = hallParam
  }

  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Watch route changes
watch(() => route.query.hall, (newHall) => {
  if (newHall && newHall !== currentLocation.value) {
    navigateTo(newHall)
  }
})
</script>

<template>
  <div class="virtual-tour">
    <!-- Loading Overlay -->
    <Transition name="fade">
      <div v-if="isLoading" class="tour-loading">
        <div class="loading-content">
          <img src="/images/kfnl-logo.png" alt="KFNL" class="loading-logo" />
          <div class="loading-spinner"></div>
          <p>{{ t('virtualTour.loading') }}</p>
        </div>
      </div>
    </Transition>

    <!-- Main Tour Content -->
    <div class="tour-content">
      <!-- Entrance View -->
      <Transition name="slide-fade" mode="out-in">
        <VirtualEntrance
          v-if="isEntrance"
          :locations="locations.filter(l => l.id !== 'entrance')"
          @navigate="navigateTo"
        />

        <!-- Hall View -->
        <VirtualHall
          v-else
          :key="currentLocation"
          :hall="currentLocationData"
          @back="goBack"
          @view-item="viewItem"
        />
      </Transition>
    </div>

    <!-- Mini Map -->
    <Transition name="slide-right">
      <TourMiniMap
        v-if="showMiniMap && !isLoading"
        :locations="locations"
        :current-location="currentLocation"
        @navigate="navigateTo"
        @close="showMiniMap = false"
      />
    </Transition>

    <!-- Tour Guide -->
    <Transition name="slide-left">
      <TourGuide
        v-if="showGuide && !isLoading"
        :location="currentLocationData"
        @close="showGuide = false"
      />
    </Transition>

    <!-- Controls -->
    <div v-if="!isLoading" class="tour-controls">
      <button
        class="control-btn"
        :class="{ active: showMiniMap }"
        @click="showMiniMap = !showMiniMap"
        :title="t('virtualTour.toggleMap')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          <line x1="8" y1="2" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
      </button>

      <button
        class="control-btn"
        :class="{ active: showGuide }"
        @click="showGuide = !showGuide"
        :title="t('virtualTour.toggleGuide')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>

      <button
        v-if="!isEntrance"
        class="control-btn back-btn"
        @click="goBack"
        :title="t('virtualTour.backToEntrance')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </button>
    </div>

    <!-- Breadcrumb -->
    <div v-if="!isLoading && !isEntrance" class="tour-breadcrumb">
      <button @click="goBack" class="breadcrumb-home">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
        {{ t('virtualTour.entrance') }}
      </button>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
      <span class="breadcrumb-current">{{ currentLocationData.name }}</span>
    </div>

    <!-- Media Viewer Modal -->
    <Transition name="fade">
      <TourMediaViewer
        v-if="showMediaViewer && selectedItem"
        :item="selectedItem"
        @close="closeMediaViewer"
      />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.virtual-tour {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: $gray-900;
  overflow: hidden;
}

// Loading
.tour-loading {
  position: fixed;
  inset: 0;
  z-index: 100;
  @include flex-center;
  background: linear-gradient(135deg, $primary-dark 0%, $gray-900 100%);
}

.loading-content {
  @include flex-column-center;
  gap: $spacing-6;
  text-align: center;
}

.loading-logo {
  width: 120px;
  height: auto;
  animation: pulse 2s ease-in-out infinite;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba($white, 0.2);
  border-top-color: $accent-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-content p {
  color: $white;
  font-size: $font-size-lg;
}

// Main Content
.tour-content {
  width: 100%;
  min-height: 100vh;
}

// Controls
.tour-controls {
  position: fixed;
  bottom: $spacing-6;
  right: $spacing-6;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  z-index: 50;
}

.control-btn {
  @include flex-center;
  width: 48px;
  height: 48px;
  background-color: rgba($gray-800, 0.9);
  border: 1px solid $gray-700;
  border-radius: $border-radius-full;
  color: $gray-300;
  cursor: pointer;
  transition: $transition-fast;
  backdrop-filter: blur(8px);

  &:hover {
    background-color: $gray-700;
    color: $white;
    transform: scale(1.1);
  }

  &.active {
    background-color: $primary-color;
    border-color: $primary-color;
    color: $white;
  }

  &.back-btn:hover {
    background-color: $accent-color;
    border-color: $accent-color;
  }
}

// Breadcrumb
.tour-breadcrumb {
  position: fixed;
  top: $spacing-6;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  background-color: rgba($gray-800, 0.9);
  border: 1px solid $gray-700;
  border-radius: $border-radius-full;
  backdrop-filter: blur(8px);
  z-index: 50;
}

.breadcrumb-home {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  background: none;
  border: none;
  color: $gray-400;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    color: $accent-color;
  }
}

.breadcrumb-current {
  color: $white;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.6s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.4s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// Responsive
@include media-down('md') {
  .tour-controls {
    bottom: $spacing-4;
    right: $spacing-4;
  }

  .control-btn {
    width: 40px;
    height: 40px;
  }

  .tour-breadcrumb {
    top: $spacing-4;
    padding: $spacing-2 $spacing-3;
    font-size: $font-size-xs;
  }
}
</style>
