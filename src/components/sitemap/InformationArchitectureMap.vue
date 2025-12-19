<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const isRtl = computed(() => locale.value === 'ar')

// Main sections of the repository
const mainSections = ref([
  {
    id: 'home',
    icon: 'home',
    color: '#006C35',
    children: ['search', 'browse', 'collections', 'stats', 'about']
  },
  {
    id: 'search',
    icon: 'search',
    color: '#17A2B8',
    children: ['results', 'advanced']
  },
  {
    id: 'browse',
    icon: 'grid',
    color: '#C8A415',
    children: ['bySubject', 'byAuthor', 'byYear', 'byType', 'byLanguage']
  },
  {
    id: 'collections',
    icon: 'folder',
    color: '#6F42C1',
    children: ['books', 'periodicals', 'theses', 'manuscripts', 'newspapers', 'maps', 'media']
  },
  {
    id: 'legalDeposit',
    icon: 'shield',
    color: '#1B4D3E',
    children: ['submission', 'tracking', 'guidelines']
  },
  {
    id: 'stats',
    icon: 'chart',
    color: '#FD7E14',
    children: ['views', 'downloads', 'reports']
  },
  {
    id: 'about',
    icon: 'info',
    color: '#757575',
    children: ['mission', 'policies', 'contact', 'help']
  }
])

// Item page components
const itemPageComponents = ref([
  { id: 'metadata', icon: 'file-text', color: '#006C35' },
  { id: 'preview', icon: 'eye', color: '#17A2B8' },
  { id: 'download', icon: 'download', color: '#C8A415' },
  { id: 'stats', icon: 'chart', color: '#FD7E14' },
  { id: 'identifiers', icon: 'link', color: '#6F42C1' },
  { id: 'citation', icon: 'quote', color: '#1B4D3E' },
  { id: 'related', icon: 'grid', color: '#757575' }
])

// Preview types
const previewTypes = ref([
  { id: 'pdf', icon: 'file-pdf', label: 'PDF Viewer' },
  { id: 'image', icon: 'image', label: 'Image Slider' },
  { id: 'audio', icon: 'headphones', label: 'Audio Player' },
  { id: 'video', icon: 'video', label: 'Video Player' }
])

// User types
const userTypes = ref([
  { id: 'researcher', icon: 'graduation', color: '#006C35' },
  { id: 'student', icon: 'book', color: '#17A2B8' },
  { id: 'staff', icon: 'briefcase', color: '#C8A415' },
  { id: 'public', icon: 'users', color: '#6F42C1' },
  { id: 'publisher', icon: 'building', color: '#1B4D3E' }
])

const activeSection = ref(null)

function setActiveSection(sectionId) {
  activeSection.value = activeSection.value === sectionId ? null : sectionId
}

function getSectionColor(sectionId) {
  const section = mainSections.value.find(s => s.id === sectionId)
  return section ? section.color : '#006C35'
}
</script>

<template>
  <div class="ia-map" :class="{ 'is-rtl': isRtl }">
    <!-- Map Header -->
    <div class="map-header">
      <h2 class="map-title">{{ $t('sitemap.iaMap.title') }}</h2>
      <p class="map-description">{{ $t('sitemap.iaMap.description') }}</p>
    </div>

    <!-- User Types Section -->
    <div class="user-types-section">
      <h3 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        {{ $t('sitemap.iaMap.userTypes') }}
      </h3>
      <div class="user-types-grid">
        <div
          v-for="user in userTypes"
          :key="user.id"
          class="user-type-card"
          :style="{ '--user-color': user.color }"
        >
          <div class="user-icon">
            <!-- Researcher -->
            <svg v-if="user.id === 'researcher'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <!-- Student -->
            <svg v-else-if="user.id === 'student'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <!-- Staff -->
            <svg v-else-if="user.id === 'staff'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            <!-- Public -->
            <svg v-else-if="user.id === 'public'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <!-- Publisher -->
            <svg v-else-if="user.id === 'publisher'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
              <path d="M9 22v-4h6v4"/>
              <path d="M8 6h.01"/>
              <path d="M16 6h.01"/>
              <path d="M12 6h.01"/>
              <path d="M12 10h.01"/>
              <path d="M12 14h.01"/>
              <path d="M16 10h.01"/>
              <path d="M16 14h.01"/>
              <path d="M8 10h.01"/>
              <path d="M8 14h.01"/>
            </svg>
          </div>
          <span class="user-label">{{ $t(`sitemap.iaMap.users.${user.id}`) }}</span>
        </div>
      </div>
    </div>

    <!-- Main Architecture Diagram -->
    <div class="architecture-section">
      <h3 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        {{ $t('sitemap.iaMap.mainSections') }}
      </h3>

      <div class="architecture-diagram">
        <!-- Central Hub - Home -->
        <div class="central-hub">
          <div class="hub-circle" :style="{ '--hub-color': '#006C35' }">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>{{ $t('sitemap.iaMap.sections.home') }}</span>
          </div>
        </div>

        <!-- Radial Sections -->
        <div class="radial-sections">
          <div
            v-for="(section, index) in mainSections.slice(1)"
            :key="section.id"
            class="radial-section"
            :class="{ 'is-active': activeSection === section.id }"
            :style="{
              '--section-color': section.color,
              '--section-angle': `${(index * 60) - 90}deg`
            }"
            @click="setActiveSection(section.id)"
          >
            <div class="section-node">
              <!-- Search -->
              <svg v-if="section.id === 'search'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <!-- Browse -->
              <svg v-else-if="section.id === 'browse'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <!-- Collections -->
              <svg v-else-if="section.id === 'collections'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <!-- Legal Deposit -->
              <svg v-else-if="section.id === 'legalDeposit'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <!-- Stats -->
              <svg v-else-if="section.id === 'stats'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              <!-- About -->
              <svg v-else-if="section.id === 'about'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span class="node-label">{{ $t(`sitemap.iaMap.sections.${section.id}`) }}</span>
            </div>

            <!-- Sub-sections -->
            <Transition name="expand">
              <div v-if="activeSection === section.id" class="sub-sections">
                <div
                  v-for="child in section.children"
                  :key="child"
                  class="sub-section-item"
                >
                  {{ $t(`sitemap.iaMap.subsections.${child}`) }}
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Connection Lines (SVG) -->
        <svg class="connection-lines" viewBox="0 0 600 400">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#006C35" />
            </marker>
          </defs>
          <!-- Lines from center to sections -->
          <line x1="300" y1="200" x2="300" y2="80" stroke="#006C35" stroke-width="2" stroke-dasharray="5,5" />
          <line x1="300" y1="200" x2="450" y2="120" stroke="#17A2B8" stroke-width="2" stroke-dasharray="5,5" />
          <line x1="300" y1="200" x2="500" y2="200" stroke="#C8A415" stroke-width="2" stroke-dasharray="5,5" />
          <line x1="300" y1="200" x2="450" y2="280" stroke="#6F42C1" stroke-width="2" stroke-dasharray="5,5" />
          <line x1="300" y1="200" x2="300" y2="320" stroke="#1B4D3E" stroke-width="2" stroke-dasharray="5,5" />
          <line x1="300" y1="200" x2="150" y2="280" stroke="#FD7E14" stroke-width="2" stroke-dasharray="5,5" />
          <line x1="300" y1="200" x2="100" y2="200" stroke="#757575" stroke-width="2" stroke-dasharray="5,5" />
        </svg>
      </div>
    </div>

    <!-- Item Page Structure -->
    <div class="item-page-section">
      <h3 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        {{ $t('sitemap.iaMap.itemPage') }}
      </h3>

      <div class="item-page-diagram">
        <!-- Item Page Components -->
        <div class="item-components">
          <div
            v-for="comp in itemPageComponents"
            :key="comp.id"
            class="item-component"
            :style="{ '--comp-color': comp.color }"
          >
            <!-- Metadata -->
            <svg v-if="comp.id === 'metadata'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <!-- Preview -->
            <svg v-else-if="comp.id === 'preview'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <!-- Download -->
            <svg v-else-if="comp.id === 'download'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <!-- Stats -->
            <svg v-else-if="comp.id === 'stats'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <!-- Identifiers -->
            <svg v-else-if="comp.id === 'identifiers'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <!-- Citation -->
            <svg v-else-if="comp.id === 'citation'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z"/>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
            </svg>
            <!-- Related -->
            <svg v-else-if="comp.id === 'related'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>{{ $t(`sitemap.iaMap.itemComponents.${comp.id}`) }}</span>
          </div>
        </div>

        <!-- Preview Types -->
        <div class="preview-types">
          <h4 class="preview-title">{{ $t('sitemap.iaMap.previewTypes') }}</h4>
          <div class="preview-types-grid">
            <div
              v-for="preview in previewTypes"
              :key="preview.id"
              class="preview-type"
            >
              <!-- PDF -->
              <svg v-if="preview.id === 'pdf'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <!-- Image -->
              <svg v-else-if="preview.id === 'image'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <!-- Audio -->
              <svg v-else-if="preview.id === 'audio'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
              </svg>
              <!-- Video -->
              <svg v-else-if="preview.id === 'video'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              <span>{{ preview.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Collections Grid -->
    <div class="collections-section">
      <h3 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        {{ $t('sitemap.iaMap.digitalCollections') }}
      </h3>

      <div class="collections-grid">
        <div class="collection-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span>{{ $t('sitemap.iaMap.collections.books') }}</span>
        </div>
        <div class="collection-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            <line x1="8" y1="6" x2="16" y2="6"/>
            <line x1="8" y1="10" x2="16" y2="10"/>
          </svg>
          <span>{{ $t('sitemap.iaMap.collections.periodicals') }}</span>
        </div>
        <div class="collection-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
          <span>{{ $t('sitemap.iaMap.collections.theses') }}</span>
        </div>
        <div class="collection-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="M10 13a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/>
            <path d="M10 17h4"/>
          </svg>
          <span>{{ $t('sitemap.iaMap.collections.manuscripts') }}</span>
        </div>
        <div class="collection-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
            <path d="M18 14h-8"/>
            <path d="M15 18h-5"/>
            <path d="M10 6h8v4h-8V6Z"/>
          </svg>
          <span>{{ $t('sitemap.iaMap.collections.newspapers') }}</span>
        </div>
        <div class="collection-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            <line x1="8" y1="2" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
          <span>{{ $t('sitemap.iaMap.collections.maps') }}</span>
        </div>
        <div class="collection-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>{{ $t('sitemap.iaMap.collections.media') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ia-map {
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

// User Types Section
.user-types-section {
  margin-bottom: $spacing-8;
}

.user-types-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: $spacing-4;

  @include media-down('lg') {
    grid-template-columns: repeat(3, 1fr);
  }

  @include media-down('sm') {
    grid-template-columns: repeat(2, 1fr);
  }
}

.user-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-4;
  background-color: $white;
  border: 2px solid var(--user-color);
  border-radius: $border-radius-lg;
  transition: $transition-fast;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    background-color: var(--user-color);

    .user-icon {
      color: $white;
    }

    .user-label {
      color: $white;
    }
  }
}

.user-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: var(--user-color);
  transition: $transition-fast;
}

.user-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
  text-align: center;
  transition: $transition-fast;
}

// Architecture Section
.architecture-section {
  margin-bottom: $spacing-8;
}

.architecture-diagram {
  position: relative;
  min-height: 500px;
  background: linear-gradient(135deg, rgba($primary-color, 0.02) 0%, rgba($accent-color, 0.02) 100%);
  border: 1px solid $border-color-light;
  border-radius: $border-radius-xl;
  padding: $spacing-8;
  overflow: hidden;
}

.central-hub {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.hub-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background-color: var(--hub-color);
  border-radius: 50%;
  color: $white;
  font-weight: $font-weight-bold;
  box-shadow: 0 8px 24px rgba(0, 108, 53, 0.3);

  span {
    font-size: $font-size-sm;
    margin-top: $spacing-1;
  }
}

.radial-sections {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.radial-section {
  position: absolute;
  top: 50%;
  left: 50%;
  cursor: pointer;
  transition: $transition-fast;

  &:nth-child(1) { transform: translate(-50%, -250%); }
  &:nth-child(2) { transform: translate(100%, -150%); }
  &:nth-child(3) { transform: translate(150%, -50%); }
  &:nth-child(4) { transform: translate(100%, 50%); }
  &:nth-child(5) { transform: translate(-50%, 100%); }
  &:nth-child(6) { transform: translate(-200%, 50%); }

  &.is-active {
    .section-node {
      transform: scale(1.1);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
  }
}

.section-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background-color: $white;
  border: 3px solid var(--section-color);
  border-radius: $border-radius-lg;
  color: var(--section-color);
  transition: $transition-fast;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.05);
    background-color: var(--section-color);
    color: $white;
  }
}

.node-label {
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  margin-top: $spacing-1;
  text-align: center;
}

.sub-sections {
  position: absolute;
  top: 110%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 150px;
  background-color: $white;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  box-shadow: $shadow-lg;
  padding: $spacing-2;
  z-index: 20;
}

.sub-section-item {
  padding: $spacing-2 $spacing-3;
  font-size: $font-size-sm;
  color: $text-primary;
  border-radius: $border-radius-sm;
  white-space: nowrap;

  &:hover {
    background-color: $bg-secondary;
    color: $primary-color;
  }
}

.connection-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.5;
}

// Item Page Section
.item-page-section {
  margin-bottom: $spacing-8;
}

.item-page-diagram {
  background-color: $bg-secondary;
  border-radius: $border-radius-lg;
  padding: $spacing-6;
}

.item-components {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: $spacing-3;
  margin-bottom: $spacing-6;

  @include media-down('lg') {
    grid-template-columns: repeat(4, 1fr);
  }

  @include media-down('sm') {
    grid-template-columns: repeat(2, 1fr);
  }
}

.item-component {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-4;
  background-color: $white;
  border-radius: $border-radius-md;
  border-inline-start: 4px solid var(--comp-color);
  transition: $transition-fast;

  svg {
    color: var(--comp-color);
  }

  span {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $text-primary;
    text-align: center;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.preview-types {
  background-color: $white;
  border-radius: $border-radius-md;
  padding: $spacing-4;
}

.preview-title {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-3;
}

.preview-types-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-3;

  @include media-down('sm') {
    grid-template-columns: repeat(2, 1fr);
  }
}

.preview-type {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-3;
  background-color: $bg-secondary;
  border-radius: $border-radius-md;
  font-size: $font-size-sm;
  color: $text-primary;

  svg {
    color: $primary-color;
  }
}

// Collections Section
.collections-section {
  margin-bottom: $spacing-8;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: $spacing-4;

  @include media-down('lg') {
    grid-template-columns: repeat(4, 1fr);
  }

  @include media-down('sm') {
    grid-template-columns: repeat(2, 1fr);
  }
}

.collection-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-4;
  background: linear-gradient(135deg, $white 0%, $bg-secondary 100%);
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  transition: $transition-fast;

  svg {
    color: $primary-color;
  }

  span {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
    text-align: center;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: $primary-color;

    svg {
      color: $accent-color;
    }
  }
}

// Transitions
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}
</style>
