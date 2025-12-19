<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const isRtl = computed(() => locale.value === 'ar')

// User journey stages
const journeyStages = ref([
  {
    id: 'entry',
    icon: 'log-in',
    color: '#006C35',
    actions: ['directUrl', 'searchEngine', 'socialMedia', 'referral']
  },
  {
    id: 'discovery',
    icon: 'search',
    color: '#17A2B8',
    actions: ['simpleSearch', 'advancedSearch', 'browse', 'filters']
  },
  {
    id: 'results',
    icon: 'list',
    color: '#C8A415',
    actions: ['viewResults', 'sortResults', 'filterResults', 'paginate']
  },
  {
    id: 'itemView',
    icon: 'file',
    color: '#6F42C1',
    actions: ['viewMetadata', 'previewFile', 'viewStats', 'checkIdentifiers']
  },
  {
    id: 'action',
    icon: 'download',
    color: '#FD7E14',
    actions: ['download', 'cite', 'share', 'viewRelated']
  },
  {
    id: 'exit',
    icon: 'log-out',
    color: '#1B4D3E',
    actions: ['saveSearch', 'bookmark', 'subscribe', 'feedback']
  }
])

// User flow paths
const userFlows = ref([
  {
    id: 'researcher',
    name: 'researcherFlow',
    color: '#006C35',
    steps: ['entry', 'discovery', 'results', 'itemView', 'action', 'exit'],
    description: 'researcherDesc'
  },
  {
    id: 'student',
    name: 'studentFlow',
    color: '#17A2B8',
    steps: ['entry', 'discovery', 'results', 'itemView', 'action'],
    description: 'studentDesc'
  },
  {
    id: 'publisher',
    name: 'publisherFlow',
    color: '#C8A415',
    steps: ['entry', 'legalDeposit', 'submission', 'tracking'],
    description: 'publisherDesc'
  }
])

// Touchpoints
const touchpoints = ref([
  { id: 'hover', icon: 'mouse-pointer', description: 'hoverDesc' },
  { id: 'click', icon: 'pointer', description: 'clickDesc' },
  { id: 'filter', icon: 'filter', description: 'filterDesc' },
  { id: 'scroll', icon: 'scroll', description: 'scrollDesc' }
])

const activeFlow = ref('researcher')
const activeStage = ref(null)

function setActiveFlow(flowId) {
  activeFlow.value = flowId
}

function setActiveStage(stageId) {
  activeStage.value = activeStage.value === stageId ? null : stageId
}

function getStageIndex(stageId) {
  return journeyStages.value.findIndex(s => s.id === stageId) + 1
}
</script>

<template>
  <div class="journey-map" :class="{ 'is-rtl': isRtl }">
    <!-- Map Header -->
    <div class="map-header">
      <h2 class="map-title">{{ $t('sitemap.journey.title') }}</h2>
      <p class="map-description">{{ $t('sitemap.journey.description') }}</p>
    </div>

    <!-- User Flow Selector -->
    <div class="flow-selector">
      <h3 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        {{ $t('sitemap.journey.selectFlow') }}
      </h3>
      <div class="flow-buttons">
        <button
          v-for="flow in userFlows"
          :key="flow.id"
          class="flow-btn"
          :class="{ 'is-active': activeFlow === flow.id }"
          :style="{ '--flow-color': flow.color }"
          @click="setActiveFlow(flow.id)"
        >
          <!-- Researcher -->
          <svg v-if="flow.id === 'researcher'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
          <!-- Student -->
          <svg v-else-if="flow.id === 'student'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <!-- Publisher -->
          <svg v-else-if="flow.id === 'publisher'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
            <path d="M9 22v-4h6v4"/>
            <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>
          </svg>
          <span>{{ $t(`sitemap.journey.flows.${flow.name}`) }}</span>
        </button>
      </div>
      <p class="flow-description">
        {{ $t(`sitemap.journey.flows.${userFlows.find(f => f.id === activeFlow).description}`) }}
      </p>
    </div>

    <!-- Journey Timeline -->
    <div class="journey-timeline">
      <h3 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        {{ $t('sitemap.journey.stages') }}
      </h3>

      <div class="timeline-container">
        <!-- Timeline Track -->
        <div class="timeline-track">
          <div
            class="timeline-progress"
            :style="{
              '--progress-color': userFlows.find(f => f.id === activeFlow).color,
              width: '100%'
            }"
          ></div>
        </div>

        <!-- Stage Cards -->
        <div class="stages-container">
          <div
            v-for="(stage, index) in journeyStages"
            :key="stage.id"
            class="stage-card"
            :class="{
              'is-active': activeStage === stage.id,
              'is-in-flow': userFlows.find(f => f.id === activeFlow).steps.includes(stage.id)
            }"
            :style="{ '--stage-color': stage.color }"
            @click="setActiveStage(stage.id)"
          >
            <!-- Stage Number -->
            <div class="stage-number">{{ index + 1 }}</div>

            <!-- Stage Icon -->
            <div class="stage-icon">
              <!-- Entry -->
              <svg v-if="stage.id === 'entry'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <!-- Discovery -->
              <svg v-else-if="stage.id === 'discovery'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <!-- Results -->
              <svg v-else-if="stage.id === 'results'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              <!-- Item View -->
              <svg v-else-if="stage.id === 'itemView'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <!-- Action -->
              <svg v-else-if="stage.id === 'action'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <!-- Exit -->
              <svg v-else-if="stage.id === 'exit'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>

            <!-- Stage Title -->
            <h4 class="stage-title">{{ $t(`sitemap.journey.stageNames.${stage.id}`) }}</h4>

            <!-- Stage Actions (expanded) -->
            <Transition name="expand">
              <div v-if="activeStage === stage.id" class="stage-actions">
                <div
                  v-for="action in stage.actions"
                  :key="action"
                  class="action-item"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                  {{ $t(`sitemap.journey.actions.${action}`) }}
                </div>
              </div>
            </Transition>

            <!-- Connection Arrow -->
            <div v-if="index < journeyStages.length - 1" class="stage-connector">
              <svg width="40" height="20" viewBox="0 0 40 20">
                <defs>
                  <marker id="arrowhead-journey" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" :fill="stage.color" />
                  </marker>
                </defs>
                <line x1="0" y1="10" x2="35" y2="10" :stroke="stage.color" stroke-width="2" marker-end="url(#arrowhead-journey)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Touchpoints Section -->
    <div class="touchpoints-section">
      <h3 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {{ $t('sitemap.journey.touchpoints') }}
      </h3>

      <div class="touchpoints-grid">
        <div
          v-for="touchpoint in touchpoints"
          :key="touchpoint.id"
          class="touchpoint-card"
        >
          <div class="touchpoint-icon">
            <!-- Hover -->
            <svg v-if="touchpoint.id === 'hover'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
              <path d="M13 13l6 6"/>
            </svg>
            <!-- Click -->
            <svg v-else-if="touchpoint.id === 'click'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 14a8 8 0 0 1-8 8"/>
              <path d="M18 11v-1a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
              <path d="M14 10V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v1"/>
              <path d="M10 9.5V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v10"/>
              <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
            </svg>
            <!-- Filter -->
            <svg v-else-if="touchpoint.id === 'filter'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <!-- Scroll -->
            <svg v-else-if="touchpoint.id === 'scroll'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="6" y="3" width="12" height="18" rx="6"/>
              <line x1="12" y1="7" x2="12" y2="11"/>
            </svg>
          </div>
          <h4 class="touchpoint-title">{{ $t(`sitemap.journey.touchpointNames.${touchpoint.id}`) }}</h4>
          <p class="touchpoint-desc">{{ $t(`sitemap.journey.touchpointDescs.${touchpoint.description}`) }}</p>
        </div>
      </div>
    </div>

    <!-- Flow Visualization -->
    <div class="flow-visualization">
      <h3 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        {{ $t('sitemap.journey.flowVisualization') }}
      </h3>

      <div class="flow-diagram">
        <svg viewBox="0 0 800 300" class="flow-svg">
          <defs>
            <marker id="flow-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#006C35" />
            </marker>
            <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#006C35;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#17A2B8;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#C8A415;stop-opacity:1" />
            </linearGradient>
          </defs>

          <!-- Main Flow Path -->
          <path
            d="M 50 150 Q 150 50 250 150 Q 350 250 450 150 Q 550 50 650 150 Q 700 200 750 150"
            fill="none"
            stroke="url(#flow-gradient)"
            stroke-width="4"
            stroke-linecap="round"
            marker-end="url(#flow-arrow)"
          />

          <!-- Flow Nodes -->
          <g class="flow-nodes">
            <!-- Entry Node -->
            <circle cx="50" cy="150" r="20" fill="#006C35" />
            <text x="50" y="190" text-anchor="middle" fill="#333" font-size="12">{{ $t('sitemap.journey.stageNames.entry') }}</text>

            <!-- Discovery Node -->
            <circle cx="250" cy="150" r="20" fill="#17A2B8" />
            <text x="250" y="190" text-anchor="middle" fill="#333" font-size="12">{{ $t('sitemap.journey.stageNames.discovery') }}</text>

            <!-- Results Node -->
            <circle cx="450" cy="150" r="20" fill="#C8A415" />
            <text x="450" y="190" text-anchor="middle" fill="#333" font-size="12">{{ $t('sitemap.journey.stageNames.results') }}</text>

            <!-- Item View Node -->
            <circle cx="650" cy="150" r="20" fill="#6F42C1" />
            <text x="650" y="190" text-anchor="middle" fill="#333" font-size="12">{{ $t('sitemap.journey.stageNames.itemView') }}</text>

            <!-- Action Node -->
            <circle cx="750" cy="150" r="20" fill="#FD7E14" />
            <text x="750" y="190" text-anchor="middle" fill="#333" font-size="12">{{ $t('sitemap.journey.stageNames.action') }}</text>
          </g>

          <!-- Alternative Paths -->
          <path
            d="M 250 150 Q 350 80 450 150"
            fill="none"
            stroke="#006C35"
            stroke-width="2"
            stroke-dasharray="5,5"
            opacity="0.5"
          />
          <text x="350" y="70" text-anchor="middle" fill="#006C35" font-size="10">{{ $t('sitemap.journey.directBrowse') }}</text>

          <path
            d="M 450 150 Q 550 220 650 150"
            fill="none"
            stroke="#17A2B8"
            stroke-width="2"
            stroke-dasharray="5,5"
            opacity="0.5"
          />
          <text x="550" y="240" text-anchor="middle" fill="#17A2B8" font-size="10">{{ $t('sitemap.journey.refineSearch') }}</text>
        </svg>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.journey-map {
  padding: $spacing-6;

  &.is-rtl {
    direction: rtl;
  }
}

.map-header {
  text-align: center;
  margin-bottom: $spacing-8;
}

.map-title {
  @include heading-2;
  color: $primary-color;
  margin-bottom: $spacing-2;
}

.map-description {
  color: $text-muted;
  font-size: $font-size-base;
}

.section-title {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  @include heading-4;
  color: $text-primary;
  margin-bottom: $spacing-4;
  padding-bottom: $spacing-2;
  border-bottom: 2px solid $primary-color;

  svg {
    color: $primary-color;
  }
}

// Flow Selector
.flow-selector {
  margin-bottom: $spacing-8;
}

.flow-buttons {
  display: flex;
  gap: $spacing-3;
  flex-wrap: wrap;
  margin-bottom: $spacing-4;
}

.flow-btn {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-5;
  background-color: $white;
  border: 2px solid var(--flow-color);
  border-radius: $border-radius-lg;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: var(--flow-color);
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: var(--flow-color);
    color: $white;
  }

  &.is-active {
    background-color: var(--flow-color);
    color: $white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

.flow-description {
  padding: $spacing-4;
  background-color: $bg-secondary;
  border-radius: $border-radius-md;
  border-inline-start: 4px solid $primary-color;
  color: $text-primary;
  font-size: $font-size-sm;
}

// Journey Timeline
.journey-timeline {
  margin-bottom: $spacing-8;
}

.timeline-container {
  position: relative;
  padding: $spacing-8 0;
}

.timeline-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background-color: $border-color-light;
  border-radius: 2px;
  transform: translateY(-50%);
}

.timeline-progress {
  height: 100%;
  background-color: var(--progress-color);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.stages-container {
  display: flex;
  justify-content: space-between;
  gap: $spacing-2;
  position: relative;
  z-index: 1;

  @include media-down('lg') {
    flex-wrap: wrap;
    justify-content: center;
    gap: $spacing-4;
  }
}

.stage-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-4;
  background-color: $white;
  border: 2px solid $border-color;
  border-radius: $border-radius-lg;
  min-width: 120px;
  cursor: pointer;
  transition: $transition-fast;
  opacity: 0.5;

  &.is-in-flow {
    opacity: 1;
    border-color: var(--stage-color);
  }

  &.is-active {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border-color: var(--stage-color);
    background-color: var(--stage-color);

    .stage-icon {
      color: $white;
    }

    .stage-title {
      color: $white;
    }

    .stage-number {
      background-color: $white;
      color: var(--stage-color);
    }
  }

  &:hover:not(.is-active) {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--stage-color);
  }
}

.stage-number {
  position: absolute;
  top: -12px;
  inset-inline-end: -12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--stage-color);
  color: $white;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  border-radius: 50%;
  transition: $transition-fast;
}

.stage-icon {
  color: var(--stage-color);
  margin-bottom: $spacing-2;
  transition: $transition-fast;
}

.stage-title {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
  text-align: center;
  margin: 0;
  transition: $transition-fast;
}

.stage-actions {
  margin-top: $spacing-3;
  padding-top: $spacing-3;
  border-top: 1px solid rgba($white, 0.3);
  width: 100%;
}

.action-item {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-1 0;
  font-size: $font-size-xs;
  color: rgba($white, 0.9);

  svg {
    flex-shrink: 0;
  }
}

.stage-connector {
  position: absolute;
  top: 50%;
  inset-inline-end: -40px;
  transform: translateY(-50%);

  [dir='rtl'] & {
    transform: translateY(-50%) scaleX(-1);
  }

  @include media-down('lg') {
    display: none;
  }
}

// Touchpoints Section
.touchpoints-section {
  margin-bottom: $spacing-8;
}

.touchpoints-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-4;

  @include media-down('md') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include media-down('sm') {
    grid-template-columns: 1fr;
  }
}

.touchpoint-card {
  padding: $spacing-4;
  background-color: $white;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  text-align: center;
  transition: $transition-fast;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: $primary-color;
  }
}

.touchpoint-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 0 auto $spacing-3;
  background-color: rgba($primary-color, 0.1);
  border-radius: 50%;
  color: $primary-color;
}

.touchpoint-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0 0 $spacing-2;
}

.touchpoint-desc {
  font-size: $font-size-sm;
  color: $text-muted;
  margin: 0;
  line-height: 1.5;
}

// Flow Visualization
.flow-visualization {
  margin-bottom: $spacing-8;
}

.flow-diagram {
  background-color: $white;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  padding: $spacing-4;
  overflow-x: auto;
}

.flow-svg {
  width: 100%;
  min-width: 700px;
  height: 300px;
}

// Transitions
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>
