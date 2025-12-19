<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '@/components/common/Breadcrumb.vue'

const { t } = useI18n()

const breadcrumbItems = computed(() => [
  { label: t('nav.home'), path: '/' },
  { label: t('nav.contact'), path: null }
])

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)
const isSubmitted = ref(false)
const error = ref(null)

async function handleSubmit() {
  isSubmitting.value = true
  error.value = null

  try {
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    isSubmitted.value = true
    form.value = { name: '', email: '', subject: '', message: '' }
  } catch (err) {
    error.value = 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="contact-view">
    <!-- Breadcrumb -->
    <div class="breadcrumb-section">
      <div class="container">
        <Breadcrumb :items="breadcrumbItems" />
      </div>
    </div>

    <!-- Header -->
    <div class="contact-header">
      <div class="container">
        <h1 class="page-title">{{ $t('nav.contact') }}</h1>
        <p class="page-description">
          نسعد بتواصلكم معنا للاستفسارات والاقتراحات
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="contact-content">
      <div class="container">
        <div class="content-grid">
          <!-- Contact Form -->
          <main class="main-content">
            <div class="card form-card">
              <h2 class="card-title">أرسل لنا رسالة</h2>

              <!-- Success Message -->
              <div v-if="isSubmitted" class="alert alert-success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <div>
                  <strong>تم إرسال رسالتك بنجاح!</strong>
                  <p>سنقوم بالرد عليك في أقرب وقت ممكن.</p>
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="alert alert-error">
                {{ error }}
              </div>

              <!-- Form -->
              <form v-if="!isSubmitted" @submit.prevent="handleSubmit" class="contact-form">
                <div class="form-group">
                  <label for="name" class="form-label">
                    الاسم <span class="required">*</span>
                  </label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="email" class="form-label">
                    البريد الإلكتروني <span class="required">*</span>
                  </label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="form-control"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="subject" class="form-label">
                    الموضوع <span class="required">*</span>
                  </label>
                  <input
                    id="subject"
                    v-model="form.subject"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="message" class="form-label">
                    الرسالة <span class="required">*</span>
                  </label>
                  <textarea
                    id="message"
                    v-model="form.message"
                    class="form-control form-textarea"
                    rows="5"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary btn-lg"
                  :disabled="isSubmitting"
                >
                  <span v-if="isSubmitting" class="spinner spinner-sm"></span>
                  {{ isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة' }}
                </button>
              </form>

              <!-- Send Another -->
              <button
                v-else
                class="btn btn-secondary"
                @click="isSubmitted = false"
              >
                إرسال رسالة أخرى
              </button>
            </div>
          </main>

          <!-- Contact Info -->
          <aside class="sidebar">
            <div class="card info-card">
              <h3 class="card-title">معلومات التواصل</h3>

              <div class="info-item">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div class="info-content">
                  <h4>العنوان</h4>
                  <p>
                    طريق الملك فهد، حي العليا<br/>
                    الرياض، المملكة العربية السعودية
                  </p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div class="info-content">
                  <h4>الهاتف</h4>
                  <p dir="ltr">+966 11 462 3388</p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div class="info-content">
                  <h4>البريد الإلكتروني</h4>
                  <p>
                    <a href="mailto:info@kfnl.gov.sa">info@kfnl.gov.sa</a>
                  </p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div class="info-content">
                  <h4>ساعات العمل</h4>
                  <p>
                    الأحد - الخميس<br/>
                    8:00 ص - 4:00 م
                  </p>
                </div>
              </div>
            </div>

            <!-- Map Placeholder -->
            <div class="card map-card">
              <div class="map-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                  <line x1="8" y1="2" x2="8" y2="18"/>
                  <line x1="16" y1="6" x2="16" y2="22"/>
                </svg>
                <p>الموقع على الخريطة</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.contact-view {
  min-height: 100vh;
  background-color: $bg-secondary;
}

.breadcrumb-section {
  padding: $spacing-3 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
}

.contact-header {
  padding: $spacing-8 0;
  background-color: $white;
  border-bottom: 1px solid $border-color-light;
  text-align: center;
}

.page-title {
  @include heading-2;
  margin-bottom: $spacing-3;
}

.page-description {
  color: $text-muted;
}

.contact-content {
  padding: $spacing-8 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: $spacing-6;

  @include media-down('lg') {
    grid-template-columns: 1fr;
  }
}

// Form Card
.form-card {
  padding: $spacing-6;

  .card-title {
    @include heading-4;
    margin-bottom: $spacing-6;
    padding-bottom: $spacing-3;
    border-bottom: 2px solid $primary-lighter;
  }
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

// Sidebar
.sidebar {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.info-card {
  padding: $spacing-6;

  .card-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-6;
    padding-bottom: $spacing-3;
    border-bottom: 2px solid $primary-lighter;
  }
}

.info-item {
  display: flex;
  gap: $spacing-4;
  margin-bottom: $spacing-4;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-icon {
  @include flex-center;
  width: 48px;
  height: 48px;
  background-color: $primary-lighter;
  border-radius: $border-radius-lg;
  color: $primary-color;
  flex-shrink: 0;
}

.info-content {
  h4 {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-1;
  }

  p {
    font-size: $font-size-sm;
    color: $text-muted;
    margin: 0;
    line-height: $line-height-relaxed;

    a {
      color: $primary-color;
    }
  }
}

.map-card {
  padding: 0;
  overflow: hidden;
}

.map-placeholder {
  @include flex-column-center;
  height: 200px;
  background-color: $bg-secondary;
  color: $text-light;
  gap: $spacing-2;
}

// Alert in Form
.alert {
  display: flex;
  align-items: flex-start;
  gap: $spacing-3;
  padding: $spacing-4;
  border-radius: $border-radius-md;
  margin-bottom: $spacing-4;

  svg {
    flex-shrink: 0;
  }

  p {
    margin: 0;
    font-size: $font-size-sm;
  }

  &.alert-success {
    background-color: $success-light;
    color: color.adjust($success-color, $lightness: -20%);

    svg {
      color: $success-color;
    }
  }
}
</style>
