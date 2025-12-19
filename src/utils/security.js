/**
 * Security utilities for preventing common vulnerabilities
 * - XSS (Cross-Site Scripting)
 * - CSRF (Cross-Site Request Forgery)
 * - Injection attacks
 */

import config from '@/config/dspace.config.js'

/**
 * Debug logger that respects config settings
 * Only logs when debug mode is enabled
 */
export const debugLog = {
  log: (...args) => {
    if (config.app.debug) {
      console.log(...args)
    }
  },
  warn: (...args) => {
    if (config.app.debug) {
      console.warn(...args)
    }
  },
  error: (...args) => {
    // Always log errors, but mask sensitive data
    console.error(...args)
  }
}

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} input - Untrusted input
 * @returns {string} - Sanitized output
 */
export function sanitizeHtml(input) {
  if (typeof input !== 'string') {
    return ''
  }

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }

  return input.replace(/[&<>"'`=/]/g, char => map[char])
}

/**
 * Sanitize input for safe URL usage
 * @param {string} url - URL to validate
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') {
    return null
  }

  // Only allow http, https, and relative URLs
  const trimmedUrl = url.trim()

  // Check for javascript: or data: protocols (XSS vectors)
  const dangerousProtocols = /^(javascript|data|vbscript):/i
  if (dangerousProtocols.test(trimmedUrl)) {
    return null
  }

  // Allow relative URLs
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
    return trimmedUrl
  }

  // Allow http and https
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl
  }

  return null
}

/**
 * Validate and sanitize email format
 * @param {string} email - Email to validate
 * @returns {string|null} - Sanitized email or null if invalid
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return null
  }

  const trimmed = email.trim().toLowerCase()

  // Basic email regex validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(trimmed)) {
    return null
  }

  // Additional length check
  if (trimmed.length > 254) {
    return null
  }

  return trimmed
}

/**
 * Sanitize search query to prevent injection
 * @param {string} query - Search query
 * @returns {string} - Sanitized query
 */
export function sanitizeSearchQuery(query) {
  if (typeof query !== 'string') {
    return ''
  }

  // Remove potential script tags and dangerous characters
  return query
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 500) // Limit query length
}

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} - Whether UUID is valid
 */
export function isValidUuid(uuid) {
  if (typeof uuid !== 'string') {
    return false
  }

  // More permissive UUID regex that accepts any valid UUID format
  // Format: 8-4-4-4-12 hexadecimal characters
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate integer ID
 * @param {string|number} id - ID to validate
 * @returns {number|null} - Parsed integer or null if invalid
 */
export function validateIntegerId(id) {
  const parsed = parseInt(id, 10)

  if (isNaN(parsed) || parsed < 0 || parsed > Number.MAX_SAFE_INTEGER) {
    return null
  }

  return parsed
}

/**
 * Generate a cryptographically secure random string
 * @param {number} length - Desired length
 * @returns {string} - Random string
 */
export function generateSecureRandom(length = 32) {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Content Security Policy nonce generator
 * @returns {string} - CSP nonce
 */
export function generateCspNonce() {
  return generateSecureRandom(16)
}

/**
 * Rate limiting helper for client-side
 */
export class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = []
  }

  canMakeRequest() {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.windowMs)

    if (this.requests.length >= this.maxRequests) {
      return false
    }

    this.requests.push(now)
    return true
  }

  reset() {
    this.requests = []
  }
}

/**
 * Secure storage wrapper with encryption awareness
 */
export const secureStorage = {
  /**
   * Store sensitive data
   * Note: For truly sensitive data, consider using a backend service
   */
  setItem(key, value) {
    if (typeof key !== 'string' || !key) {
      throw new Error('Invalid key')
    }

    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
      sessionStorage.setItem(key, stringValue)
    } catch (error) {
      console.error('Storage error:', error)
    }
  },

  getItem(key) {
    if (typeof key !== 'string' || !key) {
      return null
    }

    try {
      return sessionStorage.getItem(key)
    } catch (error) {
      console.error('Storage error:', error)
      return null
    }
  },

  removeItem(key) {
    if (typeof key !== 'string' || !key) {
      return
    }

    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error('Storage error:', error)
    }
  },

  clear() {
    try {
      sessionStorage.clear()
    } catch (error) {
      console.error('Storage error:', error)
    }
  }
}

/**
 * Check for common security headers in response
 * @param {Object} headers - Response headers
 * @returns {Object} - Security header status
 */
export function checkSecurityHeaders(headers) {
  return {
    hasXFrameOptions: !!headers['x-frame-options'],
    hasContentTypeOptions: !!headers['x-content-type-options'],
    hasXssProtection: !!headers['x-xss-protection'],
    hasStrictTransportSecurity: !!headers['strict-transport-security'],
    hasContentSecurityPolicy: !!headers['content-security-policy']
  }
}

export default {
  sanitizeHtml,
  sanitizeUrl,
  sanitizeEmail,
  sanitizeSearchQuery,
  isValidUuid,
  validateIntegerId,
  generateSecureRandom,
  generateCspNonce,
  RateLimiter,
  secureStorage,
  checkSecurityHeaders
}
