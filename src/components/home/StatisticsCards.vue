<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { statistics } from '@/services/dspace'
import { useFormatters } from '@/composables/useFormatters'

const { t } = useI18n()
const { formatCompactNumber } = useFormatters()

const stats = ref([
  {
    id: 'items',
    value: 0,
    target: 0,
    label: t('home.stats.items'),
    icon: 'file-text',
    color: '#006C35'
  },
  {
    id: 'communities',
    value: 0,
    target: 0,
    label: t('home.stats.communities'),
    icon: 'folder',
    color: '#1B4D3E'
  },
  {
    id: 'collections',
    value: 0,
    target: 0,
    label: t('home.stats.collections'),
    icon: 'archive',
    color: '#C8A415'
  },
  {
    id: 'downloads',
    value: 0,
    target: 0,
    label: t('home.stats.downloads'),
    icon: 'download',
    color: '#17A2B8'
  }
])

const icons = {
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  'archive': 'M21 8v13H3V8 M1 3h22v5H1z M10 12h4',
  'download': 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3'
}

function animateCounter(stat, duration = 2000) {
  const startTime = performance.now()
  const startValue = stat.value

  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    stat.value = Math.floor(startValue + (stat.target - startValue) * easeOutQuart)

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

function formatNumberDisplay(num) {
  return formatCompactNumber(num)
}

// Fetch statistics from API
async function fetchStatistics() {
  try {
    const summary = await statistics.getRepositorySummary()
    const siteStats = await statistics.getSiteStats()

    // Update targets with real data from API
    stats.value.find(s => s.id === 'items').target = summary.items || 0
    stats.value.find(s => s.id === 'communities').target = summary.communities || 0
    stats.value.find(s => s.id === 'collections').target = summary.collections || 0
    stats.value.find(s => s.id === 'downloads').target = siteStats.totalDownloads || 0
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  }
}

onMounted(async () => {
  // Fetch real statistics from API
  await fetchStatistics()

  // Start animation with delay for each stat
  stats.value.forEach((stat, index) => {
    setTimeout(() => {
      animateCounter(stat, 1500)
    }, index * 200)
  })
})
</script>

<template>
  <section class="statistics-section" aria-labelledby="stats-title">
    <div class="container">
      <h2 id="stats-title" class="sr-only">{{ $t('home.stats.title') }}</h2>

      <div class="stats-grid">
        <div
          v-for="stat in stats"
          :key="stat.id"
          class="stat-card"
          :style="{ '--accent-color': stat.color }"
        >
          <div class="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="icons[stat.icon]"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ formatNumberDisplay(stat.value) }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.statistics-section {
  padding: $spacing-12 0;
  background-color: $bg-secondary;
  margin-top: -$spacing-10;
  position: relative;
  z-index: 1;

  @include media-down('md') {
    padding: $spacing-8 0;
    margin-top: -$spacing-6;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-6;

  @include media-down('lg') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include media-down('sm') {
    grid-template-columns: 1fr;
    gap: $spacing-4;
  }
}

.stat-card {
  @include card;
  display: flex;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-6;
  transition: $transition-default;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;

    .stat-icon {
      transform: scale(1.1);
    }
  }
}

.stat-icon {
  @include flex-center;
  width: 64px;
  height: 64px;
  background-color: rgba(var(--accent-color), 0.1);
  background-color: color-mix(in srgb, var(--accent-color) 10%, transparent);
  border-radius: $border-radius-lg;
  color: var(--accent-color);
  flex-shrink: 0;
  transition: transform $transition-duration-normal ease;

  // Fallback for browsers that don't support color-mix
  @supports not (background-color: color-mix(in srgb, red 50%, blue)) {
    background-color: $primary-lighter;
    color: $primary-color;
  }
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  line-height: 1.2;

  @include media-down('md') {
    font-size: $font-size-2xl;
  }
}

.stat-label {
  font-size: $font-size-sm;
  color: $text-muted;
  margin-top: $spacing-1;
}
</style>
