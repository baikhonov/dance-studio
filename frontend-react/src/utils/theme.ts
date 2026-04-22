export type ThemeMode = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'theme_mode'

const getThemeMedia = () => window.matchMedia('(prefers-color-scheme: dark)')

export const getStoredThemeMode = (): ThemeMode => {
  const raw = localStorage.getItem(THEME_STORAGE_KEY)
  if (raw === 'light' || raw === 'dark' || raw === 'system') {
    return raw
  }
  return 'system'
}

export const getResolvedTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getThemeMedia().matches ? 'dark' : 'light'
  }
  return mode
}

export const applyThemeMode = (mode: ThemeMode) => {
  const resolved = getResolvedTheme(mode)
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

export const setThemeMode = (mode: ThemeMode) => {
  localStorage.setItem(THEME_STORAGE_KEY, mode)
  applyThemeMode(mode)
}

export const initThemeMode = (): ThemeMode => {
  const mode = getStoredThemeMode()
  applyThemeMode(mode)
  return mode
}
