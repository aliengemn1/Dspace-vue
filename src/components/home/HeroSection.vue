<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SearchBox from '@/components/common/SearchBox.vue'

const router = useRouter()
const searchQuery = ref('')
const particles = ref([])
const floatingIcons = ref([])
const videoRef = ref(null)
const isLoaded = ref(false)

// Generate floating particles
function generateParticles() {
  const particleCount = 20
  particles.value = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5
  }))
}

// Generate floating academic icons
function generateFloatingIcons() {
  const icons = ['book', 'scroll', 'graduation', 'document', 'archive', 'globe']
  floatingIcons.value = icons.map((icon, i) => ({
    id: i,
    type: icon,
    x: 10 + (i * 15),
    y: Math.random() * 60 + 20,
    duration: Math.random() * 8 + 12,
    delay: i * 0.5
  }))
}

function handleSearch(query) {
  if (query.trim()) {
    router.push({ path: '/search', query: { q: query } })
  }
}

function goToAdvancedSearch() {
  router.push('/search?advanced=true')
}

onMounted(() => {
  generateParticles()
  generateFloatingIcons()

  // Show content after 1 second loading
  setTimeout(() => {
    isLoaded.value = true
  }, 1000)

  // Ensure video plays on mount
  if (videoRef.value) {
    videoRef.value.play().catch(() => {
      console.log('Video autoplay was prevented on mount')
    })
  }
})
</script>

<template>
  <!-- Loading Screen -->
  <div v-if="!isLoaded" class="loading-screen">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p class="loading-text">جارٍ التحميل...</p>
    </div>
  </div>

  <section class="hero-section" :class="{ 'is-loaded': isLoaded }" aria-labelledby="hero-title">
    <div class="hero-background">
      <!-- Video Background -->
      <video
        ref="videoRef"
        class="hero-video"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
      >
        <source src="/videos/hero-video.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <div class="hero-overlay"></div>
    </div>

    <div class="container">
      <div class="hero-content">
        <!-- Title -->
        <h1 id="hero-title" class="hero-title">
          {{ $t('home.hero.title') }}
        </h1>

        <!-- Subtitle -->
        <p class="hero-subtitle">
          {{ $t('home.hero.subtitle') }}
        </p>

        <!-- Description -->
        <p class="hero-description">
          {{ $t('home.hero.description') }}
        </p>

        <!-- Search Box -->
        <div class="hero-search">
          <SearchBox
            v-model="searchQuery"
            :placeholder="$t('search.placeholder')"
            :show-advanced="true"
            :show-categories="true"
            @search="handleSearch"
            @advanced="goToAdvancedSearch"
          />
        </div>

        <!-- Quick Links -->
        <div class="hero-quick-links">
          <span class="quick-links-label">{{ $t('home.browse.title') }}:</span>
          <router-link to="/browse?type=author" class="quick-link">
            {{ $t('home.browse.byAuthor') }}
          </router-link>
          <router-link to="/browse?type=subject" class="quick-link">
            {{ $t('home.browse.bySubject') }}
          </router-link>
          <router-link to="/browse?type=date" class="quick-link">
            {{ $t('home.browse.byDate') }}
          </router-link>
          <router-link to="/browse?type=type" class="quick-link">
            {{ $t('home.browse.byType') }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Floating Particles -->
    <div class="particles-container" aria-hidden="true">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          animationDuration: `${particle.duration}s`,
          animationDelay: `${particle.delay}s`
        }"
      />
    </div>

    <!-- Floating Academic Icons -->
    <div class="floating-icons-container" aria-hidden="true">
      <div
        v-for="icon in floatingIcons"
        :key="icon.id"
        class="floating-icon"
        :class="`icon-${icon.type}`"
        :style="{
          left: `${icon.x}%`,
          top: `${icon.y}%`,
          animationDuration: `${icon.duration}s`,
          animationDelay: `${icon.delay}s`
        }"
      >
        <!-- Book Icon -->
        <svg v-if="icon.type === 'book'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <!-- Scroll Icon -->
        <svg v-else-if="icon.type === 'scroll'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/>
          <path d="M19 17V5a2 2 0 0 0-2-2H4"/>
        </svg>
        <!-- Graduation Cap -->
        <svg v-else-if="icon.type === 'graduation'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
        </svg>
        <!-- Document Icon -->
        <svg v-else-if="icon.type === 'document'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <!-- Archive Icon -->
        <svg v-else-if="icon.type === 'archive'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="21 8 21 21 3 21 3 8"/>
          <rect x="1" y="3" width="22" height="5"/>
          <line x1="10" y1="12" x2="14" y2="12"/>
        </svg>
        <!-- Globe Icon -->
        <svg v-else-if="icon.type === 'globe'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="hero-decoration">
      <div class="decoration-circle decoration-circle-1"></div>
      <div class="decoration-circle decoration-circle-2"></div>
      <div class="decoration-circle decoration-circle-3"></div>
      <!-- Gold accent line -->
      <div class="gold-accent-line"></div>
    </div>

    <!-- Bottom Wave -->
    <div class="hero-wave">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="currentColor"/>
      </svg>
    </div>
  </section>
</template>

<style lang="scss" scoped>
// Loading Screen
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: linear-gradient(135deg, $primary-darker 0%, $primary-dark 50%, $secondary-color 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeOut 0.5s ease-out 0.8s forwards;
}

.loading-content {
  text-align: center;
  color: $white;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba($white, 0.2);
  border-top-color: $accent-color;
  border-radius: 50%;
  margin: 0 auto $spacing-4;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: $font-size-lg;
  font-weight: $font-weight-medium;
  color: rgba($white, 0.9);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeOut {
  to {
    opacity: 0;
    visibility: hidden;
  }
}

// Keyframe Animations
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(-10px) translateX(-5px);
  }
  75% {
    transform: translateY(-25px) translateX(5px);
  }
}

@keyframes float-icon {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-30px) rotate(5deg);
    opacity: 0.5;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba($accent-color, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba($accent-color, 0.5);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.hero-section {
  position: relative;
  min-height: 85vh;
  padding: $spacing-16 0 $spacing-24;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;

  &.is-loaded {
    opacity: 1;
    transform: translateY(0);
  }

  @include media-down('lg') {
    min-height: 80vh;
    padding: $spacing-12 0 $spacing-20;
  }

  @include media-down('md') {
    min-height: 75vh;
    padding: $spacing-12 0 $spacing-16;
  }

  @include media-down('sm') {
    min-height: 70vh;
    padding: $spacing-10 0 $spacing-12;
  }
}

// Background with video
.hero-background {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: linear-gradient(135deg, $primary-light 0%, $primary-color 50%, $secondary-light 100%);
}

.hero-video {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  min-height: 100%;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  opacity: 0.5;
  z-index: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba($primary-color, 0.55) 0%,
    rgba($primary-light, 0.45) 30%,
    rgba($primary-color, 0.4) 60%,
    rgba($secondary-light, 0.5) 100%
  );

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 20% 80%, rgba($accent-color, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba($accent-light, 0.1) 0%, transparent 50%);
  }
}

// Content
.hero-content {
  position: relative;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
  color: $white;
  z-index: 10;
  padding: 0 $spacing-4;

  @include media-down('lg') {
    max-width: 800px;
  }

  @include media-down('md') {
    max-width: 600px;
    padding: 0 $spacing-6;
  }

  @include media-down('sm') {
    max-width: 100%;
    padding: 0 $spacing-4;
  }
}

// Badge
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-5;
  background: linear-gradient(135deg, rgba($accent-color, 0.2) 0%, rgba($accent-light, 0.15) 100%);
  border: 1px solid rgba($accent-color, 0.4);
  border-radius: $border-radius-full;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  margin-bottom: $spacing-8;
  backdrop-filter: blur(8px);
  animation: pulse-glow 3s ease-in-out infinite;

  svg {
    color: $accent-light;
  }
}

// Title
.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: $font-weight-bold;
  line-height: 1.15;
  margin-bottom: $spacing-5;
  text-shadow: 0 4px 20px rgba($black, 0.3);
  background: linear-gradient(135deg, $white 0%, rgba($white, 0.9) 50%, $accent-light 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  // Fallback for browsers that don't support background-clip: text
  @supports not (background-clip: text) {
    background: none;
    -webkit-text-fill-color: $white;
  }

  @include media-down('md') {
    font-size: clamp(1.75rem, 6vw, 2.5rem);
    margin-bottom: $spacing-4;
  }

  @include media-down('sm') {
    font-size: clamp(1.5rem, 7vw, 2rem);
    margin-bottom: $spacing-3;
  }
}

// Subtitle
.hero-subtitle {
  font-size: $font-size-xl;
  font-weight: $font-weight-medium;
  margin-bottom: $spacing-4;
  color: $accent-light;
  text-shadow: 0 2px 10px rgba($black, 0.2);

  @include media-down('md') {
    font-size: $font-size-lg;
    margin-bottom: $spacing-3;
  }

  @include media-down('sm') {
    font-size: $font-size-base;
    margin-bottom: $spacing-2;
  }
}

// Description
.hero-description {
  font-size: $font-size-lg;
  color: rgba($white, 0.9);
  margin-bottom: $spacing-10;
  max-width: 650px;
  margin-inline: auto;
  line-height: $line-height-relaxed;

  @include media-down('md') {
    font-size: $font-size-base;
    margin-bottom: $spacing-8;
    max-width: 500px;
  }

  @include media-down('sm') {
    font-size: $font-size-sm;
    margin-bottom: $spacing-6;
    max-width: 100%;
    line-height: $line-height-normal;
  }
}

// Search Box
.hero-search {
  max-width: 700px;
  margin: 0 auto $spacing-8;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    background: linear-gradient(135deg, $accent-color, $primary-light, $accent-light);
    border-radius: $border-radius-xl;
    opacity: 0.5;
    filter: blur(10px);
    z-index: -1;
  }

  :deep(.search-input-wrapper) {
    background-color: rgba($white, 0.98);
    border: 2px solid transparent;
    box-shadow: $shadow-2xl, 0 0 30px rgba($accent-color, 0.2);
    border-radius: $border-radius-lg;
    transition: $transition-default;

    &:focus-within {
      border-color: $accent-color;
      box-shadow: $shadow-2xl, 0 0 40px rgba($accent-color, 0.4);
    }
  }

  :deep(.search-input) {
    font-size: $font-size-lg;
    padding: $spacing-4 $spacing-6;
  }

  @include media-down('md') {
    max-width: 100%;
    margin-bottom: $spacing-6;

    :deep(.search-input) {
      font-size: $font-size-base;
      padding: $spacing-3 $spacing-4;
    }
  }

  @include media-down('sm') {
    margin-bottom: $spacing-5;

    :deep(.search-input) {
      font-size: $font-size-sm;
      padding: $spacing-3;
    }
  }
}

// Quick Links
.hero-quick-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: $spacing-4;

  @include media-down('md') {
    gap: $spacing-3;
  }

  @include media-down('sm') {
    flex-direction: column;
    gap: $spacing-2;
  }
}

.quick-links-label {
  font-size: $font-size-sm;
  color: rgba($white, 0.85);
  font-weight: $font-weight-medium;
}

.quick-link {
  font-size: $font-size-sm;
  color: $white;
  text-decoration: none;
  padding: $spacing-2 $spacing-4;
  background: linear-gradient(135deg, rgba($white, 0.1) 0%, rgba($white, 0.05) 100%);
  border: 1px solid rgba($white, 0.2);
  border-radius: $border-radius-full;
  transition: $transition-default;
  backdrop-filter: blur(4px);

  &:hover {
    background: linear-gradient(135deg, rgba($accent-color, 0.3) 0%, rgba($accent-light, 0.2) 100%);
    border-color: rgba($accent-color, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba($accent-color, 0.3);
  }
}

// Floating Particles
.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, rgba($accent-light, 0.8) 0%, rgba($accent-color, 0.4) 50%, transparent 100%);
  border-radius: 50%;
  animation: float linear infinite;

  @include media-down('md') {
    opacity: 0.5;
  }
}

// Floating Academic Icons
.floating-icons-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 2;

  @include media-down('md') {
    display: none;
  }
}

.floating-icon {
  position: absolute;
  color: rgba($accent-light, 0.3);
  animation: float-icon ease-in-out infinite;

  svg {
    filter: drop-shadow(0 2px 8px rgba($accent-color, 0.3));
  }
}

// Decorative Elements
.hero-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;

  &.decoration-circle-1 {
    width: 500px;
    height: 500px;
    top: -150px;
    inset-inline-end: -150px;
    background: radial-gradient(circle, rgba($accent-color, 0.15) 0%, transparent 60%);
    animation: float 20s ease-in-out infinite;

    @include media-down('md') {
      width: 250px;
      height: 250px;
    }
  }

  &.decoration-circle-2 {
    width: 400px;
    height: 400px;
    bottom: -100px;
    inset-inline-start: -100px;
    background: radial-gradient(circle, rgba($primary-light, 0.2) 0%, transparent 60%);
    animation: float 25s ease-in-out infinite reverse;

    @include media-down('md') {
      width: 200px;
      height: 200px;
    }
  }

  &.decoration-circle-3 {
    width: 200px;
    height: 200px;
    top: 40%;
    inset-inline-start: 5%;
    background: radial-gradient(circle, rgba($accent-light, 0.1) 0%, transparent 70%);
    animation: float 15s ease-in-out infinite;

    @include media-down('md') {
      display: none;
    }
  }
}

// Gold accent line
.gold-accent-line {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 3px;
  background: linear-gradient(90deg, transparent, $accent-color, $accent-light, $accent-color, transparent);
  border-radius: $border-radius-full;
  opacity: 0.6;

  @include media-down('md') {
    bottom: 80px;
    width: 100px;
  }
}

// Bottom Wave
.hero-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  color: $bg-primary;
  z-index: 5;

  svg {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 100%;
  }

  @include media-down('md') {
    height: 50px;
  }
}
</style>
