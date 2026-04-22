<script setup lang="ts">
import { AUTH_UNAUTHORIZED_EVENT } from '@/api/http'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useSiteSettingsStore } from '@/stores/siteSettings'
import { resolveBrandingLogoUrl } from '@/utils/assets'
import { getResolvedTheme, getStoredThemeMode, setThemeMode, type ThemeMode } from '@/utils/theme'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const userStore = useUserStore()
const { isAdmin } = storeToRefs(userStore)
const siteSettingsStore = useSiteSettingsStore()
const { schoolName, logoPath } = storeToRefs(siteSettingsStore)

const router = useRouter()
const route = useRoute()

const pageTitle = computed(() => {
  if (route.path === '/') {
    return 'Расписание занятий'
  }
  if (route.path === '/admin') {
    return 'Администрирование'
  }

  return ''
})

const schoolLogoUrl = computed(() => resolveBrandingLogoUrl(logoPath.value))
const needsLogoContrastBg = ref(false)
const themeMode = ref<ThemeMode>(getStoredThemeMode())
const themeMedia = window.matchMedia('(prefers-color-scheme: dark)')
const isUserMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const resolvedTheme = computed(() => getResolvedTheme(themeMode.value))
const isDark = computed(() => resolvedTheme.value === 'dark')

const browserTitle = computed(() => {
  if (route.path === '/admin') {
    return `${schoolName.value} - Админка`
  }
  if (route.path === '/login') {
    return `${schoolName.value} - Вход`
  }
  return `${schoolName.value} - Расписание занятий`
})

const ensureFaviconElement = (): HTMLLinkElement => {
  let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  return link
}

const updateFavicon = async (logoUrl: string | null) => {
  const link = ensureFaviconElement()

  if (!logoUrl) {
    link.href = '/favicon.ico'
    return
  }

  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = logoUrl

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Logo load failed'))
  })

  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const context = canvas.getContext('2d')
  if (!context) {
    link.href = '/favicon.ico'
    return
  }

  context.clearRect(0, 0, 64, 64)
  const scale = Math.min(64 / image.width, 64 / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  const offsetX = (64 - drawWidth) / 2
  const offsetY = (64 - drawHeight) / 2
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
  link.href = canvas.toDataURL('image/png')
}

const detectLightLogo = async (logoUrl: string | null) => {
  if (!logoUrl) {
    needsLogoContrastBg.value = false
    return
  }

  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = logoUrl

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Logo load failed'))
  })

  const sampleSize = 48
  const canvas = document.createElement('canvas')
  canvas.width = sampleSize
  canvas.height = sampleSize
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) {
    needsLogoContrastBg.value = false
    return
  }

  context.clearRect(0, 0, sampleSize, sampleSize)
  context.drawImage(image, 0, 0, sampleSize, sampleSize)
  const pixels = context.getImageData(0, 0, sampleSize, sampleSize).data

  let visiblePixels = 0
  let brightPixels = 0
  let luminanceSum = 0
  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3] / 255
    if (alpha < 0.05) continue

    visiblePixels += 1
    const red = pixels[index]
    const green = pixels[index + 1]
    const blue = pixels[index + 2]
    const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255
    luminanceSum += luminance
    if (luminance > 0.72) {
      brightPixels += 1
    }
  }

  if (visiblePixels === 0) {
    needsLogoContrastBg.value = false
    return
  }

  const brightRatio = brightPixels / visiblePixels
  const averageLuminance = luminanceSum / visiblePixels

  // Sensitive thresholds: white/light logos usually have high luminance even with antialiasing.
  needsLogoContrastBg.value = brightRatio > 0.35 || averageLuminance > 0.68
}

const handleLogout = () => {
  isUserMenuOpen.value = false
  userStore.logout()
  router.push('/')
}

const handleUnauthorized = () => {
  userStore.logout()
  router.push('/login')
}

const applyThemeSelection = (mode: ThemeMode) => {
  themeMode.value = mode
  setThemeMode(mode)
}

const toggleTheme = () => {
  applyThemeSelection(isDark.value ? 'light' : 'dark')
}

const setSystemTheme = () => {
  applyThemeSelection('system')
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node | null
  if (!target) return
  if (!userMenuRef.value?.contains(target)) {
    closeUserMenu()
  }
}

const goToAdmin = () => {
  closeUserMenu()
  void router.push('/admin')
}

const handleSystemThemeChange = () => {
  if (themeMode.value === 'system') {
    setThemeMode('system')
  }
}

onMounted(() => {
  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
  themeMedia.addEventListener('change', handleSystemThemeChange)
  document.addEventListener('click', handleDocumentClick)
  void siteSettingsStore.ensureLoaded()
})

onUnmounted(() => {
  window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
  themeMedia.removeEventListener('change', handleSystemThemeChange)
  document.removeEventListener('click', handleDocumentClick)
})

watch(browserTitle, (title) => {
  document.title = title
}, { immediate: true })

watch(
  () => route.fullPath,
  () => {
    closeUserMenu()
  },
)

watch(
  schoolLogoUrl,
  async (logoUrl) => {
    try {
      await updateFavicon(logoUrl)
    } catch {
      ensureFaviconElement().href = '/favicon.ico'
    }

    try {
      await detectLightLogo(logoUrl)
    } catch {
      needsLogoContrastBg.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <header
    class="mx-auto mb-3 grid w-full max-w-[1800px] grid-cols-[1fr_auto] gap-2 border-b border-gray-200 pb-2 md:grid-cols-[1fr_auto_1fr] md:items-center dark:border-slate-700"
  >
    <div class="min-w-0">
      <router-link to="/" class="inline-flex items-center">
        <span v-if="schoolLogoUrl" :class="{ 'logo-contrast-bg': needsLogoContrastBg }">
          <img :src="schoolLogoUrl" :alt="schoolName" class="max-h-9 md:max-h-10 w-auto object-contain" />
        </span>
        <h1 v-else class="truncate text-base font-semibold text-gray-800 md:text-lg dark:text-slate-100">
          {{ schoolName }}
        </h1>
      </router-link>
    </div>

    <div class="flex items-center gap-3 justify-self-end md:justify-self-end">
      <div class="flex items-center justify-end gap-3">
        <button
          class="relative inline-flex h-7 w-12 items-center rounded-full border transition-colors duration-200 disabled:opacity-55 disabled:cursor-not-allowed"
          :class="isDark ? 'bg-slate-900 border-slate-600' : 'bg-white border-gray-300'"
          type="button"
          role="switch"
          aria-label="Toggle dark mode"
          :aria-checked="isDark ? 'true' : 'false'"
          :title="themeMode === 'system' ? 'Системная тема включена' : 'Переключить светлую/тёмную тему'"
          @click="toggleTheme"
        >
          <span
            class="relative ml-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full shadow transition-all duration-200"
            :class="isDark ? 'translate-x-4.5 bg-slate-700 text-slate-50' : 'translate-x-0 bg-slate-50 text-slate-700'"
          >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                class="absolute h-3.5 w-3.5 transition-opacity duration-200"
                :class="isDark ? 'opacity-0' : 'opacity-100'"
              >
                <path d="M12,18c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S15.3,18,12,18zM12,8c-2.2,0-4,1.8-4,4c0,2.2,1.8,4,4,4c2.2,0,4-1.8,4-4C16,9.8,14.2,8,12,8z"></path>
                <path d="M12,4c-0.6,0-1-0.4-1-1V1c0-0.6,0.4-1,1-1s1,0.4,1,1v2C13,3.6,12.6,4,12,4z"></path>
                <path d="M12,24c-0.6,0-1-0.4-1-1v-2c0-0.6,0.4-1,1-1s1,0.4,1,1v2C13,23.6,12.6,24,12,24z"></path>
                <path d="M5.6,6.6c-0.3,0-0.5-0.1-0.7-0.3L3.5,4.9c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.4,1.4c0.4,0.4,0.4,1,0,1.4C6.2,6.5,5.9,6.6,5.6,6.6z"></path>
                <path d="M19.8,20.8c-0.3,0-0.5-0.1-0.7-0.3l-1.4-1.4c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.4,1.4c0.4,0.4,0.4,1,0,1.4C20.3,20.7,20,20.8,19.8,20.8z"></path>
                <path d="M3,13H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h2c0.6,0,1,0.4,1,1S3.6,13,3,13z"></path>
                <path d="M23,13h-2c-0.6,0-1-0.4-1-1s0.4-1,1-1h2c0.6,0,1,0.4,1,1S23.6,13,23,13z"></path>
                <path d="M4.2,20.8c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.4-1.4c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.4,1.4C4.7,20.7,4.5,20.8,4.2,20.8z"></path>
                <path d="M18.4,6.6c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.4-1.4c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.4,1.4C18.9,6.5,18.6,6.6,18.4,6.6z"></path>
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                class="absolute h-3.5 w-3.5 transition-opacity duration-200"
                :class="isDark ? 'opacity-100' : 'opacity-0'"
              >
                <path d="M12.1,22c-0.3,0-0.6,0-0.9,0c-5.5-0.5-9.5-5.4-9-10.9c0.4-4.8,4.2-8.6,9-9c0.4,0,0.8,0.2,1,0.5c0.2,0.3,0.2,0.8-0.1,1.1c-2,2.7-1.4,6.4,1.3,8.4c2.1,1.6,5,1.6,7.1,0c0.3-0.2,0.7-0.3,1.1-0.1c0.3,0.2,0.5,0.6,0.5,1c-0.2,2.7-1.5,5.1-3.6,6.8C16.6,21.2,14.4,22,12.1,22zM9.3,4.4c-2.9,1-5,3.6-5.2,6.8c-0.4,4.4,2.8,8.3,7.2,8.7c2.1,0.2,4.2-0.4,5.8-1.8c1.1-0.9,1.9-2.1,2.4-3.4c-2.5,0.9-5.3,0.5-7.5-1.1C9.2,11.4,8.1,7.7,9.3,4.4z"></path>
              </svg>
          </span>
        </button>
      </div>
      <div v-if="!isAdmin" class="text-right">
        <router-link to="/login" class="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300">
          Войти
        </router-link>
      </div>
      <div v-else ref="userMenuRef" class="relative">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          aria-label="Меню администратора"
          @click.stop="toggleUserMenu"
        >
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M10 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM8 6.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0ZM4.25 14A2.25 2.25 0 0 1 6.5 11.75h7A2.25 2.25 0 0 1 15.75 14v.75a.75.75 0 0 1-1.5 0V14a.75.75 0 0 0-.75-.75h-7a.75.75 0 0 0-.75.75v.75a.75.75 0 0 1-1.5 0V14Z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          <span class="hidden sm:inline">Админ</span>
          <span class="text-[10px] text-gray-500 dark:text-slate-400">▼</span>
        </button>

        <div
          v-if="isUserMenuOpen"
          class="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden z-50 dark:border-slate-600 dark:bg-slate-800"
        >
          <button
            type="button"
            class="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 dark:text-blue-300 dark:hover:bg-slate-700"
            @click="goToAdmin"
          >
            Админка
          </button>
          <button
            type="button"
            class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:text-red-300 dark:hover:bg-slate-700"
            @click="handleLogout"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>

    <div class="col-span-2 flex justify-center md:col-span-1 md:col-start-2 md:row-start-1">
      <h2 v-if="pageTitle" class="text-lg font-semibold text-gray-800 md:text-xl dark:text-slate-100">{{ pageTitle }}</h2>
    </div>
  </header>
  <main>
    <RouterView />
  </main>

  <footer class="my-6 text-center text-gray-600 dark:text-slate-400">© 2026 {{ schoolName }}. Все права защищены.</footer>
</template>

<style lang="scss">
html {
  height: 100%;
}
body {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  margin: 0;
  padding: 15px;
  font-family: Arial, sans-serif;
  background: #f5f5f5;
  color: #111827;

  @media (max-width: 768px) {
    padding: 10px;
  }
}

html.dark body {
  background: #0f172a;
  color: #e2e8f0;
}
#app {
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  height: 100%;
}
main {
  width: 100%;
  max-width: 1800px;
  margin: 0 auto 16px;
}
footer {
  margin-top: auto;
}

.logo-contrast-bg {
  display: inline-flex;
  align-items: center;
  border-radius: 10px;
  padding: 4px 8px;
  background: rgba(17, 24, 39, 0.78);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.28);
}

html.dark .logo-contrast-bg {
  background: rgba(2, 6, 23, 0.82);
}
</style>
