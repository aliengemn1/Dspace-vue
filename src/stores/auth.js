import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth as authService } from '@/services/api'
import { debugLog } from '@/utils/security'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const isInitialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userName = computed(() => {
    if (!user.value) return ''
    return user.value.fullname || user.value.email || ''
  })

  // Actions
  async function initialize() {
    if (isInitialized.value) return

    try {
      // Initialize from stored token
      authService.initFromStorage()

      // Check auth status with server
      const status = await authService.getStatus()
      if (status.authenticated) {
        user.value = status.eperson
      }
    } catch (err) {
      debugLog.error('Auth initialization failed:', err)
    } finally {
      isInitialized.value = true
    }
  }

  async function login(email, password) {
    isLoading.value = true
    error.value = null

    try {
      await authService.login(email, password)

      // Get user info after successful login
      const status = await authService.getStatus()
      if (status.authenticated) {
        user.value = status.eperson
      }

      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تسجيل الدخول'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true

    try {
      await authService.logout()
      user.value = null
    } catch (err) {
      debugLog.error('Logout failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    isLoading,
    error,
    isInitialized,
    // Getters
    isAuthenticated,
    userName,
    // Actions
    initialize,
    login,
    logout,
    clearError
  }
})
