import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n, { initializeTranslations, setLocale } from './locales'
import { auth } from './services/api'
import { debugLog } from './utils/security'

// Global styles
import './assets/styles/main.scss'

const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)
app.use(i18n)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  debugLog.error('Global error:', err)
  debugLog.error('Component:', vm)
  debugLog.error('Error info:', info)
}

// Initialize authentication from storage and attempt auto-login
auth.initFromStorage()
auth.autoLogin().then(success => {
  if (success) {
    debugLog.log('DSpace API authenticated successfully')
  }
})

// Initialize translations from external files, then mount the app
initializeTranslations().then(async () => {
  debugLog.log('Translations loaded')

  // Load saved locale preference from localStorage
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && ['ar', 'en'].includes(savedLocale)) {
    await setLocale(savedLocale)
    debugLog.log('Restored saved locale:', savedLocale)
  } else {
    // Default to Arabic if no saved preference
    await setLocale('ar')
  }

  debugLog.log('Mounting app')
  app.mount('#app')
}).catch(error => {
  debugLog.error('Failed to load translations:', error)
  // Mount anyway with fallback/empty translations
  app.mount('#app')
})
// Build timestamp: 1765703040
