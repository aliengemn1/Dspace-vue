import { createI18n } from 'vue-i18n'

// Import bundled translations as fallback
import arFallback from './ar.json'
import enFallback from './en.json'

// Fallback messages (bundled)
const fallbackMessages = {
  ar: arFallback,
  en: enFallback
}

// Default empty messages - will be loaded dynamically
const defaultMessages = {
  ar: {},
  en: {}
}

const i18n = createI18n({
  legacy: false,
  locale: 'ar',
  fallbackLocale: 'en',
  messages: defaultMessages,
  numberFormats: {
    ar: {
      decimal: {
        style: 'decimal',
        useGrouping: true
      },
      percent: {
        style: 'percent'
      },
      currency: {
        style: 'currency',
        currency: 'SAR'
      }
    },
    en: {
      decimal: {
        style: 'decimal',
        useGrouping: true
      },
      percent: {
        style: 'percent'
      },
      currency: {
        style: 'currency',
        currency: 'USD'
      }
    }
  },
  datetimeFormats: {
    ar: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }
    },
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }
    }
  }
})

/**
 * Load translations from external JSON files
 * Files are located in /locales/ar.json and /locales/en.json
 * These can be updated after deployment without rebuilding
 */
async function loadLocaleMessages(locale) {
  try {
    // Add cache-busting timestamp to force fresh load
    const timestamp = Date.now()
    const response = await fetch(`/locales/${locale}.json?t=${timestamp}`)

    if (!response.ok) {
      throw new Error(`Failed to load ${locale} translations: ${response.status}`)
    }

    const messages = await response.json()
    i18n.global.setLocaleMessage(locale, messages)
    console.log(`Loaded ${locale} translations from external file`)
    return messages
  } catch (error) {
    console.warn(`Could not load external ${locale} translations:`, error.message)

    // Use bundled fallback
    const bundledMessages = fallbackMessages[locale]
    if (bundledMessages) {
      i18n.global.setLocaleMessage(locale, bundledMessages)
      console.log(`Loaded ${locale} translations from bundled fallback`)
      return bundledMessages
    }

    console.error(`No fallback available for ${locale}`)
    return null
  }
}

/**
 * Initialize all translations
 * Call this at app startup
 */
async function initializeTranslations() {
  console.log('Initializing translations...')
  const results = await Promise.all([
    loadLocaleMessages('ar'),
    loadLocaleMessages('en')
  ])
  console.log('Translations initialized')
  return results
}

/**
 * Reload translations from server
 * Call this to refresh translations without page reload
 */
async function reloadTranslations() {
  console.log('Reloading translations...')
  await initializeTranslations()
  console.log('Translations reloaded')
}

/**
 * Switch locale and load messages if not already loaded
 */
async function setLocale(locale) {
  if (!['ar', 'en'].includes(locale)) {
    console.warn(`Unsupported locale: ${locale}`)
    return
  }

  // Load messages if empty
  const messages = i18n.global.getLocaleMessage(locale)
  if (!messages || Object.keys(messages).length === 0) {
    await loadLocaleMessages(locale)
  }

  i18n.global.locale.value = locale
  document.documentElement.lang = locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'

  // Save preference
  localStorage.setItem('locale', locale)
}

// Export utilities
export { loadLocaleMessages, initializeTranslations, reloadTranslations, setLocale }

export default i18n
