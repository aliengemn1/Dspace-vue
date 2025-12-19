import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'kfnl-theme'
const MODE_STORAGE_KEY = 'kfnl-mode'

// Available color themes
const colorThemes = {
  green: {
    name: 'green',
    nameAr: 'الأخضر السعودي',
    nameEn: 'Saudi Green',
    primary: '#006C35',
    primaryLight: '#008C45',
    primaryDark: '#005529',
    secondary: '#1B4D3E',
    accent: '#C8A415'
  },
  gold: {
    name: 'gold',
    nameAr: 'الذهبي',
    nameEn: 'Gold',
    primary: '#927e4f',
    primaryLight: '#bba97a',
    primaryDark: '#7d6b43',
    secondary: '#006C35',
    accent: '#198754'
  },
  blue: {
    name: 'blue',
    nameAr: 'الأزرق',
    nameEn: 'Blue',
    primary: '#0d6efd',
    primaryLight: '#3d8bfd',
    primaryDark: '#0a58ca',
    secondary: '#6c757d',
    accent: '#198754'
  }
}

// Mode configurations
const modes = {
  dark: {
    name: 'dark',
    nameAr: 'داكن',
    nameEn: 'Dark',
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    border: '#475569',
    cardBg: '#1e293b'
  },
  light: {
    name: 'light',
    nameAr: 'فاتح',
    nameEn: 'Light',
    bgPrimary: '#ffffff',
    bgSecondary: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    border: '#e2e8f0',
    cardBg: '#ffffff'
  }
}

// Global state
const currentColor = ref(localStorage.getItem(STORAGE_KEY) || 'green')
const currentMode = ref(localStorage.getItem(MODE_STORAGE_KEY) || 'light')

// Apply theme to document
const applyTheme = () => {
  const color = colorThemes[currentColor.value]
  const mode = modes[currentMode.value]
  if (!color || !mode) return

  const root = document.documentElement

  // Apply color theme
  root.style.setProperty('--theme-primary', color.primary)
  root.style.setProperty('--theme-primary-light', color.primaryLight)
  root.style.setProperty('--theme-primary-dark', color.primaryDark)
  root.style.setProperty('--theme-secondary', color.secondary)
  root.style.setProperty('--theme-accent', color.accent)

  // Apply mode
  root.style.setProperty('--bg-primary', mode.bgPrimary)
  root.style.setProperty('--bg-secondary', mode.bgSecondary)
  root.style.setProperty('--text-primary', mode.textPrimary)
  root.style.setProperty('--text-secondary', mode.textSecondary)
  root.style.setProperty('--border-color', mode.border)
  root.style.setProperty('--card-bg', mode.cardBg)

  // Update body classes
  document.body.className = document.body.className
    .replace(/theme-\w+/g, '')
    .replace(/mode-\w+/g, '')
  document.body.classList.add(`theme-${color.name}`, `mode-${mode.name}`)
}

// Watch for changes
watch([currentColor, currentMode], () => {
  localStorage.setItem(STORAGE_KEY, currentColor.value)
  localStorage.setItem(MODE_STORAGE_KEY, currentMode.value)
  applyTheme()
}, { immediate: true })

export function useTheme() {
  const theme = computed(() => colorThemes[currentColor.value])
  const mode = computed(() => modes[currentMode.value])
  const isDark = computed(() => currentMode.value === 'dark')
  const availableThemes = computed(() => Object.values(colorThemes))
  const availableModes = computed(() => Object.values(modes))

  const setTheme = (name) => {
    if (colorThemes[name]) currentColor.value = name
  }

  const setMode = (name) => {
    if (modes[name]) currentMode.value = name
  }

  const toggleMode = () => {
    currentMode.value = currentMode.value === 'dark' ? 'light' : 'dark'
  }

  return {
    theme,
    mode,
    isDark,
    availableThemes,
    availableModes,
    setTheme,
    setMode,
    toggleMode
  }
}
