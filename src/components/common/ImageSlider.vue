<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  images: {
    type: Array,
    required: true,
    validator: (value) => value.every(img => img.src || img.url)
  },
  autoPlay: {
    type: Boolean,
    default: false
  },
  autoPlayInterval: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['close'])

const currentIndex = ref(0)
const isFullscreen = ref(false)
const isZoomed = ref(false)
const isLoading = ref(true)
const hasError = ref(false)
const autoPlayTimer = ref(null)

const currentImage = computed(() => {
  const img = props.images[currentIndex.value]
  return {
    src: img.src || img.url,
    alt: img.alt || img.name || `Image ${currentIndex.value + 1}`,
    name: img.name || `image_${currentIndex.value + 1}`
  }
})

const hasMultipleImages = computed(() => props.images.length > 1)

function goToImage(index) {
  if (index >= 0 && index < props.images.length) {
    currentIndex.value = index
    isLoading.value = true
    hasError.value = false
  }
}

function nextImage() {
  const next = (currentIndex.value + 1) % props.images.length
  goToImage(next)
}

function prevImage() {
  const prev = (currentIndex.value - 1 + props.images.length) % props.images.length
  goToImage(prev)
}

function toggleZoom() {
  isZoomed.value = !isZoomed.value
}

function toggleFullscreen() {
  const container = document.querySelector('.image-slider-container')
  if (!isFullscreen.value) {
    if (container.requestFullscreen) {
      container.requestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

function handleImageLoad() {
  isLoading.value = false
}

function handleImageError() {
  isLoading.value = false
  hasError.value = true
}

function closeSlider() {
  emit('close')
}

function startAutoPlay() {
  if (props.autoPlay && hasMultipleImages.value) {
    autoPlayTimer.value = setInterval(nextImage, props.autoPlayInterval)
  }
}

function stopAutoPlay() {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value)
    autoPlayTimer.value = null
  }
}

function handleKeydown(e) {
  switch (e.key) {
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
    case 'Escape':
      if (isZoomed.value) {
        isZoomed.value = false
      } else if (isFullscreen.value) {
        toggleFullscreen()
      } else {
        closeSlider()
      }
      break
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('keydown', handleKeydown)
  startAutoPlay()
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('keydown', handleKeydown)
  stopAutoPlay()
})
</script>

<template>
  <div
    class="image-slider-container"
    :class="{ 'is-fullscreen': isFullscreen, 'is-zoomed': isZoomed }"
    @mouseenter="stopAutoPlay"
    @mouseleave="startAutoPlay"
  >
    <!-- Toolbar -->
    <div class="slider-toolbar">
      <div class="toolbar-left">
        <span class="image-counter">{{ currentIndex + 1 }} / {{ images.length }}</span>
        <span class="image-name">{{ currentImage.name }}</span>
      </div>

      <div class="toolbar-right">
        <!-- Zoom -->
        <button class="toolbar-btn" @click="toggleZoom" :title="isZoomed ? 'تصغير' : 'تكبير'">
          <svg v-if="!isZoomed" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>

        <!-- Fullscreen -->
        <button class="toolbar-btn" @click="toggleFullscreen">
          <svg v-if="!isFullscreen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 3 21 3 21 9"/>
            <polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/>
            <line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4 14 10 14 10 20"/>
            <polyline points="20 10 14 10 14 4"/>
            <line x1="14" y1="10" x2="21" y2="3"/>
            <line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        </button>

        <!-- Close -->
        <button class="toolbar-btn toolbar-btn-close" @click="closeSlider" :title="t('common.close')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Image Area -->
    <div class="slider-main">
      <!-- Previous Button -->
      <button
        v-if="hasMultipleImages"
        class="nav-btn nav-prev"
        @click="prevImage"
        :title="t('pagination.previous')"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <!-- Image Container -->
      <div class="image-container" @click="toggleZoom">
        <!-- Loading State -->
        <div v-if="isLoading" class="image-loading">
          <div class="spinner"></div>
        </div>

        <!-- Error State -->
        <div v-if="hasError" class="image-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <p>فشل تحميل الصورة</p>
        </div>

        <img
          v-show="!hasError"
          :src="currentImage.src"
          :alt="currentImage.alt"
          @load="handleImageLoad"
          @error="handleImageError"
          @contextmenu.prevent
          @dragstart.prevent
          :class="{ 'is-zoomed': isZoomed }"
        />
      </div>

      <!-- Next Button -->
      <button
        v-if="hasMultipleImages"
        class="nav-btn nav-next"
        @click="nextImage"
        :title="t('pagination.next')"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>

    <!-- Thumbnails -->
    <div v-if="hasMultipleImages" class="slider-thumbnails">
      <button
        v-for="(image, index) in images"
        :key="index"
        class="thumbnail-btn"
        :class="{ 'is-active': index === currentIndex }"
        @click="goToImage(index)"
      >
        <img :src="image.src || image.url" :alt="`Thumbnail ${index + 1}`" @contextmenu.prevent @dragstart.prevent />
      </button>
    </div>

    <!-- Dots Indicator (for mobile) -->
    <div v-if="hasMultipleImages" class="slider-dots">
      <button
        v-for="(_, index) in images"
        :key="index"
        class="dot"
        :class="{ 'is-active': index === currentIndex }"
        @click="goToImage(index)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.image-slider-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: $gray-900;
  border-radius: $border-radius-lg;
  overflow: hidden;

  &.is-fullscreen {
    border-radius: 0;
    height: 100vh;

    .slider-main {
      flex: 1;
    }
  }
}

// Toolbar
.slider-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-2 $spacing-4;
  background-color: $gray-800;
  border-bottom: 1px solid $gray-700;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: $spacing-3;
}

.image-counter {
  color: $white;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  padding: $spacing-1 $spacing-2;
  background-color: $gray-700;
  border-radius: $border-radius-sm;
}

.image-name {
  color: $gray-400;
  font-size: $font-size-sm;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-btn {
  @include flex-center;
  width: 36px;
  height: 36px;
  background-color: transparent;
  border: none;
  border-radius: $border-radius-md;
  color: $gray-300;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: $gray-700;
    color: $white;
  }

  &.toolbar-btn-close:hover {
    background-color: $error-color;
  }
}

// Main Image Area
.slider-main {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  background-color: $black;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  @include flex-center;
  width: 48px;
  height: 48px;
  background-color: rgba($black, 0.5);
  border: none;
  border-radius: 50%;
  color: $white;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: rgba($primary-color, 0.8);
  }

  &.nav-prev {
    left: $spacing-4;
  }

  &.nav-next {
    right: $spacing-4;
  }
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  @include flex-center;
  overflow: hidden;
  cursor: zoom-in;

  .is-zoomed & {
    cursor: zoom-out;
    overflow: auto;
  }

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;

    &.is-zoomed {
      max-width: none;
      max-height: none;
      transform: scale(2);
    }
  }
}

.image-loading,
.image-error {
  position: absolute;
  inset: 0;
  @include flex-column-center;
  gap: $spacing-3;
  color: $gray-400;
}

.image-error svg {
  color: $gray-500;
}

// Thumbnails
.slider-thumbnails {
  display: flex;
  gap: $spacing-2;
  padding: $spacing-3;
  background-color: $gray-800;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: $gray-600 $gray-800;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: $gray-800;
  }

  &::-webkit-scrollbar-thumb {
    background: $gray-600;
    border-radius: 3px;
  }

  @include media-down('sm') {
    display: none;
  }
}

.thumbnail-btn {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  padding: 0;
  background: none;
  border: 2px solid transparent;
  border-radius: $border-radius-sm;
  overflow: hidden;
  cursor: pointer;
  transition: $transition-fast;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    border-color: $gray-500;
  }

  &.is-active {
    border-color: $primary-color;
  }
}

// Dots Indicator (Mobile)
.slider-dots {
  display: none;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-3;
  background-color: $gray-800;

  @include media-down('sm') {
    display: flex;
  }
}

.dot {
  width: 8px;
  height: 8px;
  padding: 0;
  background-color: $gray-600;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: $gray-500;
  }

  &.is-active {
    background-color: $primary-color;
    width: 24px;
    border-radius: 4px;
  }
}

@include media-down('sm') {
  .slider-main {
    height: 300px;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
  }

  .image-name {
    display: none;
  }
}
</style>
