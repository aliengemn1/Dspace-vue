/**
 * Number and text formatting utilities for Arabic/English support
 */

// Arabic-Indic numerals mapping
const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

/**
 * Convert Western numerals to Arabic-Indic numerals
 * @param {number|string} num - Number to convert
 * @returns {string} - Number with Arabic-Indic numerals
 */
export function toArabicNumerals(num) {
  if (num === null || num === undefined) return ''
  return String(num).replace(/[0-9]/g, (d) => arabicNumerals[parseInt(d)])
}

/**
 * Convert Arabic-Indic numerals to Western numerals
 * @param {string} str - String with Arabic numerals
 * @returns {string} - String with Western numerals
 */
export function toWesternNumerals(str) {
  if (!str) return ''
  return String(str).replace(/[٠-٩]/g, (d) => arabicNumerals.indexOf(d).toString())
}

/**
 * Format number based on locale
 * @param {number|string} num - Number to format
 * @param {string} locale - Locale code ('ar' or 'en')
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} - Formatted number
 */
export function formatNumber(num, locale = 'ar', options = {}) {
  if (num === null || num === undefined) return ''

  const numValue = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(numValue)) return String(num)

  // Use ar-SA for Arabic locale to get Arabic-Indic numerals
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US'

  return new Intl.NumberFormat(localeCode, {
    useGrouping: true,
    ...options
  }).format(numValue)
}

/**
 * Format number with appropriate suffix (K, M, etc.)
 * @param {number} num - Number to format
 * @param {string} locale - Locale code
 * @returns {string} - Formatted number with suffix
 */
export function formatCompactNumber(num, locale = 'ar') {
  if (num === null || num === undefined) return ''

  const numValue = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(numValue)) return String(num)

  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US'

  // For large numbers, use compact notation
  if (numValue >= 1000000) {
    const formatted = (numValue / 1000000).toFixed(1)
    const suffix = locale === 'ar' ? 'م+' : 'M+'
    return formatNumber(parseFloat(formatted), locale) + suffix
  } else if (numValue >= 1000) {
    const formatted = (numValue / 1000).toFixed(0)
    const suffix = locale === 'ar' ? 'ألف+' : 'K+'
    return formatNumber(parseFloat(formatted), locale) + suffix
  }

  return formatNumber(numValue, locale)
}

/**
 * Format date based on locale
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale code
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date
 */
export function formatDate(date, locale = 'ar', options = {}) {
  if (!date) return ''

  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return String(date)

  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US'

  return new Intl.DateTimeFormat(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }).format(dateObj)
}

/**
 * Format year based on locale
 * @param {string|number} year - Year to format
 * @param {string} locale - Locale code
 * @returns {string} - Formatted year (without thousands separator)
 */
export function formatYear(year, locale = 'ar') {
  if (!year) return ''
  const yearStr = String(parseInt(year))
  // Use simple numeral conversion without grouping separators
  return locale === 'ar' ? toArabicNumerals(yearStr) : yearStr
}

export default {
  toArabicNumerals,
  toWesternNumerals,
  formatNumber,
  formatCompactNumber,
  formatDate,
  formatYear
}
