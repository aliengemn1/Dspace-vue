<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const currentYear = computed(() => new Date().getFullYear())

const quickLinks = computed(() => [
  { name: t('nav.home'), path: '/' },
  { name: t('nav.browse'), path: '/browse' },
  { name: t('nav.communities'), path: '/communities' },
  { name: t('nav.search'), path: '/search' },
  { name: t('nav.about'), path: '/about' }
])

const helpLinks = computed(() => [
  { name: t('footer.userGuide'), path: '/help' },
  { name: t('footer.faq'), path: '/help#faq' },
  { name: t('footer.policies'), path: '/about#policies' },
  { name: t('footer.accessibilty'), path: '/about#accessibility' }
])

const socialLinks = [
  {
    name: 'Twitter',
    url: 'https://twitter.com/KFNLGOV',
    icon: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z'
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@KFNL',
    icon: 'M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z M9.75 15.02l5.75-3.27-5.75-3.27v6.54z'
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/kfnlgov',
    icon: 'M16 8a6 6 0 0 1 6 6v7a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6v-7a6 6 0 0 1 6-6h8m0-2H8a8 8 0 0 0-8 8v7a8 8 0 0 0 8 8h8a8 8 0 0 0 8-8v-7a8 8 0 0 0-8-8m4.5 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3M12 10a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6'
  }
]
</script>

<template>
  <footer class="app-footer">
    <!-- Top Wave -->
    <div class="footer-wave">
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path d="M0,40L60,45C120,50,240,60,360,55C480,50,600,30,720,25C840,20,960,30,1080,40C1200,50,1320,60,1380,65L1440,70L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z" fill="currentColor"/>
      </svg>
    </div>

    <!-- Decorative Elements -->
    <div class="footer-decoration" aria-hidden="true">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-line line-1"></div>
    </div>

    <div class="footer-main">
      <div class="container">
        <div class="footer-grid">
          <!-- About Section -->
          <div class="footer-section footer-about">
            <div class="footer-logo">
              <div class="logo-icon">
                <svg width="56" height="56" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" rx="12" fill="#006C35"/>
                  <path d="M50 20L70 35V75H30V35L50 20Z" fill="white"/>
                  <rect x="40" y="45" width="20" height="25" fill="#006C35"/>
                  <rect x="35" y="35" width="10" height="10" fill="#C8A415"/>
                  <rect x="55" y="35" width="10" height="10" fill="#C8A415"/>
                </svg>
              </div>
              <div class="logo-text">
                <span class="logo-title">{{ $t('footer.title') }}</span>
                <span class="logo-subtitle">{{ $t('footer.subtitle') }}</span>
              </div>
            </div>
            <p class="footer-description">
              {{ $t('footer.description') }}
            </p>
            <div class="footer-social">
              <a
                v-for="social in socialLinks"
                :key="social.name"
                :href="social.url"
                target="_blank"
                rel="noopener"
                class="social-link"
                :aria-label="social.name"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path :d="social.icon"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-section">
            <h3 class="footer-heading">{{ $t('footer.quickLinks') }}</h3>
            <ul class="footer-links">
              <li v-for="link in quickLinks" :key="link.path">
                <router-link :to="link.path" class="footer-link">
                  {{ link.name }}
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Help & Support -->
          <div class="footer-section">
            <h3 class="footer-heading">{{ $t('footer.help') }}</h3>
            <ul class="footer-links">
              <li v-for="link in helpLinks" :key="link.path">
                <router-link :to="link.path" class="footer-link">
                  {{ link.name }}
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div class="footer-section">
            <h3 class="footer-heading">{{ $t('footer.contactUs') }}</h3>
            <div class="contact-info">
              <div class="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ $t('footer.address') }}</span>
              </div>
              <div class="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span dir="ltr">+966 11 462 3388</span>
              </div>
              <div class="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <a href="mailto:info@kfnl.gov.sa" class="contact-link">info@kfnl.gov.sa</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <div class="container">
        <div class="footer-bottom-content">
          <p class="copyright">
            {{ $t('footer.copyright', { year: currentYear }) }}
          </p>
          <div class="footer-bottom-links">
            <router-link to="/about#privacy" class="bottom-link">
              {{ $t('footer.privacy') }}
            </router-link>
            <router-link to="/about#terms" class="bottom-link">
              {{ $t('footer.terms') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  position: relative;
  background: linear-gradient(135deg, $secondary-color 0%, $primary-darker 50%, $secondary-dark 100%);
  color: $white;
  margin-top: auto;
  overflow: hidden;
}

// Top Wave
.footer-wave {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  color: $bg-primary;
  transform: translateY(-99%);

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
}

// Decorative Elements
.footer-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;

  &.circle-1 {
    width: 400px;
    height: 400px;
    top: -200px;
    inset-inline-end: -100px;
    background: radial-gradient(circle, rgba($accent-color, 0.1) 0%, transparent 70%);

    @include media-down('md') {
      width: 200px;
      height: 200px;
    }
  }

  &.circle-2 {
    width: 300px;
    height: 300px;
    bottom: -150px;
    inset-inline-start: -100px;
    background: radial-gradient(circle, rgba($primary-light, 0.15) 0%, transparent 70%);

    @include media-down('md') {
      width: 150px;
      height: 150px;
    }
  }
}

.decoration-line {
  &.line-1 {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba($accent-color, 0.2), transparent);
    transform: translateY(-50%);
  }
}

// Footer Main
.footer-main {
  position: relative;
  padding: $spacing-16 0 $spacing-12;
  z-index: 1;

  @include media-down('md') {
    padding: $spacing-10 0 $spacing-8;
  }
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: $spacing-10;

  @include media-down('lg') {
    grid-template-columns: 1fr 1fr;
    gap: $spacing-8;
  }

  @include media-down('sm') {
    grid-template-columns: 1fr;
    gap: $spacing-8;
  }
}

// Footer About
.footer-about {
  .footer-logo {
    display: flex;
    align-items: center;
    gap: $spacing-4;
    margin-bottom: $spacing-5;

    .logo-icon {
      position: relative;

      &::after {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 16px;
        background: linear-gradient(135deg, rgba($accent-color, 0.3), transparent);
        filter: blur(8px);
        z-index: -1;
      }
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .logo-title {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $white;
      line-height: 1.2;
    }

    .logo-subtitle {
      font-size: $font-size-sm;
      color: $accent-light;
      font-weight: $font-weight-medium;
    }
  }

  .footer-description {
    font-size: $font-size-sm;
    color: rgba($white, 0.85);
    line-height: $line-height-relaxed;
    margin-bottom: $spacing-5;
    max-width: 320px;
  }
}

// Social Links
.footer-social {
  display: flex;
  gap: $spacing-3;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, rgba($white, 0.1) 0%, rgba($white, 0.05) 100%);
  border: 1px solid rgba($white, 0.15);
  border-radius: $border-radius-lg;
  color: $white;
  transition: all $transition-duration-normal $transition-timing-cubic;

  &:hover {
    background: linear-gradient(135deg, $accent-color 0%, $accent-dark 100%);
    border-color: $accent-color;
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba($accent-color, 0.3);
  }
}

// Footer Sections
.footer-section {
  .footer-heading {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: $white;
    margin-bottom: $spacing-5;
    position: relative;
    display: inline-block;

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      inset-inline-start: 0;
      width: 40px;
      height: 3px;
      background: linear-gradient(90deg, $accent-color, $accent-light);
      border-radius: $border-radius-full;
    }
  }
}

// Footer Links
.footer-links {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    margin-bottom: $spacing-3;
  }
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  font-size: $font-size-sm;
  color: rgba($white, 0.8);
  text-decoration: none;
  transition: all $transition-duration-fast ease;
  position: relative;

  &::before {
    content: '';
    width: 0;
    height: 2px;
    background: $accent-color;
    transition: width $transition-duration-fast ease;
    position: absolute;
    bottom: -2px;
    inset-inline-start: 0;
  }

  &:hover {
    color: $accent-light;
    transform: translateX(4px);

    [dir="rtl"] & {
      transform: translateX(-4px);
    }

    &::before {
      width: 100%;
    }
  }
}

// Contact Info
.contact-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-3;
  font-size: $font-size-sm;
  color: rgba($white, 0.85);
  padding: $spacing-2 0;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: $accent-light;
    transition: $transition-fast;
  }

  &:hover svg {
    color: $accent-color;
    transform: scale(1.1);
  }
}

.contact-link {
  color: rgba($white, 0.85);
  text-decoration: none;
  transition: $transition-fast;

  &:hover {
    color: $accent-light;
  }
}

// Footer Bottom
.footer-bottom {
  position: relative;
  padding: $spacing-5 0;
  background: rgba($black, 0.25);
  border-top: 1px solid rgba($accent-color, 0.2);
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    background: linear-gradient(90deg, transparent, $accent-color, transparent);
    border-radius: $border-radius-full;
  }
}

.footer-bottom-content {
  @include flex-between;
  flex-wrap: wrap;
  gap: $spacing-4;

  @include media-down('sm') {
    flex-direction: column;
    text-align: center;
  }
}

.copyright {
  font-size: $font-size-sm;
  color: rgba($white, 0.75);
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  gap: $spacing-6;
}

.bottom-link {
  font-size: $font-size-sm;
  color: rgba($white, 0.75);
  text-decoration: none;
  transition: $transition-fast;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: $accent-color;
    transition: width $transition-duration-fast ease;
  }

  &:hover {
    color: $accent-light;

    &::after {
      width: 100%;
    }
  }
}
</style>
