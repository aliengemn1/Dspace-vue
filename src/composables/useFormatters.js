import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  formatNumber as formatNum,
  formatCompactNumber as formatCompact,
  formatDate as formatDateUtil,
  formatYear as formatYearUtil,
  toArabicNumerals
} from '@/utils/formatters'

/**
 * Composable for locale-aware formatting
 * Automatically uses the current i18n locale
 */
export function useFormatters() {
  const { locale } = useI18n()

  /**
   * Format a number with locale-appropriate numerals
   */
  const formatNumber = (num, options = {}) => {
    return formatNum(num, locale.value, options)
  }

  /**
   * Format a large number with K/M suffix
   */
  const formatCompactNumber = (num) => {
    return formatCompact(num, locale.value)
  }

  /**
   * Format a date
   */
  const formatDate = (date, options = {}) => {
    return formatDateUtil(date, locale.value, options)
  }

  /**
   * Format a year
   */
  const formatYear = (year) => {
    return formatYearUtil(year, locale.value)
  }

  /**
   * Check if current locale is Arabic
   */
  const isArabic = computed(() => locale.value === 'ar')

  return {
    formatNumber,
    formatCompactNumber,
    formatDate,
    formatYear,
    toArabicNumerals,
    isArabic,
    locale
  }
}

export default useFormatters
