import axios from 'axios'
import config from '@/config/dspace.config.js'

// Create axios instance with config from dspace.config.js
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: config.timeout,
  withCredentials: config.withCredentials
})

// Store for tokens
let csrfToken = null
let authToken = null
let isLoggedIn = false

// Request interceptor - add tokens to every request
api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken
  }
  return config
})

// Response interceptor - capture CSRF token from responses
api.interceptors.response.use(
  (response) => {
    // Extract CSRF token from response headers
    const newCsrfToken = response.headers['dspace-xsrf-token']
    if (newCsrfToken) {
      csrfToken = newCsrfToken
      // Use sessionStorage for better security (cleared when browser closes)
      sessionStorage.setItem('xsrf', newCsrfToken)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear tokens on unauthorized
      authToken = null
      csrfToken = null
      isLoggedIn = false
      sessionStorage.removeItem('jwt')
      sessionStorage.removeItem('xsrf')
    }
    return Promise.reject(error)
  }
)

// Authentication functions
export const auth = {
  /**
   * Auto-login using config credentials
   * Called on app initialization
   */
  async autoLogin() {
    // Skip if already logged in
    if (isLoggedIn) {
      return true
    }

    // Check if auto-login is enabled in config
    if (!config.autoLogin?.enabled) {
      console.log('Auto-login is disabled in config')
      return false
    }

    const email = config.autoLogin.email
    const password = config.autoLogin.password

    if (!email || !password) {
      return false
    }

    try {

      // First, get CSRF token by calling status endpoint
      await api.get('/authn/status')

      // Perform login
      const response = await api.post('/authn/login', null, {
        params: {
          user: email,
          password: password
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      // Store the auth token in sessionStorage for better security
      const token = response.headers['authorization']
      if (token) {
        authToken = token.replace('Bearer ', '')
        sessionStorage.setItem('jwt', authToken)
      }

      isLoggedIn = true
      return true
    } catch (error) {
      // Silently fail - don't expose error details
      return false
    }
  },

  /**
   * Login to DSpace
   */
  async login(email, password) {
    try {
      // First, get CSRF token
      await api.get('/authn/status')

      // Then perform login
      const response = await api.post('/authn/login', null, {
        params: {
          user: email,
          password: password
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      // Store the auth token in sessionStorage for better security
      const token = response.headers['authorization']
      if (token) {
        authToken = token.replace('Bearer ', '')
        sessionStorage.setItem('jwt', authToken)
      }

      isLoggedIn = true
      return response.data
    } catch (error) {
      throw new Error('Authentication failed')
    }
  },

  /**
   * Logout from DSpace
   */
  async logout() {
    try {
      await api.post('/authn/logout')
    } catch (error) {
      // Silently handle logout errors
    } finally {
      authToken = null
      csrfToken = null
      isLoggedIn = false
      sessionStorage.removeItem('jwt')
      sessionStorage.removeItem('xsrf')
    }
  },

  /**
   * Check authentication status
   */
  async getStatus() {
    const response = await api.get('/authn/status')
    return response.data
  },

  /**
   * Initialize auth from stored tokens
   */
  initFromStorage() {
    const storedToken = sessionStorage.getItem('jwt')
    const storedXsrf = sessionStorage.getItem('xsrf')

    if (storedToken) {
      authToken = storedToken
      isLoggedIn = true
    }
    if (storedXsrf) {
      csrfToken = storedXsrf
    }
  }
}

// Helper functions
export function getAuthToken() {
  return authToken
}

export function isAuthenticated() {
  return isLoggedIn
}

export default api
