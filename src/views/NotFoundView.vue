<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="not-found-view">
    <div class="container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1 class="error-title">{{ $t('errors.404.title') }}</h1>
        <p class="error-description">{{ $t('errors.404.description') }}</p>
        <div class="error-actions">
          <button class="btn btn-primary btn-lg" @click="goHome">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {{ $t('errors.404.backHome') }}
          </button>
          <button class="btn btn-secondary btn-lg" @click="goBack">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            {{ $t('common.back') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $primary-lighter 0%, $bg-secondary 100%);
}

.not-found-content {
  text-align: center;
  padding: $spacing-8;
}

.error-code {
  font-size: 150px;
  font-weight: $font-weight-bold;
  line-height: 1;
  color: $primary-color;
  opacity: 0.2;
  margin-bottom: $spacing-4;

  @include media-down('md') {
    font-size: 100px;
  }
}

.error-title {
  @include heading-1;
  margin-bottom: $spacing-4;
}

.error-description {
  font-size: $font-size-lg;
  color: $text-muted;
  max-width: 500px;
  margin: 0 auto $spacing-8;
}

.error-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: $spacing-4;
}
</style>
