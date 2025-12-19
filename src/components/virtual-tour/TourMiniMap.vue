<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  locations: {
    type: Array,
    required: true
  },
  currentLocation: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['navigate', 'close'])

// Map layout positions for each location
const locationPositions = {
  entrance: { x: 50, y: 90 },
  books: { x: 20, y: 50 },
  theses: { x: 50, y: 30 },
  periodicals: { x: 80, y: 50 },
  manuscripts: { x: 30, y: 15 },
  media: { x: 70, y: 15 }
}

const locationsWithPositions = computed(() => {
  return props.locations.map(loc => ({
    ...loc,
    position: locationPositions[loc.id] || { x: 50, y: 50 }
  }))
})

const currentPos = computed(() => {
  return locationPositions[props.currentLocation] || { x: 50, y: 90 }
})

function navigateTo(locationId) {
  if (locationId !== props.currentLocation) {
    emit('navigate', locationId)
  }
}
</script>

<template>
  <div class="tour-mini-map">
    <div class="map-header">
      <h3 class="map-title">{{ t('virtualTour.map') }}</h3>
      <button class="close-btn" @click="$emit('close')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="map-container">
      <!-- Map Background -->
      <svg class="map-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <!-- Floor Plan -->
        <rect x="5" y="5" width="90" height="90" rx="2" fill="none" stroke="rgba(200, 164, 21, 0.3)" stroke-width="0.5"/>

        <!-- Connection Lines -->
        <line
          v-for="loc in locationsWithPositions.filter(l => l.id !== 'entrance')"
          :key="`line-${loc.id}`"
          :x1="locationPositions.entrance.x"
          :y1="locationPositions.entrance.y"
          :x2="loc.position.x"
          :y2="loc.position.y"
          stroke="rgba(200, 164, 21, 0.2)"
          stroke-width="0.5"
          stroke-dasharray="2,2"
        />

        <!-- Current Position Indicator (animated) -->
        <circle
          :cx="currentPos.x"
          :cy="currentPos.y"
          r="8"
          fill="none"
          stroke="rgba(200, 164, 21, 0.5)"
          stroke-width="0.5"
          class="pulse-ring"
        />
      </svg>

      <!-- Location Markers -->
      <button
        v-for="loc in locationsWithPositions"
        :key="loc.id"
        class="map-marker"
        :class="{ active: currentLocation === loc.id }"
        :style="{
          left: `${loc.position.x}%`,
          top: `${loc.position.y}%`
        }"
        @click="navigateTo(loc.id)"
        :title="loc.name"
      >
        <span class="marker-dot"></span>
        <span class="marker-label">{{ loc.name }}</span>
      </button>
    </div>

    <div class="map-legend">
      <div class="legend-item">
        <span class="legend-dot current"></span>
        <span>{{ t('virtualTour.currentLocation') }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot available"></span>
        <span>{{ t('virtualTour.availableHalls') }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tour-mini-map {
  position: fixed;
  bottom: $spacing-6;
  left: $spacing-6;
  width: 260px;
  background: rgba($gray-900, 0.95);
  border: 1px solid $gray-700;
  border-radius: $border-radius-lg;
  backdrop-filter: blur(10px);
  overflow: hidden;
  z-index: 60;
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-3 $spacing-4;
  background: rgba($gray-800, 0.5);
  border-bottom: 1px solid $gray-700;
}

.map-title {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $white;
}

.close-btn {
  @include flex-center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: $gray-400;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    color: $white;
  }
}

.map-container {
  position: relative;
  height: 180px;
  padding: $spacing-2;
}

.map-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.pulse-ring {
  animation: pulse-map 2s ease-in-out infinite;
}

@keyframes pulse-map {
  0%, 100% {
    r: 6;
    opacity: 1;
  }
  50% {
    r: 12;
    opacity: 0.3;
  }
}

.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-1;
  background: none;
  border: none;
  cursor: pointer;
  transition: $transition-fast;
  z-index: 10;

  &:hover {
    .marker-dot {
      transform: scale(1.3);
      background-color: $accent-color;
    }

    .marker-label {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &.active {
    .marker-dot {
      background-color: $accent-color;
      box-shadow: 0 0 10px $accent-color;
    }

    .marker-label {
      color: $accent-color;
    }
  }
}

.marker-dot {
  width: 10px;
  height: 10px;
  background-color: $gray-500;
  border: 2px solid $gray-300;
  border-radius: 50%;
  transition: $transition-fast;
}

.marker-label {
  font-size: 8px;
  color: $gray-400;
  white-space: nowrap;
  opacity: 0.7;
  transition: $transition-fast;
}

.map-legend {
  display: flex;
  gap: $spacing-4;
  padding: $spacing-2 $spacing-4;
  background: rgba($gray-800, 0.3);
  border-top: 1px solid $gray-700;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  font-size: 9px;
  color: $gray-500;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.current {
    background-color: $accent-color;
    box-shadow: 0 0 6px $accent-color;
  }

  &.available {
    background-color: $gray-500;
    border: 1px solid $gray-400;
  }
}

@include media-down('md') {
  .tour-mini-map {
    left: $spacing-4;
    bottom: $spacing-4;
    width: 220px;
  }

  .map-container {
    height: 140px;
  }

  .marker-label {
    display: none;
  }
}
</style>
