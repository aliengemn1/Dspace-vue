<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  maxVisible: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['page-change'])

const visiblePages = computed(() => {
  const pages = []
  const half = Math.floor(props.maxVisible / 2)

  let start = Math.max(1, props.currentPage - half)
  let end = Math.min(props.totalPages, start + props.maxVisible - 1)

  if (end - start + 1 < props.maxVisible) {
    start = Math.max(1, end - props.maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const showFirstEllipsis = computed(() => visiblePages.value[0] > 2)
const showLastEllipsis = computed(() => visiblePages.value[visiblePages.value.length - 1] < props.totalPages - 1)

function goToPage(page) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>

<template>
  <nav class="pagination-wrapper" aria-label="ترقيم الصفحات">
    <ul class="pagination">
      <!-- Previous Button -->
      <li class="pagination-item">
        <button
          class="pagination-btn pagination-prev"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          :aria-label="$t('pagination.previous')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span class="hide-sm-down">{{ $t('pagination.previous') }}</span>
        </button>
      </li>

      <!-- First Page -->
      <li v-if="visiblePages[0] > 1" class="pagination-item">
        <button
          class="pagination-btn"
          @click="goToPage(1)"
        >
          1
        </button>
      </li>

      <!-- First Ellipsis -->
      <li v-if="showFirstEllipsis" class="pagination-item pagination-ellipsis">
        <span>...</span>
      </li>

      <!-- Visible Pages -->
      <li
        v-for="page in visiblePages"
        :key="page"
        class="pagination-item"
        :class="{ 'active': page === currentPage }"
      >
        <button
          class="pagination-btn"
          :aria-current="page === currentPage ? 'page' : undefined"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </li>

      <!-- Last Ellipsis -->
      <li v-if="showLastEllipsis" class="pagination-item pagination-ellipsis">
        <span>...</span>
      </li>

      <!-- Last Page -->
      <li v-if="visiblePages[visiblePages.length - 1] < totalPages" class="pagination-item">
        <button
          class="pagination-btn"
          @click="goToPage(totalPages)"
        >
          {{ totalPages }}
        </button>
      </li>

      <!-- Next Button -->
      <li class="pagination-item">
        <button
          class="pagination-btn pagination-next"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
          :aria-label="$t('pagination.next')"
        >
          <span class="hide-sm-down">{{ $t('pagination.next') }}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: $spacing-6 0;
}

.pagination {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  list-style: none;
  margin: 0;
  padding: 0;
}

.pagination-item {
  &.active .pagination-btn {
    background-color: $primary-color;
    color: $white;
    border-color: $primary-color;
  }
}

.pagination-btn {
  @include flex-center;
  gap: $spacing-1;
  min-width: 40px;
  height: 40px;
  padding: $spacing-2 $spacing-3;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
  background-color: $white;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: $transition-fast;

  &:hover:not(:disabled) {
    background-color: $bg-secondary;
    border-color: $primary-color;
    color: $primary-color;
  }

  &:disabled {
    color: $text-light;
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.pagination-prev,
.pagination-next {
  padding: $spacing-2 $spacing-4;

  @include media-down('sm') {
    min-width: auto;
    padding: $spacing-2;
  }
}

.pagination-prev .icon {
  [dir='rtl'] & {
    transform: rotate(180deg);
  }
}

.pagination-next .icon {
  [dir='rtl'] & {
    transform: rotate(180deg);
  }
}

.pagination-ellipsis {
  color: $text-muted;
  padding: 0 $spacing-2;
}
</style>
