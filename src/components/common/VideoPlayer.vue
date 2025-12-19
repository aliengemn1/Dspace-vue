<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { bitstreams } from '@/services/dspace'

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
  poster: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  mimeType: {
    type: String,
    default: 'video/mp4'
  }
})

const emit = defineEmits(['close'])

const videoRef = ref(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const isFullscreen = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const isLoading = ref(true)
const hasError = ref(false)
const blobUrl = ref(null) // Store blob URL for cleanup

// Computed video source - use blob URL if available
const videoSrc = computed(() => {
  return blobUrl.value || props.src
})

// Fetch video as blob to bypass Content-Disposition: attachment
async function loadVideoAsBlob() {
  if (!props.fileId) {
    return
  }

  isLoading.value = true
  hasError.value = false

  try {
    // Revoke previous blob URL if exists
    if (blobUrl.value) {
      bitstreams.revokeBlobUrl(blobUrl.value)
    }

    // Fetch as blob
    blobUrl.value = await bitstreams.getContentAsBlob(props.fileId, props.mimeType)
    console.log('Video loaded as blob:', blobUrl.value)
  } catch (error) {
    console.error('Failed to load video as blob:', error)
    // Fall back to direct URL
    blobUrl.value = null
  }
}

// Watch for fileId changes
watch(() => props.fileId, () => {
  if (props.fileId) {
    loadVideoAsBlob()
  }
}, { immediate: false })

const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const formattedCurrentTime = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(duration.value))

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function togglePlay() {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause()
    } else {
      videoRef.value.play()
    }
  }
}

function toggleMute() {
  if (videoRef.value) {
    videoRef.value.muted = !videoRef.value.muted
    isMuted.value = videoRef.value.muted
  }
}

function setVolume(e) {
  const newVolume = parseFloat(e.target.value)
  volume.value = newVolume
  if (videoRef.value) {
    videoRef.value.volume = newVolume
    isMuted.value = newVolume === 0
  }
}

function seek(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  if (videoRef.value && duration.value) {
    videoRef.value.currentTime = percent * duration.value
  }
}

function toggleFullscreen() {
  const container = document.querySelector('.video-player-container')
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

function handleLoadedMetadata() {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
  }
  isLoading.value = false
}

function handleTimeUpdate() {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
  }
}

function handlePlay() {
  isPlaying.value = true
}

function handlePause() {
  isPlaying.value = false
}

function handleError(e) {
  console.error('Video error:', e)
  isLoading.value = false
  hasError.value = true
}

function handleEnded() {
  isPlaying.value = false
}

function handleCanPlay() {
  isLoading.value = false
}

function handleWaiting() {
  isLoading.value = true
}

function skip(seconds) {
  if (videoRef.value) {
    videoRef.value.currentTime = Math.max(0, Math.min(duration.value, videoRef.value.currentTime + seconds))
  }
}

function closePlayer() {
  emit('close')
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  // Load video as blob if fileId is provided
  if (props.fileId) {
    loadVideoAsBlob()
  }
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  // Clean up blob URL to free memory
  if (blobUrl.value) {
    bitstreams.revokeBlobUrl(blobUrl.value)
  }
})
</script>

<template>
  <div class="video-player-container" :class="{ 'is-fullscreen': isFullscreen }">
    <!-- Video Element -->
    <div class="video-wrapper" @click="togglePlay">
      <!-- Loading State -->
      <div v-if="isLoading" class="video-loading">
        <div class="spinner"></div>
        <p>{{ t('common.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-if="hasError" class="video-error">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>فشل تحميل الفيديو</p>
      </div>

      <video
        v-show="!hasError"
        ref="videoRef"
        :poster="poster"
        preload="auto"
        playsinline
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        @loadedmetadata="handleLoadedMetadata"
        @timeupdate="handleTimeUpdate"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
        @error="handleError"
        @canplay="handleCanPlay"
        @waiting="handleWaiting"
        @contextmenu.prevent
      >
        <source :src="videoSrc" :type="mimeType" />
        <!-- Fallback message for browsers that don't support video -->
        Your browser does not support the video tag.
      </video>

      <!-- Play/Pause Overlay -->
      <div v-if="!isPlaying && !isLoading && !hasError" class="play-overlay">
        <button class="play-btn" @click.stop="togglePlay">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Controls -->
    <div class="video-controls">
      <!-- Progress Bar -->
      <div class="progress-container" @click="seek">
        <div class="progress-bar">
          <div class="progress-filled" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>

      <div class="controls-row">
        <!-- Left Controls -->
        <div class="controls-left">
          <!-- Play/Pause -->
          <button class="control-btn" @click="togglePlay">
            <svg v-if="isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>

          <!-- Skip Backward -->
          <button class="control-btn" @click="skip(-10)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 19 2 12 11 5 11 19"/>
              <polygon points="22 19 13 12 22 5 22 19"/>
            </svg>
          </button>

          <!-- Skip Forward -->
          <button class="control-btn" @click="skip(10)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 19 22 12 13 5 13 19"/>
              <polygon points="2 19 11 12 2 5 2 19"/>
            </svg>
          </button>

          <!-- Volume -->
          <div class="volume-control">
            <button class="control-btn" @click="toggleMute">
              <svg v-if="isMuted || volume === 0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
              <svg v-else-if="volume < 0.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            </button>
            <input
              type="range"
              class="volume-slider"
              min="0"
              max="1"
              step="0.1"
              :value="volume"
              @input="setVolume"
            />
          </div>

          <!-- Time Display -->
          <div class="time-display">
            <span>{{ formattedCurrentTime }}</span>
            <span class="time-separator">/</span>
            <span>{{ formattedDuration }}</span>
          </div>
        </div>

        <!-- Right Controls -->
        <div class="controls-right">
          <!-- Title -->
          <span v-if="title" class="video-title">{{ title }}</span>

          <!-- Fullscreen -->
          <button class="control-btn" @click="toggleFullscreen">
            <svg v-if="!isFullscreen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 3 21 3 21 9"/>
              <polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 14 10 14 10 20"/>
              <polyline points="20 10 14 10 14 4"/>
              <line x1="14" y1="10" x2="21" y2="3"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>

          <!-- Close -->
          <button class="control-btn control-btn-close" @click="closePlayer" :title="t('common.close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.video-player-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: $gray-900;
  border-radius: $border-radius-lg;
  overflow: hidden;

  &.is-fullscreen {
    border-radius: 0;

    .video-wrapper {
      height: calc(100vh - 80px);
    }
  }
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  background-color: $black;
  cursor: pointer;

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.video-loading,
.video-error {
  position: absolute;
  inset: 0;
  @include flex-column-center;
  gap: $spacing-4;
  color: $gray-400;
  background-color: rgba($black, 0.8);

  p {
    font-size: $font-size-sm;
  }
}

.video-error svg {
  color: $error-color;
}

.play-overlay {
  position: absolute;
  inset: 0;
  @include flex-center;
  background-color: rgba($black, 0.3);
}

.play-btn {
  @include flex-center;
  width: 80px;
  height: 80px;
  background-color: rgba($primary-color, 0.9);
  border: none;
  border-radius: 50%;
  color: $white;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: $primary-color;
    transform: scale(1.1);
  }
}

// Controls
.video-controls {
  background-color: $gray-800;
  padding: $spacing-2 $spacing-4 $spacing-3;
}

.progress-container {
  padding: $spacing-2 0;
  cursor: pointer;
}

.progress-bar {
  height: 4px;
  background-color: $gray-600;
  border-radius: 2px;
  overflow: hidden;

  &:hover {
    height: 6px;
  }
}

.progress-filled {
  height: 100%;
  background-color: $primary-color;
  transition: width 0.1s linear;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-4;
}

.controls-left,
.controls-right {
  display: flex;
  align-items: center;
  gap: $spacing-2;
}

.control-btn {
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

  &.control-btn-close:hover {
    background-color: $error-color;
  }
}

.volume-control {
  display: flex;
  align-items: center;
  gap: $spacing-1;
}

.volume-slider {
  width: 80px;
  height: 4px;
  background-color: $gray-600;
  border-radius: 2px;
  appearance: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background-color: $primary-color;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background-color: $primary-color;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
}

.time-display {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  font-size: $font-size-sm;
  color: $gray-300;
  font-family: monospace;
}

.time-separator {
  color: $gray-500;
}

.video-title {
  font-size: $font-size-sm;
  color: $gray-400;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@include media-down('sm') {
  .video-wrapper {
    height: 250px;
  }

  .volume-control {
    display: none;
  }

  .video-title {
    display: none;
  }
}
</style>
