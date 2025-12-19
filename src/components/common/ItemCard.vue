<script setup>
import { ref, computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'

const { formatYear } = useFormatters()

// Default KFNL logo for items without thumbnail
const DEFAULT_THUMBNAIL = '/images/kfnl-logo.png'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  }
})

// Track image load errors to show default
const imageError = ref(false)

// Get thumbnail URL with fallback to KFNL logo
const thumbnailUrl = computed(() => {
  if (imageError.value || !props.item.thumbnail) {
    return DEFAULT_THUMBNAIL
  }
  return props.item.thumbnail
})

function handleImageError() {
  imageError.value = true
}

const typeColors = {
  'رسالة ماجستير': '#006C35',
  'رسالة دكتوراه': '#1B4D3E',
  'بحث علمي': '#17A2B8',
  'كتاب': '#C8A415',
  'مقال': '#6F42C1',
  'default': '#757575'
}

const typeColor = computed(() => {
  return typeColors[props.item.type] || typeColors.default
})

const initials = computed(() => {
  if (!props.item.author) return '?'
  const parts = props.item.author.split(' ')
  if (parts.length >= 2) {
    return parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  }
  return parts[0].charAt(0)
})
</script>

<template>
  <router-link
    :to="`/item/${item.id}`"
    class="item-card"
    :class="{ 'item-card-compact': compact }"
  >
    <!-- Thumbnail with KFNL logo fallback -->
    <div class="item-thumbnail">
      <img
        :src="thumbnailUrl"
        :alt="item.title"
        loading="lazy"
        @error="handleImageError"
        :class="{ 'is-default-logo': !item.thumbnail || imageError }"
      />
    </div>

    <!-- Content -->
    <div class="item-content">
      <!-- Type Badge -->
      <span
        class="item-type"
        :style="{ backgroundColor: typeColor }"
      >
        {{ item.type }}
      </span>

      <!-- Title -->
      <h3 class="item-title">{{ item.title }}</h3>

      <!-- Meta -->
      <div class="item-meta">
        <div class="item-author">
          <span class="author-avatar">{{ initials }}</span>
          <span class="author-name">{{ item.author }}</span>
        </div>
        <span class="item-date">{{ formatYear(item.date) }}</span>
      </div>

      <!-- Collection -->
      <div class="item-collection">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span>{{ item.collection }}</span>
      </div>
    </div>
  </router-link>
</template>

<style lang="scss" scoped>
.item-card {
  @include card;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: all $transition-duration-normal $transition-timing-cubic;
  border: 1px solid $border-color-light;
  position: relative;

  // Subtle gold accent border on top
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, $primary-color, $accent-color, $primary-light);
    opacity: 0;
    transition: opacity $transition-duration-fast ease;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -12px rgba($primary-dark, 0.2),
                0 8px 16px -8px rgba($accent-color, 0.15);
    border-color: transparent;

    &::before {
      opacity: 1;
    }

    .item-title {
      color: $primary-color;
    }

    .item-thumbnail img,
    .thumbnail-placeholder {
      transform: scale(1.08);
    }

    .thumbnail-overlay {
      opacity: 1;
    }

    .author-avatar {
      background-color: $primary-color;
      color: $white;
      transform: scale(1.1);
    }
  }

  &:focus-visible {
    outline: 2px solid $accent-color;
    outline-offset: 2px;
  }
}

// Thumbnail
.item-thumbnail {
  position: relative;
  height: 160px;
  background-color: $bg-secondary;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform $transition-duration-slow $transition-timing-cubic;
  }
}

// Default logo styling
.item-thumbnail img.is-default-logo {
  object-fit: contain;
  padding: $spacing-6;
  background: linear-gradient(145deg, $bg-secondary 0%, $bg-tertiary 50%, rgba($primary-lighter, 0.3) 100%);
}

// Hover overlay on thumbnail
.thumbnail-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba($primary-dark, 0.4) 0%, transparent 50%);
  opacity: 0;
  transition: opacity $transition-duration-normal ease;
  pointer-events: none;
}

// Content
.item-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: $spacing-5;
}

// Type Badge
.item-type {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: $spacing-1 $spacing-3;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  color: $white;
  border-radius: $border-radius-full;
  margin-bottom: $spacing-3;
  box-shadow: 0 2px 8px rgba($black, 0.15);
  letter-spacing: 0.02em;
}

// Title
.item-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  line-height: $line-height-tight;
  margin-bottom: $spacing-3;
  transition: color $transition-duration-fast ease;
  @include truncate(2);
}

// Meta
.item-meta {
  @include flex-between;
  margin-bottom: $spacing-3;
}

.item-author {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  flex: 1;
  min-width: 0;
}

.author-avatar {
  @include flex-center;
  width: 32px;
  height: 32px;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  color: $primary-color;
  background-color: $primary-lighter;
  border-radius: $border-radius-full;
  flex-shrink: 0;
  transition: all $transition-duration-fast ease;
  box-shadow: 0 2px 6px rgba($primary-color, 0.2);
}

.author-name {
  font-size: $font-size-sm;
  color: $text-secondary;
  font-weight: $font-weight-medium;
  @include truncate(1);
}

.item-date {
  font-size: $font-size-sm;
  color: $text-muted;
  flex-shrink: 0;
  margin-inline-start: $spacing-2;
  padding: $spacing-1 $spacing-2;
  background-color: $bg-secondary;
  border-radius: $border-radius-sm;
}

// Collection
.item-collection {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  font-size: $font-size-xs;
  color: $text-muted;
  padding-top: $spacing-3;
  border-top: 1px solid $border-color-light;
  margin-top: auto;

  svg {
    flex-shrink: 0;
    color: $accent-color;
  }

  span {
    @include truncate(1);
  }
}

// Compact Mode
.item-card-compact {
  flex-direction: row;
  gap: $spacing-4;

  &::before {
    width: 3px;
    height: 100%;
    top: 0;
    left: 0;
    right: auto;
    background: linear-gradient(180deg, $primary-color, $accent-color, $primary-light);
  }

  &:hover {
    transform: translateX(-4px);
  }

  .item-thumbnail {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
    border-radius: $border-radius-md;
    overflow: hidden;
  }

  .item-content {
    padding: $spacing-4;
  }

  .item-title {
    font-size: $font-size-sm;
    margin-bottom: $spacing-2;
  }
}
</style>
