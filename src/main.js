import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './locales'
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

// Mount the app
app.mount('#app')
// Build timestamp: 1765703040
