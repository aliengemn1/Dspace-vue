import { createI18n } from 'vue-i18n'
import ar from './ar.json'
import en from './en.json'

const i18n = createI18n({
  legacy: false,
  locale: 'ar',
  fallbackLocale: 'en',
  messages: {
    ar,
    en
  },
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

export default i18n
