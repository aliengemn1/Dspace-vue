/**
 * DSpace Configuration File
 *
 * Edit this file to configure the DSpace API connection settings.
 * After making changes, restart the application for them to take effect.
 */

export default {
  /**
   * DSpace REST API Base URL
   *
   * Examples:
   * - Local development: 'http://localhost:8080/server/api'
   * - Production server: 'http://192.168.2.129:8080/server/api'
   * - Remote server: 'https://dspace.example.com/server/api'
   */
  //apiUrl: 'http://172.10.14.58:8080/server/api',
  apiUrl: 'http://localhost:8080/server/api',
  /**
   * Auto-login credentials (optional)
   * Set to null to disable auto-login
   *
   * SECURITY: Credentials are loaded from environment variables
   * Never hardcode credentials in source code!
   */
  autoLogin: {
    enabled: import.meta.env.VITE_AUTO_LOGIN === 'true',
    email: import.meta.env.VITE_DSPACE_USER || '',
    password: import.meta.env.VITE_DSPACE_PASSWORD || ''
  },

  /**
   * Request timeout in milliseconds
   */
  timeout: 30000,

  /**
   * Enable credentials (cookies) for cross-origin requests
   */
  withCredentials: true,

  /**
   * Cache settings (in milliseconds)
   */
  cache: {
    // Cache duration for facets data
    facetsTTL: 10 * 60 * 1000, // 10 minutes

    // Cache duration for search results
    searchTTL: 2 * 60 * 1000, // 2 minutes

    // Cache duration for item data
    itemTTL: 5 * 60 * 1000, // 5 minutes

    // Cache duration for statistics
    statsTTL: 15 * 60 * 1000 // 15 minutes
  },

  /**
   * Application settings
   */
  app: {
    // Application title in Arabic
    titleAr: 'المستودع الرقمي - مكتبة الملك فهد الوطنية',

    // Application title in English
    titleEn: 'Digital Repository - King Fahd National Library',

    // Default language ('ar' or 'en')
    defaultLocale: 'ar',

    // Enable debug mode (console logging) - loaded from env
    debug: import.meta.env.VITE_ENABLE_DEBUG === 'true'
  }
}
