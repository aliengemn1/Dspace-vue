<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  location: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const isExpanded = ref(false)
const currentTip = ref(0)

// Tips for each location
const locationTips = {
  entrance: [
    { title: 'مرحباً بك', titleEn: 'Welcome', content: 'اختر إحدى القاعات لاستكشاف المحتوى الرقمي', contentEn: 'Choose a hall to explore digital content' },
    { title: 'التنقل', titleEn: 'Navigation', content: 'استخدم الخريطة المصغرة للتنقل السريع بين القاعات', contentEn: 'Use the mini map for quick navigation between halls' },
    { title: 'اختصارات لوحة المفاتيح', titleEn: 'Keyboard Shortcuts', content: 'M للخريطة، G للدليل، ESC للرجوع', contentEn: 'M for map, G for guide, ESC to go back' }
  ],
  books: [
    { title: 'قاعة الكتب', titleEn: 'Books Hall', content: 'تضم مجموعة واسعة من الكتب في مختلف المجالات', contentEn: 'Contains a wide collection of books in various fields' },
    { title: 'التصفح', titleEn: 'Browsing', content: 'انقر على أي كتاب لعرض تفاصيله ومحتواه', contentEn: 'Click any book to view its details and content' },
    { title: 'الأقسام', titleEn: 'Sections', content: 'استخدم علامات التبويب للتنقل بين أقسام المكتبة', contentEn: 'Use tabs to navigate between library sections' }
  ],
  theses: [
    { title: 'قاعة الرسائل الجامعية', titleEn: 'Theses Hall', content: 'رسائل الماجستير والدكتوراه من جامعات المملكة', contentEn: 'Master and PhD theses from Saudi universities' },
    { title: 'البحث المتقدم', titleEn: 'Advanced Search', content: 'يمكنك البحث حسب الجامعة أو التخصص أو السنة', contentEn: 'Search by university, major, or year' }
  ],
  periodicals: [
    { title: 'قاعة الدوريات', titleEn: 'Periodicals Hall', content: 'المجلات العلمية والصحف والنشرات الدورية', contentEn: 'Scientific journals, newspapers, and periodicals' },
    { title: 'الأرشيف', titleEn: 'Archive', content: 'أعداد تاريخية تعود لعقود من الزمن', contentEn: 'Historical issues dating back decades' }
  ],
  manuscripts: [
    { title: 'قاعة المخطوطات', titleEn: 'Manuscripts Hall', content: 'كنوز من المخطوطات الإسلامية والتاريخية النادرة', contentEn: 'Treasures of rare Islamic and historical manuscripts' },
    { title: 'المشاهدة عالية الدقة', titleEn: 'High Resolution Viewing', content: 'يمكنك تكبير الصور لرؤية تفاصيل الخط والزخارف', contentEn: 'Zoom in to see calligraphy and decoration details' }
  ],
  media: [
    { title: 'قاعة الوسائط', titleEn: 'Media Hall', content: 'صور وخرائط وتسجيلات صوتية ومرئية', contentEn: 'Images, maps, audio and video recordings' },
    { title: 'التشغيل المباشر', titleEn: 'Direct Playback', content: 'استمع وشاهد المحتوى مباشرة داخل الجولة', contentEn: 'Listen and watch content directly within the tour' }
  ]
}

const tips = computed(() => {
  return locationTips[props.location.id] || locationTips.entrance
})

const currentTipData = computed(() => {
  return tips.value[currentTip.value]
})

function nextTip() {
  currentTip.value = (currentTip.value + 1) % tips.value.length
}

function prevTip() {
  currentTip.value = (currentTip.value - 1 + tips.value.length) % tips.value.length
}

watch(() => props.location.id, () => {
  currentTip.value = 0
})
</script>

<template>
  <div class="tour-guide" :class="{ expanded: isExpanded }">
    <div class="guide-header">
      <div class="guide-avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <span class="guide-label">{{ t('virtualTour.guide') }}</span>
      <div class="guide-actions">
        <button class="action-btn" @click="isExpanded = !isExpanded">
          <svg v-if="!isExpanded" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <button class="action-btn close" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="guide-content">
      <div class="tip-card">
        <h4 class="tip-title">{{ currentTipData.title }}</h4>
        <p class="tip-title-en">{{ currentTipData.titleEn }}</p>
        <p class="tip-content">{{ currentTipData.content }}</p>
        <p class="tip-content-en">{{ currentTipData.contentEn }}</p>
      </div>

      <div class="tip-navigation" v-if="tips.length > 1">
        <button class="nav-btn" @click="prevTip">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="tip-dots">
          <span
            v-for="(_, index) in tips"
            :key="index"
            class="dot"
            :class="{ active: index === currentTip }"
            @click="currentTip = index"
          />
        </div>
        <button class="nav-btn" @click="nextTip">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="isExpanded" class="guide-extended">
      <h5 class="extended-title">{{ t('virtualTour.allTips') }}</h5>
      <ul class="tips-list">
        <li
          v-for="(tip, index) in tips"
          :key="index"
          class="tip-item"
          :class="{ active: index === currentTip }"
          @click="currentTip = index"
        >
          <span class="tip-number">{{ index + 1 }}</span>
          <span class="tip-text">{{ tip.title }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tour-guide {
  position: fixed;
  top: 50%;
  right: $spacing-6;
  transform: translateY(-50%);
  width: 280px;
  background: rgba($gray-900, 0.95);
  border: 1px solid $gray-700;
  border-radius: $border-radius-lg;
  backdrop-filter: blur(10px);
  overflow: hidden;
  z-index: 60;
  transition: all 0.3s ease;

  &.expanded {
    width: 320px;
  }
}

.guide-header {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3 $spacing-4;
  background: linear-gradient(90deg, rgba($primary-color, 0.2) 0%, transparent 100%);
  border-bottom: 1px solid $gray-700;
}

.guide-avatar {
  @include flex-center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, $primary-color, $accent-color);
  border-radius: $border-radius-full;
  color: $white;
}

.guide-label {
  flex: 1;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $white;
}

.guide-actions {
  display: flex;
  gap: $spacing-1;
}

.action-btn {
  @include flex-center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  color: $gray-400;
  cursor: pointer;
  border-radius: $border-radius-sm;
  transition: $transition-fast;

  &:hover {
    background: $gray-700;
    color: $white;
  }

  &.close:hover {
    background: rgba($error-color, 0.2);
    color: $error-color;
  }
}

.guide-content {
  padding: $spacing-4;
}

.tip-card {
  padding: $spacing-4;
  background: rgba($gray-800, 0.5);
  border: 1px solid $gray-700;
  border-radius: $border-radius-md;
  margin-bottom: $spacing-4;
}

.tip-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $accent-color;
  margin-bottom: $spacing-1;
}

.tip-title-en {
  font-size: $font-size-xs;
  color: $gray-500;
  margin-bottom: $spacing-3;
}

.tip-content {
  font-size: $font-size-sm;
  color: $gray-200;
  line-height: $line-height-relaxed;
  margin-bottom: $spacing-1;
}

.tip-content-en {
  font-size: $font-size-xs;
  color: $gray-500;
  line-height: $line-height-relaxed;
}

.tip-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-3;
}

.nav-btn {
  @include flex-center;
  width: 32px;
  height: 32px;
  background: $gray-800;
  border: 1px solid $gray-600;
  border-radius: $border-radius-full;
  color: $gray-300;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background: $gray-700;
    border-color: $accent-color;
    color: $white;
  }
}

.tip-dots {
  display: flex;
  gap: $spacing-2;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: $gray-600;
  border-radius: 50%;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: $gray-500;
  }

  &.active {
    background-color: $accent-color;
    width: 20px;
    border-radius: 4px;
  }
}

.guide-extended {
  padding: $spacing-4;
  border-top: 1px solid $gray-700;
  background: rgba($gray-800, 0.3);
}

.extended-title {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  color: $gray-400;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: $spacing-3;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-2;
  border-radius: $border-radius-sm;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background: rgba($gray-700, 0.5);
  }

  &.active {
    background: rgba($accent-color, 0.1);

    .tip-number {
      background: $accent-color;
      color: $primary-dark;
    }

    .tip-text {
      color: $white;
    }
  }
}

.tip-number {
  @include flex-center;
  width: 22px;
  height: 22px;
  background: $gray-700;
  border-radius: $border-radius-full;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  color: $gray-400;
  flex-shrink: 0;
}

.tip-text {
  font-size: $font-size-sm;
  color: $gray-300;
}

@include media-down('md') {
  .tour-guide {
    top: auto;
    bottom: $spacing-20;
    right: $spacing-4;
    transform: none;
    width: 260px;

    &.expanded {
      width: 280px;
    }
  }
}
</style>
