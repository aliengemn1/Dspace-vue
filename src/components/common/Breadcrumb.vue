<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <nav class="breadcrumb" aria-label="مسار التنقل">
    <ol class="breadcrumb-list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="breadcrumb-item"
        :class="{ 'active': index === items.length - 1 }"
      >
        <router-link
          v-if="item.path && index !== items.length - 1"
          :to="item.path"
          class="breadcrumb-link"
        >
          {{ item.label }}
        </router-link>
        <span v-else class="breadcrumb-text">{{ item.label }}</span>

        <span v-if="index < items.length - 1" class="breadcrumb-separator" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </span>
      </li>
    </ol>
  </nav>
</template>

<style lang="scss" scoped>
.breadcrumb {
  padding: $spacing-2 0;
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: $font-size-sm;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  color: $text-muted;
  text-decoration: none;
  transition: color $transition-duration-fast ease;

  &:hover {
    color: $primary-color;
  }
}

.breadcrumb-text {
  color: $text-primary;
  font-weight: $font-weight-medium;
}

.breadcrumb-separator {
  display: flex;
  margin-inline: $spacing-2;
  color: $text-light;

  [dir='rtl'] & {
    transform: rotate(180deg);
  }
}

.breadcrumb-item.active {
  .breadcrumb-text {
    color: $text-primary;
  }
}
</style>
