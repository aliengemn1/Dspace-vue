<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { sanitizeSearchQuery } from '@/utils/security'

const { t } = useI18n()

const props = defineProps({
  placeholder: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    default: ''
  },
  compact: {
    type: Boolean,
    default: false
  },
  autofocus: {
    type: Boolean,
    default: false
  },
  showAdvanced: {
    type: Boolean,
    default: false
  },
  showCategories: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'advanced', 'categoryChange'])

const searchInput = ref(null)
const query = ref(props.modelValue)
const selectedCategory = ref('general')
const isCategoryOpen = ref(false)

// Search categories - DSpace facet-based search options
const categories = computed(() => [
  { id: 'general', label: t('search.categories.general'), icon: 'search', field: '*' },
  { id: 'title', label: t('search.categories.title'), icon: 'file-text', field: 'dc.title' },
  { id: 'author', label: t('search.categories.author'), icon: 'user', field: 'dc.contributor.author' },
  { id: 'subject', label: t('search.categories.subject'), icon: 'tag', field: 'dc.subject' },
  { id: 'publisher', label: t('search.categories.publisher'), icon: 'building', field: 'dc.publisher' },
  { id: 'date', label: t('search.categories.date'), icon: 'calendar', field: 'dc.date.issued' }
])

const selectedCategoryLabel = computed(() => {
  const cat = categories.value.find(c => c.id === selectedCategory.value)
  return cat ? cat.label : t('search.categories.general')
})

// Get selected category field for DSpace query
const selectedCategoryField = computed(() => {
  const cat = categories.value.find(c => c.id === selectedCategory.value)
  return cat ? cat.field : '*'
})

function handleInput(event) {
  query.value = event.target.value
  emit('update:modelValue', query.value)
}

function handleSubmit() {
  const sanitizedQuery = sanitizeSearchQuery(query.value)
  const category = categories.value.find(c => c.id === selectedCategory.value)
  emit('search', sanitizedQuery, selectedCategory.value, category?.field || '*')
}

function handleKeydown(event) {
  if (event.key === 'Enter') {
    handleSubmit()
  }
}

function clearSearch() {
  query.value = ''
  emit('update:modelValue', '')
  searchInput.value?.focus()
}

function toggleCategory() {
  isCategoryOpen.value = !isCategoryOpen.value
}

function selectCategory(categoryId) {
  selectedCategory.value = categoryId
  isCategoryOpen.value = false
  const category = categories.value.find(c => c.id === categoryId)
  emit('categoryChange', categoryId, category?.field || '*')
}

function closeCategoryDropdown(event) {
  if (!event.target.closest('.category-dropdown')) {
    isCategoryOpen.value = false
  }
}

onMounted(() => {
  if (props.autofocus && searchInput.value) {
    searchInput.value.focus()
  }
  document.addEventListener('click', closeCategoryDropdown)
})
</script>

<template>
  <div class="search-box" :class="{ 'search-box-compact': compact, 'has-categories': showCategories }">
    <div class="search-input-wrapper">
      <!-- Category Dropdown -->
      <div v-if="showCategories" class="category-dropdown" :class="{ 'is-open': isCategoryOpen }">
        <button
          type="button"
          class="category-toggle"
          @click="toggleCategory"
          :aria-expanded="isCategoryOpen"
          :aria-label="$t('search.selectCategory')"
        >
          <span class="category-label">{{ selectedCategoryLabel }}</span>
          <svg class="category-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <Transition name="dropdown">
          <div v-if="isCategoryOpen" class="category-menu">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              class="category-option"
              :class="{ 'is-selected': cat.id === selectedCategory }"
              @click="selectCategory(cat.id)"
            >
              {{ cat.label }}
            </button>
          </div>
        </Transition>
      </div>

      <span class="search-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </span>
      <input
        ref="searchInput"
        type="search"
        class="search-input"
        :placeholder="placeholder"
        :value="query"
        @input="handleInput"
        @keydown="handleKeydown"
        :aria-label="placeholder"
      />
      <button
        v-if="query"
        type="button"
        class="clear-btn"
        @click="clearSearch"
        :aria-label="$t('search.clear')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <button
        type="button"
        class="search-btn"
        @click="handleSubmit"
        :aria-label="$t('search.submit')"
      >
        <span class="btn-text hide-sm-down">{{ $t('search.button') }}</span>
        <svg class="btn-icon hide-sm-up" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
    <button
      v-if="showAdvanced"
      type="button"
      class="advanced-link"
      @click="$emit('advanced')"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="14"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
      <span>{{ $t('search.advanced') }}</span>
      <svg class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.search-box {
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: $white;
  border: 2px solid $border-color;
  border-radius: $border-radius-xl;
  transition: $transition-fast;
  min-height: 56px;

  &:focus-within {
    border-color: $primary-color;
    box-shadow: 0 0 0 4px rgba($primary-color, 0.15);
  }
}

.search-icon {
  position: absolute;
  inset-inline-start: $spacing-5;
  top: 50%;
  transform: translateY(-50%);
  color: $primary-color;
  pointer-events: none;
  display: flex;

  svg {
    width: 24px;
    height: 24px;
  }
}

.search-input {
  flex: 1;
  width: 100%;
  padding: $spacing-4 $spacing-5;
  padding-inline-start: calc($spacing-12 + $spacing-2);
  padding-inline-end: calc($spacing-20 + $spacing-4);
  font-family: inherit;
  font-size: $font-size-lg;
  color: $text-primary;
  background-color: transparent;
  border: none;
  outline: none;

  &::placeholder {
    color: $text-light;
    font-size: $font-size-base;
  }

  // إخفاء أيقونة المسح الافتراضية
  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration {
    -webkit-appearance: none;
    appearance: none;
  }
}

.clear-btn {
  position: absolute;
  inset-inline-end: 60px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: $gray-200;
  border: none;
  border-radius: $border-radius-full;
  color: $text-muted;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: $gray-300;
    color: $text-primary;
  }
}

.search-btn {
  position: absolute;
  inset-inline-end: $spacing-2;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-3 $spacing-6;
  min-height: 44px;
  background-color: $primary-color;
  border: none;
  border-radius: $border-radius-lg;
  color: $white;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: $transition-fast;
  gap: $spacing-2;

  &:hover {
    background-color: $primary-dark;
    transform: translateY(-50%) scale(1.02);
  }

  .btn-icon {
    display: flex;
  }
}

.advanced-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  margin-top: $spacing-4;
  padding: $spacing-3 $spacing-6;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $white;
  background: linear-gradient(135deg, rgba($accent-color, 0.9) 0%, rgba($accent-dark, 0.95) 100%);
  border: 2px solid rgba($accent-light, 0.5);
  border-radius: $border-radius-full;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba($accent-color, 0.3);
  backdrop-filter: blur(4px);

  .arrow-icon {
    transition: transform 0.3s ease;

    [dir='rtl'] & {
      transform: rotate(180deg);
    }
  }

  &:hover {
    background: linear-gradient(135deg, $accent-color 0%, $accent-dark 100%);
    border-color: $accent-light;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba($accent-color, 0.4);

    .arrow-icon {
      transform: translateX(4px);

      [dir='rtl'] & {
        transform: translateX(-4px) rotate(180deg);
      }
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba($accent-color, 0.3);
  }
}

// Category Dropdown
.category-dropdown {
  position: relative;
  flex-shrink: 0;
  border-inline-end: 1px solid $border-color;
}

.category-toggle {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
  background: none;
  border: none;
  font-family: inherit;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
  cursor: pointer;
  transition: $transition-fast;
  white-space: nowrap;

  &:hover {
    background-color: rgba($primary-color, 0.05);
  }

  .category-arrow {
    transition: transform $transition-duration-fast ease;
  }
}

.category-dropdown.is-open {
  .category-toggle {
    background-color: rgba($primary-color, 0.1);
  }

  .category-arrow {
    transform: rotate(180deg);
  }
}

.category-menu {
  position: absolute;
  top: 100%;
  inset-inline-start: 0;
  min-width: 180px;
  background-color: $white;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  box-shadow: $shadow-lg;
  z-index: $z-index-dropdown;
  margin-top: $spacing-1;
  padding: $spacing-1;
}

.category-option {
  display: block;
  width: 100%;
  padding: $spacing-2 $spacing-3;
  background: none;
  border: none;
  font-family: inherit;
  font-size: $font-size-sm;
  color: $text-primary;
  text-align: start;
  cursor: pointer;
  border-radius: $border-radius-sm;
  transition: $transition-fast;

  &:hover {
    background-color: $bg-secondary;
  }

  &.is-selected {
    background-color: $primary-lighter;
    color: $primary-color;
    font-weight: $font-weight-medium;
  }
}

// Dropdown transition
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all $transition-duration-fast ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

// Has categories mode - adjust input padding
.has-categories {
  .search-icon {
    position: static;
    transform: none;
    padding-inline-start: $spacing-3;
  }

  .search-input {
    padding-inline-start: $spacing-2;
  }
}

// Compact mode
.search-box-compact {
  .search-input-wrapper {
    border-radius: $border-radius-md;
  }

  .search-input {
    padding: $spacing-2 $spacing-3;
    padding-inline-start: $spacing-10;
    padding-inline-end: $spacing-16;
    font-size: $font-size-sm;
  }

  .search-icon {
    inset-inline-start: $spacing-3;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .clear-btn {
    inset-inline-end: 44px;
    width: 24px;
    height: 24px;
  }

  .search-btn {
    padding: $spacing-1 $spacing-3;
    min-height: 32px;
    font-size: $font-size-sm;
  }

  .category-toggle {
    padding: $spacing-2 $spacing-3;
  }
}
</style>
