import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // State
  const sidebarOpen = ref(false)
  const mobileMenuOpen = ref(false)
  const theme = ref('light')
  const notifications = ref([])

  // Actions
  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSidebarOpen(value) {
    sidebarOpen.value = value
  }

  function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  function closeMobileMenu() {
    mobileMenuOpen.value = false
  }

  function setTheme(newTheme) {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }

  function addNotification(notification) {
    const id = Date.now()
    notifications.value.push({
      id,
      ...notification
    })

    // Auto-remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }

    return id
  }

  function removeNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function showSuccess(message, title = 'نجاح') {
    return addNotification({
      type: 'success',
      title,
      message
    })
  }

  function showError(message, title = 'خطأ') {
    return addNotification({
      type: 'error',
      title,
      message
    })
  }

  function showWarning(message, title = 'تنبيه') {
    return addNotification({
      type: 'warning',
      title,
      message
    })
  }

  function showInfo(message, title = 'معلومة') {
    return addNotification({
      type: 'info',
      title,
      message
    })
  }

  return {
    // State
    sidebarOpen,
    mobileMenuOpen,
    theme,
    notifications,
    // Actions
    toggleSidebar,
    setSidebarOpen,
    toggleMobileMenu,
    closeMobileMenu,
    setTheme,
    initTheme,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})
