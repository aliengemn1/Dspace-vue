<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import PdfViewer from './PdfViewer.vue'
import VideoPlayer from './VideoPlayer.vue'
import ImageSlider from './ImageSlider.vue'
import { bitstreams } from '@/services/dspace'

const { t } = useI18n()

// Audio blob URL state
const audioBlobUrl = ref(null)
const audioLoading = ref(false)

// Image blob URLs state
const imageBlobUrls = ref({}) // Map of fileId -> blobUrl
const imagesLoading = ref(false)

const props = defineProps({
  files: {
    type: Array,
    required: true
  },
  selectedFile: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'select-file'])

// File type detection helpers
const isImage = (mimeType) => mimeType?.startsWith('image/')
const isVideo = (mimeType) => mimeType?.startsWith('video/')
const isPdf = (mimeType) => mimeType === 'application/pdf'
const isAudio = (mimeType) => mimeType?.startsWith('audio/')

// Categorize files by type
const pdfFiles = computed(() => props.files.filter(f => isPdf(f.mimeType)))
const imageFiles = computed(() => props.files.filter(f => isImage(f.mimeType)))
const videoFiles = computed(() => props.files.filter(f => isVideo(f.mimeType)))
const audioFiles = computed(() => props.files.filter(f => isAudio(f.mimeType)))
const otherFiles = computed(() => props.files.filter(f =>
  !isPdf(f.mimeType) && !isImage(f.mimeType) && !isVideo(f.mimeType) && !isAudio(f.mimeType)
))

// Determine current media type
const currentMediaType = computed(() => {
  if (!props.selectedFile) {
    // Auto-select first available media
    if (pdfFiles.value.length > 0) return 'pdf'
    if (imageFiles.value.length > 0) return 'image'
    if (videoFiles.value.length > 0) return 'video'
    if (audioFiles.value.length > 0) return 'audio'
    return 'none'
  }

  const mimeType = props.selectedFile.mimeType
  if (isPdf(mimeType)) return 'pdf'
  if (isImage(mimeType)) return 'image'
  if (isVideo(mimeType)) return 'video'
  if (isAudio(mimeType)) return 'audio'
  return 'other'
})

// Get URL for the current file
const getFileUrl = (file) => {
  if (!file) return null
  return bitstreams.getContentUrl(file.id)
}

// Current file URL
const currentFileUrl = computed(() => getFileUrl(props.selectedFile))

// Prepare images for ImageSlider - use blob URLs if available
const imagesForSlider = computed(() => {
  return imageFiles.value.map(file => ({
    src: imageBlobUrls.value[file.id] || getFileUrl(file),
    name: file.name,
    alt: file.name,
    id: file.id
  }))
})

// Load all images as blobs
async function loadImagesAsBlobs() {
  if (imageFiles.value.length === 0) return

  imagesLoading.value = true

  try {
    // Load each image as blob
    for (const file of imageFiles.value) {
      if (!imageBlobUrls.value[file.id]) {
        try {
          const blobUrl = await bitstreams.getContentAsBlob(file.id, file.mimeType)
          imageBlobUrls.value[file.id] = blobUrl
          console.log('Image loaded as blob:', file.name, blobUrl)
        } catch (error) {
          console.error('Failed to load image as blob:', file.name, error)
        }
      }
    }
  } finally {
    imagesLoading.value = false
  }
}

// Currently selected image index for slider
const currentImageIndex = computed(() => {
  if (!props.selectedFile || !isImage(props.selectedFile.mimeType)) return 0
  return imageFiles.value.findIndex(f => f.id === props.selectedFile.id)
})

// Media type tabs for switching
const mediaTabs = computed(() => {
  const tabs = []
  if (pdfFiles.value.length > 0) {
    tabs.push({ type: 'pdf', label: `PDF (${pdfFiles.value.length})`, icon: 'pdf' })
  }
  if (imageFiles.value.length > 0) {
    tabs.push({ type: 'image', label: `صور (${imageFiles.value.length})`, icon: 'image' })
  }
  if (videoFiles.value.length > 0) {
    tabs.push({ type: 'video', label: `فيديو (${videoFiles.value.length})`, icon: 'video' })
  }
  if (audioFiles.value.length > 0) {
    tabs.push({ type: 'audio', label: `صوت (${audioFiles.value.length})`, icon: 'audio' })
  }
  return tabs
})

// Initialize activeTab - use computed value or default to 'pdf' if available
const activeTab = ref('pdf')

// Watch for file changes and set appropriate tab
watch(() => props.files, (newFiles) => {
  if (newFiles && newFiles.length > 0) {
    // Determine the best tab based on available files
    if (newFiles.some(f => isPdf(f.mimeType))) {
      activeTab.value = 'pdf'
    } else if (newFiles.some(f => isImage(f.mimeType))) {
      activeTab.value = 'image'
    } else if (newFiles.some(f => isVideo(f.mimeType))) {
      activeTab.value = 'video'
    } else if (newFiles.some(f => isAudio(f.mimeType))) {
      activeTab.value = 'audio'
    }
  }
}, { immediate: true })

// Set initial tab on mount
onMounted(() => {
  if (pdfFiles.value.length > 0) {
    activeTab.value = 'pdf'
  } else if (imageFiles.value.length > 0) {
    activeTab.value = 'image'
  } else if (videoFiles.value.length > 0) {
    activeTab.value = 'video'
  } else if (audioFiles.value.length > 0) {
    activeTab.value = 'audio'
  }
})

function selectMediaType(type) {
  activeTab.value = type
  // Auto-select first file of this type
  let file = null
  switch (type) {
    case 'pdf':
      file = pdfFiles.value[0]
      break
    case 'image':
      file = imageFiles.value[0]
      break
    case 'video':
      file = videoFiles.value[0]
      break
    case 'audio':
      file = audioFiles.value[0]
      break
  }
  if (file) {
    emit('select-file', file)
  }
}

function handleClose() {
  emit('close')
}

// Load audio as blob
async function loadAudioAsBlob(fileId, mimeType) {
  if (!fileId) return

  audioLoading.value = true

  try {
    // Revoke previous blob URL
    if (audioBlobUrl.value) {
      bitstreams.revokeBlobUrl(audioBlobUrl.value)
    }

    audioBlobUrl.value = await bitstreams.getContentAsBlob(fileId, mimeType || 'audio/mpeg')
    console.log('Audio loaded as blob:', audioBlobUrl.value)
  } catch (error) {
    console.error('Failed to load audio as blob:', error)
    audioBlobUrl.value = null
  } finally {
    audioLoading.value = false
  }
}

// Get audio source - use blob URL if available
const audioSrc = computed(() => {
  if (audioBlobUrl.value) {
    return audioBlobUrl.value
  }
  const file = props.selectedFile || audioFiles.value[0]
  return file ? getFileUrl(file) : null
})

// Watch for audio file selection changes
watch(() => props.selectedFile, (newFile) => {
  if (newFile && isAudio(newFile.mimeType)) {
    loadAudioAsBlob(newFile.id, newFile.mimeType)
  }
})

// Load blobs when tab changes
watch(() => activeTab.value, (newTab) => {
  if (newTab === 'audio' && audioFiles.value.length > 0) {
    const file = props.selectedFile && isAudio(props.selectedFile.mimeType)
      ? props.selectedFile
      : audioFiles.value[0]
    if (file) {
      loadAudioAsBlob(file.id, file.mimeType)
    }
  } else if (newTab === 'image' && imageFiles.value.length > 0) {
    loadImagesAsBlobs()
  }
})

// Clean up blob URLs on unmount
onUnmounted(() => {
  if (audioBlobUrl.value) {
    bitstreams.revokeBlobUrl(audioBlobUrl.value)
  }
  // Clean up image blob URLs
  Object.values(imageBlobUrls.value).forEach(url => {
    bitstreams.revokeBlobUrl(url)
  })
})
</script>

<template>
  <div class="media-viewer">
    <!-- Media Type Tabs (when multiple types exist) -->
    <div v-if="mediaTabs.length > 1" class="media-tabs">
      <button
        v-for="tab in mediaTabs"
        :key="tab.type"
        class="media-tab"
        :class="{ 'is-active': activeTab === tab.type }"
        @click="selectMediaType(tab.type)"
      >
        <!-- PDF Icon -->
        <svg v-if="tab.icon === 'pdf'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <!-- Image Icon -->
        <svg v-else-if="tab.icon === 'image'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <!-- Video Icon -->
        <svg v-else-if="tab.icon === 'video'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
        <!-- Audio Icon -->
        <svg v-else-if="tab.icon === 'audio'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Media Content -->
    <div class="media-content">
      <!-- PDF Viewer -->
      <template v-if="activeTab === 'pdf' && pdfFiles.length > 0">
        <!-- PDF File Selector (if multiple PDFs) -->
        <div v-if="pdfFiles.length > 1" class="file-selector">
          <label>{{ t('item.selectFile') || 'اختر الملف' }}:</label>
          <select @change="$emit('select-file', pdfFiles[$event.target.value])">
            <option
              v-for="(file, index) in pdfFiles"
              :key="file.id"
              :value="index"
              :selected="selectedFile?.id === file.id"
            >
              {{ file.name }}
            </option>
          </select>
        </div>
        <!-- Show PDF viewer if selectedFile is PDF or fall back to first PDF -->
        <PdfViewer
          v-if="(selectedFile && isPdf(selectedFile.mimeType)) || pdfFiles.length > 0"
          :src="(selectedFile && isPdf(selectedFile.mimeType)) ? currentFileUrl : getFileUrl(pdfFiles[0])"
          :file-id="(selectedFile && isPdf(selectedFile.mimeType)) ? selectedFile.id : pdfFiles[0].id"
          :file-name="(selectedFile && isPdf(selectedFile.mimeType)) ? selectedFile.name : pdfFiles[0].name"
          @close="handleClose"
        />
      </template>

      <!-- Image Slider -->
      <template v-else-if="activeTab === 'image' && imageFiles.length > 0">
        <!-- Loading state for images -->
        <div v-if="imagesLoading && Object.keys(imageBlobUrls).length === 0" class="images-loading">
          <div class="spinner"></div>
          <p>جاري تحميل الصور...</p>
        </div>
        <ImageSlider
          v-else
          :images="imagesForSlider"
          @close="handleClose"
        />
      </template>

      <!-- Video Player -->
      <template v-else-if="activeTab === 'video' && videoFiles.length > 0">
        <!-- Video File Selector (if multiple videos) -->
        <div v-if="videoFiles.length > 1" class="file-selector">
          <label>{{ t('item.selectFile') || 'اختر الملف' }}:</label>
          <select @change="$emit('select-file', videoFiles[$event.target.value])">
            <option
              v-for="(file, index) in videoFiles"
              :key="file.id"
              :value="index"
              :selected="selectedFile?.id === file.id"
            >
              {{ file.name }}
            </option>
          </select>
        </div>
        <VideoPlayer
          v-if="selectedFile && isVideo(selectedFile.mimeType)"
          :src="currentFileUrl"
          :file-id="selectedFile.id"
          :title="selectedFile.name"
          :mime-type="selectedFile.mimeType"
          @close="handleClose"
        />
        <VideoPlayer
          v-else-if="videoFiles.length > 0"
          :src="getFileUrl(videoFiles[0])"
          :file-id="videoFiles[0].id"
          :title="videoFiles[0].name"
          :mime-type="videoFiles[0].mimeType"
          @close="handleClose"
        />
      </template>

      <!-- Audio Player -->
      <template v-else-if="activeTab === 'audio' && audioFiles.length > 0">
        <div class="audio-player-container">
          <div v-if="audioFiles.length > 1" class="file-selector">
            <label>{{ t('item.selectFile') || 'اختر الملف' }}:</label>
            <select @change="$emit('select-file', audioFiles[$event.target.value])">
              <option
                v-for="(file, index) in audioFiles"
                :key="file.id"
                :value="index"
                :selected="selectedFile?.id === file.id"
              >
                {{ file.name }}
              </option>
            </select>
          </div>
          <div class="audio-wrapper">
            <div class="audio-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <p class="audio-filename">{{ selectedFile?.name || audioFiles[0]?.name }}</p>
            <!-- Loading state for audio -->
            <div v-if="audioLoading" class="audio-loading">
              <div class="spinner"></div>
              <p>جاري التحميل...</p>
            </div>
            <audio
              v-else
              controls
              preload="auto"
              controlsList="nodownload"
              class="audio-element"
              :key="audioSrc"
              @contextmenu.prevent
            >
              <source
                :src="audioSrc"
                :type="selectedFile?.mimeType || audioFiles[0]?.mimeType || 'audio/mpeg'"
              />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      </template>

      <!-- No Preview Available -->
      <template v-else>
        <div class="no-preview">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>لا تتوفر معاينة لهذا الملف</p>
          <button v-if="selectedFile" class="btn btn-primary" @click="handleDownload()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {{ t('item.download') }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.media-viewer {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 500px;
}

// Media Type Tabs
.media-tabs {
  display: flex;
  gap: $spacing-1;
  padding: $spacing-3;
  background-color: $gray-100;
  border-bottom: 1px solid $border-color-light;
  overflow-x: auto;
}

.media-tab {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: $border-radius-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-muted;
  cursor: pointer;
  white-space: nowrap;
  transition: $transition-fast;

  &:hover {
    background-color: $white;
    color: $text-primary;
  }

  &.is-active {
    background-color: $white;
    border-color: $primary-color;
    color: $primary-color;
    box-shadow: 0 2px 4px rgba($black, 0.1);
  }

  svg {
    flex-shrink: 0;
  }
}

// File Selector
.file-selector {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3 $spacing-4;
  background-color: $bg-secondary;
  border-bottom: 1px solid $border-color-light;

  label {
    font-weight: $font-weight-medium;
    color: $text-secondary;
    white-space: nowrap;
  }

  select {
    flex: 1;
    max-width: 400px;
    padding: $spacing-2 $spacing-3;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    background-color: $white;
    font-family: inherit;
    font-size: $font-size-sm;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: $primary-color;
    }
  }
}

// Media Content
.media-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

// Audio Player
.audio-player-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.audio-wrapper {
  flex: 1;
  @include flex-column-center;
  gap: $spacing-4;
  padding: $spacing-8;
  background: linear-gradient(135deg, $gray-800 0%, $gray-900 100%);
}

.audio-icon {
  @include flex-center;
  width: 120px;
  height: 120px;
  background-color: rgba($primary-color, 0.2);
  border-radius: 50%;
  color: $primary-color;
}

.audio-filename {
  color: $white;
  font-size: $font-size-lg;
  font-weight: $font-weight-medium;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-element {
  width: 100%;
  max-width: 500px;
  margin-top: $spacing-4;
}

.audio-loading,
.images-loading {
  @include flex-column-center;
  gap: $spacing-3;
  color: $gray-400;
  padding: $spacing-8;

  p {
    font-size: $font-size-sm;
  }
}

.images-loading {
  min-height: 300px;
  background-color: $gray-900;
}

// No Preview
.no-preview {
  flex: 1;
  @include flex-column-center;
  gap: $spacing-4;
  padding: $spacing-8;
  background-color: $bg-secondary;
  color: $text-muted;

  svg {
    opacity: 0.5;
  }

  p {
    font-size: $font-size-base;
  }
}

@include media-down('sm') {
  .media-tabs {
    padding: $spacing-2;
  }

  .media-tab {
    padding: $spacing-2 $spacing-3;
    font-size: $font-size-xs;

    span {
      display: none;
    }
  }

  .file-selector {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-2;

    select {
      max-width: none;
    }
  }
}
</style>
