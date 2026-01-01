<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import PdfViewer from '@/components/common/PdfViewer.vue'
import VideoPlayer from '@/components/common/VideoPlayer.vue'
import ImageSlider from '@/components/common/ImageSlider.vue'

const { t } = useI18n()
const router = useRouter()

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const activeTab = ref('details')
const isFullscreen = ref(false)

// Detect file types from item
const hasFiles = computed(() => props.item.files && props.item.files.length > 0)

const pdfFiles = computed(() => {
  if (!hasFiles.value) return []
  return props.item.files.filter(f => f.mimeType === 'application/pdf')
})

const imageFiles = computed(() => {
  if (!hasFiles.value) return []
  return props.item.files.filter(f => f.mimeType?.startsWith('image/'))
})

const videoFiles = computed(() => {
  if (!hasFiles.value) return []
  return props.item.files.filter(f => f.mimeType?.startsWith('video/'))
})

const audioFiles = computed(() => {
  if (!hasFiles.value) return []
  return props.item.files.filter(f => f.mimeType?.startsWith('audio/'))
})

const availableTabs = computed(() => {
  const tabs = [{ id: 'details', label: t('virtualTour.details'), icon: 'info' }]

  if (pdfFiles.value.length > 0) {
    tabs.push({ id: 'pdf', label: t('virtualTour.readPdf'), icon: 'file' })
  }
  if (imageFiles.value.length > 0) {
    tabs.push({ id: 'images', label: t('virtualTour.viewImages'), icon: 'image' })
  }
  if (videoFiles.value.length > 0) {
    tabs.push({ id: 'video', label: t('virtualTour.watchVideo'), icon: 'video' })
  }
  if (audioFiles.value.length > 0) {
    tabs.push({ id: 'audio', label: t('virtualTour.listenAudio'), icon: 'audio' })
  }

  return tabs
})

// Icon names whitelist for security
const validIcons = ['info', 'file', 'image', 'video', 'audio']

function isValidIcon(icon) {
  return validIcons.includes(icon)
}

function close() {
  emit('close')
}

function goToItemPage() {
  router.push(`/item/${props.item.id}`)
  close()
}

function downloadFile(file) {
  window.open(file.url, '_blank')
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="tour-media-viewer" @click.self="close">
    <div class="viewer-container" :class="{ fullscreen: isFullscreen }">
      <!-- Header -->
      <div class="viewer-header">
        <div class="header-info">
          <h2 class="item-title">{{ item.title }}</h2>
          <p class="item-author" v-if="item.author">{{ item.author }}</p>
        </div>

        <div class="header-actions">
          <button class="action-btn" @click="goToItemPage" :title="t('virtualTour.openInLibrary')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </button>

          <button class="action-btn" @click="isFullscreen = !isFullscreen" :title="t('common.fullscreen')">
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

          <button class="action-btn close-btn" @click="close" :title="t('common.close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="viewer-tabs">
        <button
          v-for="tab in availableTabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">
            <!-- Info icon -->
            <svg v-if="tab.icon === 'info'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <!-- File icon -->
            <svg v-else-if="tab.icon === 'file'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <!-- Image icon -->
            <svg v-else-if="tab.icon === 'image'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <!-- Video icon -->
            <svg v-else-if="tab.icon === 'video'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <!-- Audio icon -->
            <svg v-else-if="tab.icon === 'audio'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </div>

      <!-- Content -->
      <div class="viewer-content">
        <!-- Details Tab -->
        <div v-if="activeTab === 'details'" class="tab-content details-content">
          <div class="details-grid">
            <div class="detail-thumbnail">
              <img
                v-if="item.thumbnail"
                :src="item.thumbnail"
                :alt="item.title"
              />
              <img
                v-else
                src="/images/kfnl-logo.png"
                alt="KFNL"
                class="default-thumbnail"
              />
            </div>

            <div class="detail-info">
              <div class="info-row" v-if="item.type">
                <span class="info-label">{{ t('item.type') }}</span>
                <span class="info-value type-badge">{{ item.type }}</span>
              </div>

              <div class="info-row" v-if="item.date">
                <span class="info-label">{{ t('item.date') }}</span>
                <span class="info-value">{{ item.date }}</span>
              </div>

              <div class="info-row" v-if="item.collection">
                <span class="info-label">{{ t('item.collection') }}</span>
                <span class="info-value">{{ item.collection }}</span>
              </div>

              <div class="info-row" v-if="item.publisher">
                <span class="info-label">{{ t('item.publisher') }}</span>
                <span class="info-value">{{ item.publisher }}</span>
              </div>

              <div class="info-row" v-if="item.language">
                <span class="info-label">{{ t('item.language') }}</span>
                <span class="info-value">{{ item.language }}</span>
              </div>

              <div class="info-abstract" v-if="item.abstract">
                <span class="info-label">{{ t('item.abstract') }}</span>
                <p class="abstract-text">{{ item.abstract }}</p>
              </div>
            </div>
          </div>

          <!-- Files List -->
          <div v-if="hasFiles" class="files-section">
            <h3 class="section-title">{{ t('item.files') }}</h3>
            <div class="files-list">
              <div v-for="file in item.files" :key="file.id" class="file-item">
                <div class="file-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div class="file-info">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ file.size }}</span>
                </div>
                <button class="file-download" @click="downloadFile(file)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <button class="view-full-btn" @click="goToItemPage">
            {{ t('virtualTour.viewFullRecord') }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        <!-- PDF Tab -->
        <div v-else-if="activeTab === 'pdf'" class="tab-content pdf-content">
          <PdfViewer
            v-if="pdfFiles.length > 0"
            :src="pdfFiles[0].url"
            :filename="pdfFiles[0].name"
          />
        </div>

        <!-- Images Tab -->
        <div v-else-if="activeTab === 'images'" class="tab-content images-content">
          <ImageSlider
            v-if="imageFiles.length > 0"
            :images="imageFiles.map(f => ({ src: f.url, name: f.name }))"
            @download="downloadFile"
          />
        </div>

        <!-- Video Tab -->
        <div v-else-if="activeTab === 'video'" class="tab-content video-content">
          <VideoPlayer
            v-if="videoFiles.length > 0"
            :src="videoFiles[0].url"
            :title="videoFiles[0].name"
            :mimeType="videoFiles[0].mimeType"
            @download="downloadFile(videoFiles[0])"
          />
        </div>

        <!-- Audio Tab -->
        <div v-else-if="activeTab === 'audio'" class="tab-content audio-content">
          <div class="audio-player-container">
            <div class="audio-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <h3 class="audio-title">{{ audioFiles[0]?.name }}</h3>
            <audio
              controls
              class="audio-element"
              :src="audioFiles[0]?.url"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tour-media-viewer {
  position: fixed;
  inset: 0;
  z-index: 1000;
  @include flex-center;
  background-color: rgba($black, 0.9);
  backdrop-filter: blur(10px);
  padding: $spacing-6;
}

.viewer-container {
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  background-color: $gray-900;
  border: 1px solid $gray-700;
  border-radius: $border-radius-lg;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.fullscreen {
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
  }
}

.viewer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-4 $spacing-6;
  background: linear-gradient(90deg, rgba($primary-color, 0.1) 0%, transparent 100%);
  border-bottom: 1px solid $gray-700;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $white;
  margin-bottom: $spacing-1;
  @include truncate(1);
}

.item-author {
  font-size: $font-size-sm;
  color: $gray-400;
}

.header-actions {
  display: flex;
  gap: $spacing-2;
}

.action-btn {
  @include flex-center;
  width: 36px;
  height: 36px;
  background-color: $gray-800;
  border: 1px solid $gray-600;
  border-radius: $border-radius-md;
  color: $gray-300;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: $gray-700;
    color: $white;
    border-color: $accent-color;
  }

  &.close-btn:hover {
    background-color: rgba($error-color, 0.2);
    border-color: $error-color;
    color: $error-color;
  }
}

.viewer-tabs {
  display: flex;
  gap: $spacing-1;
  padding: $spacing-2 $spacing-4;
  background-color: $gray-800;
  border-bottom: 1px solid $gray-700;
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  background: none;
  border: none;
  border-radius: $border-radius-md;
  color: $gray-400;
  font-size: $font-size-sm;
  cursor: pointer;
  white-space: nowrap;
  transition: $transition-fast;

  &:hover {
    background-color: $gray-700;
    color: $white;
  }

  &.active {
    background-color: $primary-color;
    color: $white;
  }
}

.tab-icon {
  @include flex-center;
}

.viewer-content {
  flex: 1;
  overflow: auto;
}

.tab-content {
  height: 100%;
  padding: $spacing-6;
}

// Details Tab
.details-content {
  overflow-y: auto;
}

.details-grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: $spacing-6;
  margin-bottom: $spacing-6;
}

.detail-thumbnail {
  aspect-ratio: 3/4;
  background-color: $gray-800;
  border-radius: $border-radius-md;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .default-thumbnail {
    object-fit: contain;
    padding: $spacing-4;
  }
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.info-row {
  display: flex;
  gap: $spacing-3;
}

.info-label {
  font-size: $font-size-sm;
  color: $gray-500;
  min-width: 100px;
}

.info-value {
  font-size: $font-size-sm;
  color: $white;
}

.type-badge {
  padding: $spacing-1 $spacing-2;
  background-color: $primary-color;
  border-radius: $border-radius-sm;
  font-size: $font-size-xs;
}

.info-abstract {
  margin-top: $spacing-4;
}

.abstract-text {
  font-size: $font-size-sm;
  color: $gray-300;
  line-height: $line-height-relaxed;
  margin-top: $spacing-2;
}

.files-section {
  padding-top: $spacing-6;
  border-top: 1px solid $gray-700;
}

.section-title {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $gray-400;
  margin-bottom: $spacing-4;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.file-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3;
  background-color: $gray-800;
  border-radius: $border-radius-md;
}

.file-icon {
  color: $accent-color;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-size: $font-size-sm;
  color: $white;
  @include truncate(1);
}

.file-size {
  font-size: $font-size-xs;
  color: $gray-500;
}

.file-download {
  @include flex-center;
  width: 32px;
  height: 32px;
  background: none;
  border: 1px solid $gray-600;
  border-radius: $border-radius-sm;
  color: $gray-400;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: $primary-color;
    border-color: $primary-color;
    color: $white;
  }
}

.view-full-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  margin-top: $spacing-6;
  padding: $spacing-3 $spacing-5;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border: none;
  border-radius: $border-radius-md;
  color: $white;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($primary-color, 0.4);
  }
}

// Media tabs
.pdf-content,
.images-content,
.video-content {
  padding: 0;
  height: 500px;
}

.audio-content {
  @include flex-center;
  height: 300px;
}

.audio-player-container {
  @include flex-column-center;
  gap: $spacing-4;
  text-align: center;
}

.audio-icon {
  color: $accent-color;
}

.audio-title {
  font-size: $font-size-base;
  color: $white;
}

.audio-element {
  width: 300px;
}

@include media-down('md') {
  .tour-media-viewer {
    padding: 0;
  }

  .viewer-container {
    max-height: 100%;
    border-radius: 0;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-thumbnail {
    max-width: 200px;
    margin: 0 auto;
  }

  .tab-label {
    display: none;
  }

  .tab-btn {
    padding: $spacing-2;
  }
}
</style>
