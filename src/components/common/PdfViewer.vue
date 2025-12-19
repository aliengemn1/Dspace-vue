<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { bitstreams } from '@/services/dspace'

// Configure PDF.js worker using local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const { t } = useI18n()

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  fileId: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: 'document.pdf'
  }
})

const emit = defineEmits(['close'])

const canvasContainer = ref(null)
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const scale = ref(1.5)
const isFullscreen = ref(false)

// PDF document reference
let pdfDoc = null
let renderTask = null

const scaleOptions = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]

// Zoom percentage display
const zoomPercent = computed(() => Math.round(scale.value * 100))

// Load PDF document
async function loadPdf() {
  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    let pdfData

    // If fileId is provided, fetch as blob
    if (props.fileId) {
      const url = bitstreams.getContentUrl(props.fileId)
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      pdfData = { data: arrayBuffer }
    } else {
      // Use URL directly
      pdfData = { url: props.src }
    }

    // Load PDF using PDF.js
    pdfDoc = await pdfjsLib.getDocument(pdfData).promise
    totalPages.value = pdfDoc.numPages
    currentPage.value = 1

    console.log('PDF loaded, pages:', totalPages.value)

    // Render first page
    await renderPage(currentPage.value)
  } catch (error) {
    console.error('Failed to load PDF:', error)
    hasError.value = true
    errorMessage.value = error.message || 'فشل تحميل ملف PDF'
  } finally {
    isLoading.value = false
  }
}

// Render a specific page
async function renderPage(pageNum) {
  if (!pdfDoc || !canvasContainer.value) return

  isLoading.value = true

  try {
    // Cancel any ongoing render
    if (renderTask) {
      renderTask.cancel()
    }

    const page = await pdfDoc.getPage(pageNum)
    const viewport = page.getViewport({ scale: scale.value })

    // Create canvas for this page
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.height = viewport.height
    canvas.width = viewport.width

    // Clear container and add canvas
    canvasContainer.value.innerHTML = ''
    canvasContainer.value.appendChild(canvas)

    // Render page
    renderTask = page.render({
      canvasContext: context,
      viewport: viewport
    })

    await renderTask.promise
    renderTask = null
  } catch (error) {
    if (error.name !== 'RenderingCancelledException') {
      console.error('Failed to render page:', error)
    }
  } finally {
    isLoading.value = false
  }
}

// Navigation
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    renderPage(currentPage.value)
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    renderPage(currentPage.value)
  }
}

function goToPage(page) {
  const pageNum = parseInt(page)
  if (pageNum >= 1 && pageNum <= totalPages.value) {
    currentPage.value = pageNum
    renderPage(currentPage.value)
  }
}

// Zoom
function zoomIn() {
  const currentIndex = scaleOptions.indexOf(scale.value)
  if (currentIndex < scaleOptions.length - 1) {
    scale.value = scaleOptions[currentIndex + 1]
    renderPage(currentPage.value)
  } else if (scale.value < 3) {
    scale.value = Math.min(3, scale.value + 0.25)
    renderPage(currentPage.value)
  }
}

function zoomOut() {
  const currentIndex = scaleOptions.indexOf(scale.value)
  if (currentIndex > 0) {
    scale.value = scaleOptions[currentIndex - 1]
    renderPage(currentPage.value)
  } else if (scale.value > 0.5) {
    scale.value = Math.max(0.5, scale.value - 0.25)
    renderPage(currentPage.value)
  }
}

// Fullscreen
function toggleFullscreen() {
  const container = document.querySelector('.pdf-viewer-container')
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

function closePdf() {
  emit('close')
}

function retry() {
  loadPdf()
}

// Prevent right-click context menu
function preventContextMenu(e) {
  e.preventDefault()
  return false
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  loadPdf()
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (pdfDoc) {
    pdfDoc.destroy()
  }
})

// Watch for prop changes
watch(() => props.fileId, () => {
  loadPdf()
})

watch(() => props.src, () => {
  if (!props.fileId) {
    loadPdf()
  }
})
</script>

<template>
  <div class="pdf-viewer-container" :class="{ 'is-fullscreen': isFullscreen }">
    <!-- Toolbar -->
    <div class="pdf-toolbar">
      <div class="toolbar-left">
        <span class="pdf-filename">{{ fileName }}</span>
      </div>

      <div class="toolbar-center">
        <!-- Page Navigation -->
        <div class="page-controls">
          <button
            type="button"
            class="toolbar-btn"
            @click="prevPage"
            :disabled="currentPage <= 1"
            :title="t('pagination.previous') || 'السابق'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div class="page-info">
            <input
              type="number"
              class="page-input"
              :value="currentPage"
              @change="goToPage($event.target.value)"
              min="1"
              :max="totalPages"
            />
            <span class="page-separator">/</span>
            <span>{{ totalPages }}</span>
          </div>
          <button
            type="button"
            class="toolbar-btn"
            @click="nextPage"
            :disabled="currentPage >= totalPages"
            :title="t('pagination.next') || 'التالي'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <!-- Zoom Controls -->
        <div class="zoom-controls">
          <button
            type="button"
            class="toolbar-btn"
            @click="zoomOut"
            :disabled="scale <= 0.5"
            :title="t('item.viewer.zoomOut') || 'تصغير'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <span class="zoom-value">{{ zoomPercent }}%</span>
          <button
            type="button"
            class="toolbar-btn"
            @click="zoomIn"
            :disabled="scale >= 3"
            :title="t('item.viewer.zoomIn') || 'تكبير'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="toolbar-right">
        <!-- Fullscreen -->
        <button
          type="button"
          class="toolbar-btn"
          @click="toggleFullscreen"
          :title="isFullscreen ? (t('item.viewer.exitFullscreen') || 'خروج من وضع ملء الشاشة') : (t('item.viewer.fullscreen') || 'ملء الشاشة')"
        >
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
        <button
          type="button"
          class="toolbar-btn toolbar-btn-close"
          @click="closePdf"
          :title="t('common.close') || 'إغلاق'"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- PDF Content -->
    <div class="pdf-content" @contextmenu="preventContextMenu">
      <!-- Loading State -->
      <div v-if="isLoading" class="pdf-loading">
        <div class="spinner"></div>
        <p>{{ t('common.loading') || 'جاري التحميل...' }}</p>
      </div>

      <!-- Error State -->
      <div v-if="hasError" class="pdf-error">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ errorMessage || t('item.viewer.loadError') || 'فشل تحميل الملف' }}</p>
        <button class="btn btn-primary" @click="retry">
          {{ t('common.retry') || 'إعادة المحاولة' }}
        </button>
      </div>

      <!-- Canvas Container for PDF Rendering -->
      <div
        v-show="!hasError"
        ref="canvasContainer"
        class="canvas-container"
        @contextmenu="preventContextMenu"
      ></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pdf-viewer-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 80vh;
  min-height: 600px;
  max-height: 900px;
  background-color: $gray-800;
  border-radius: $border-radius-lg;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;

  &.is-fullscreen {
    height: 100vh;
    max-height: none;
    border-radius: 0;
  }
}

// Toolbar
.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-2 $spacing-4;
  background-color: $gray-900;
  border-bottom: 1px solid $gray-700;
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: $spacing-2;
}

.toolbar-left {
  flex: 1;
}

.toolbar-center {
  gap: $spacing-4;
}

.toolbar-right {
  flex: 1;
  justify-content: flex-end;
}

.pdf-filename {
  color: $white;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
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

  &:hover:not(:disabled) {
    background-color: $gray-700;
    color: $white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.toolbar-btn-close {
    &:hover {
      background-color: $error-color;
      color: $white;
    }
  }
}

// Page Controls
.page-controls {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-1;
  background-color: $gray-800;
  border-radius: $border-radius-md;
}

.page-info {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  color: $white;
  font-size: $font-size-sm;
}

.page-input {
  width: 50px;
  padding: $spacing-1;
  background-color: $gray-700;
  border: 1px solid $gray-600;
  border-radius: $border-radius-sm;
  color: $white;
  font-size: $font-size-sm;
  text-align: center;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }

  /* Hide spinners */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
}

.page-separator {
  color: $gray-500;
  margin: 0 $spacing-1;
}

// Zoom Controls
.zoom-controls {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-1;
  background-color: $gray-800;
  border-radius: $border-radius-md;
}

.zoom-value {
  color: $white;
  font-size: $font-size-sm;
  min-width: 50px;
  text-align: center;
}

// PDF Content
.pdf-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  position: relative;
  background-color: $gray-700;
}

.canvas-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: $spacing-4;

  canvas {
    box-shadow: 0 4px 20px rgba($black, 0.3);
    background-color: $white;
    pointer-events: none;
  }
}

.pdf-loading,
.pdf-error {
  @include flex-column-center;
  gap: $spacing-4;
  color: $gray-400;
  position: absolute;
  inset: 0;
  background-color: $gray-700;

  p {
    font-size: $font-size-sm;
  }
}

.pdf-error {
  svg {
    color: $error-color;
  }
}

// Responsive
@include media-down('sm') {
  .pdf-toolbar {
    padding: $spacing-2;
  }

  .toolbar-center {
    gap: $spacing-2;
  }

  .page-controls,
  .zoom-controls {
    padding: $spacing-1;
  }

  .pdf-filename {
    display: none;
  }

  .page-input {
    width: 40px;
  }

  .zoom-value {
    min-width: 40px;
  }
}
</style>
