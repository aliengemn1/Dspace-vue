<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  locations: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['navigate'])

const isReady = ref(false)
const activeHall = ref(null)

// Valid icon names whitelist for security
const validHallIcons = ['book', 'graduation', 'newspaper', 'scroll', 'video']

function getValidIconName(iconName) {
  return validHallIcons.includes(iconName) ? iconName : 'book'
}

function enterHall(hallId) {
  emit('navigate', hallId)
}

onMounted(() => {
  setTimeout(() => {
    isReady.value = true
  }, 300)
})
</script>

<template>
  <div class="virtual-entrance" :class="{ ready: isReady }">
    <!-- Background with parallax effect -->
    <div class="entrance-background">
      <div class="bg-pattern"></div>
      <div class="bg-gradient"></div>
    </div>

    <!-- Main Entrance Content -->
    <div class="entrance-content">
      <!-- KFNL Logo and Welcome -->
      <div class="entrance-header">
        <div class="logo-container">
          <img src="/images/kfnl-logo.png" alt="KFNL" class="kfnl-logo" />
          <div class="logo-glow"></div>
        </div>

        <h1 class="entrance-title">{{ t('virtualTour.welcomeTitle') }}</h1>
        <p class="entrance-subtitle">{{ t('virtualTour.welcomeSubtitle') }}</p>

        <div class="entrance-stats">
          <div class="stat-item">
            <span class="stat-value">+500K</span>
            <span class="stat-label">{{ t('virtualTour.digitalItems') }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">5</span>
            <span class="stat-label">{{ t('virtualTour.virtualHalls') }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">24/7</span>
            <span class="stat-label">{{ t('virtualTour.available') }}</span>
          </div>
        </div>
      </div>

      <!-- Hall Navigation Grid -->
      <div class="halls-section">
        <h2 class="halls-title">{{ t('virtualTour.chooseHall') }}</h2>

        <div class="halls-grid">
          <button
            v-for="hall in locations"
            :key="hall.id"
            class="hall-card"
            :class="{ active: activeHall === hall.id }"
            @mouseenter="activeHall = hall.id"
            @mouseleave="activeHall = null"
            @click="enterHall(hall.id)"
          >
            <div class="hall-icon">
              <!-- Book icon (default) -->
              <svg v-if="getValidIconName(hall.icon) === 'book'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <!-- Graduation icon -->
              <svg v-else-if="getValidIconName(hall.icon) === 'graduation'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              <!-- Newspaper icon -->
              <svg v-else-if="getValidIconName(hall.icon) === 'newspaper'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
              </svg>
              <!-- Scroll icon -->
              <svg v-else-if="getValidIconName(hall.icon) === 'scroll'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/>
              </svg>
              <!-- Video icon -->
              <svg v-else-if="getValidIconName(hall.icon) === 'video'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
              </svg>
            </div>
            <div class="hall-info">
              <h3 class="hall-name">{{ hall.name }}</h3>
              <p class="hall-name-en">{{ hall.nameEn }}</p>
            </div>
            <div class="hall-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
            <div class="hall-shine"></div>
          </button>
        </div>
      </div>

      <!-- Instructions -->
      <div class="entrance-instructions">
        <div class="instruction-item">
          <kbd>M</kbd>
          <span>{{ t('virtualTour.toggleMap') }}</span>
        </div>
        <div class="instruction-item">
          <kbd>G</kbd>
          <span>{{ t('virtualTour.toggleGuide') }}</span>
        </div>
        <div class="instruction-item">
          <kbd>ESC</kbd>
          <span>{{ t('virtualTour.goBack') }}</span>
        </div>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="decorative-pillars">
      <div class="pillar pillar-left"></div>
      <div class="pillar pillar-right"></div>
    </div>

    <!-- Floating particles -->
    <div class="particles">
      <div v-for="i in 20" :key="i" class="particle" :style="{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${5 + Math.random() * 5}s`
      }"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.virtual-entrance {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-8;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease-out;

  &.ready {
    opacity: 1;
    transform: translateY(0);
  }
}

// Background
.entrance-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 80%, rgba($primary-color, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba($accent-color, 0.1) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8A415' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba($gray-900, 0.95) 0%,
    rgba($primary-dark, 0.9) 50%,
    rgba($gray-900, 0.95) 100%
  );
}

// Content
.entrance-content {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  width: 100%;
  text-align: center;
}

// Header
.entrance-header {
  margin-bottom: $spacing-12;
}

.logo-container {
  position: relative;
  display: inline-block;
  margin-bottom: $spacing-6;
}

.kfnl-logo {
  width: 140px;
  height: auto;
  position: relative;
  z-index: 1;
  animation: float 6s ease-in-out infinite;
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba($accent-color, 0.3) 0%, transparent 70%);
  animation: pulse-glow 3s ease-in-out infinite;
}

.entrance-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: $font-weight-bold;
  color: $white;
  margin-bottom: $spacing-3;
  text-shadow: 0 4px 20px rgba($black, 0.5);
}

.entrance-subtitle {
  font-size: $font-size-xl;
  color: $gray-300;
  max-width: 600px;
  margin: 0 auto $spacing-8;
}

.entrance-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-6;
  padding: $spacing-4 $spacing-8;
  background: rgba($gray-800, 0.5);
  border: 1px solid $gray-700;
  border-radius: $border-radius-lg;
  backdrop-filter: blur(10px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-1;
}

.stat-value {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $accent-color;
}

.stat-label {
  font-size: $font-size-sm;
  color: $gray-400;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background-color: $gray-600;
}

// Halls Section
.halls-section {
  margin-bottom: $spacing-12;
}

.halls-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $gray-300;
  margin-bottom: $spacing-6;
}

.halls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: $spacing-4;
  max-width: 900px;
  margin: 0 auto;
}

.hall-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-5;
  background: linear-gradient(135deg, rgba($gray-800, 0.8) 0%, rgba($gray-900, 0.9) 100%);
  border: 1px solid $gray-700;
  border-radius: $border-radius-lg;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-align: start;

  &:hover,
  &.active {
    transform: translateY(-4px) scale(1.02);
    border-color: $accent-color;
    box-shadow:
      0 20px 40px rgba($black, 0.3),
      0 0 30px rgba($accent-color, 0.2);

    .hall-icon {
      background-color: $accent-color;
      color: $primary-dark;
      transform: scale(1.1);
    }

    .hall-arrow {
      transform: translateX(0);
      opacity: 1;
    }

    .hall-shine {
      transform: translateX(100%);
    }
  }
}

.hall-icon {
  @include flex-center;
  width: 56px;
  height: 56px;
  background-color: $gray-700;
  border-radius: $border-radius-md;
  color: $accent-color;
  flex-shrink: 0;
  transition: all 0.3s ease;

  :deep(svg) {
    width: 28px;
    height: 28px;
  }
}

.hall-info {
  flex: 1;
}

.hall-name {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $white;
  margin-bottom: $spacing-1;
}

.hall-name-en {
  font-size: $font-size-sm;
  color: $gray-400;
}

.hall-arrow {
  color: $accent-color;
  transform: translateX(-10px);
  opacity: 0;
  transition: all 0.3s ease;
}

.hall-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba($white, 0.1),
    transparent
  );
  transition: transform 0.6s ease;
}

// Instructions
.entrance-instructions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-6;
  color: $gray-500;
  font-size: $font-size-sm;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: $spacing-2;

  kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 $spacing-2;
    background-color: $gray-800;
    border: 1px solid $gray-600;
    border-radius: $border-radius-sm;
    font-family: monospace;
    font-size: $font-size-xs;
    color: $gray-300;
  }
}

// Decorative Pillars
.decorative-pillars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.pillar {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba($accent-color, 0.05) 20%,
    rgba($accent-color, 0.1) 50%,
    rgba($accent-color, 0.05) 80%,
    transparent 100%
  );

  &::before {
    content: '';
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 80%;
    border: 1px solid rgba($accent-color, 0.2);
    border-radius: $border-radius-sm;
  }

  &.pillar-left {
    left: 5%;
  }

  &.pillar-right {
    right: 5%;
  }
}

// Particles
.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  bottom: -10px;
  width: 6px;
  height: 6px;
  background-color: rgba($accent-color, 0.6);
  border-radius: 50%;
  animation: rise linear infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes rise {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
}

// Responsive
@include media-down('lg') {
  .halls-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@include media-down('md') {
  .virtual-entrance {
    padding: $spacing-4;
  }

  .entrance-title {
    font-size: 2rem;
  }

  .entrance-subtitle {
    font-size: $font-size-base;
  }

  .entrance-stats {
    flex-direction: column;
    gap: $spacing-4;
    padding: $spacing-4;
  }

  .stat-divider {
    width: 60px;
    height: 1px;
  }

  .halls-grid {
    grid-template-columns: 1fr;
  }

  .entrance-instructions {
    flex-direction: column;
    gap: $spacing-3;
  }

  .pillar {
    display: none;
  }
}
</style>
