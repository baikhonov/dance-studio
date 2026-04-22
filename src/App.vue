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

const handleSystemThemeChange = () => {
  if (themeMode.value === 'system') {
    setThemeMode('system')
  }
}

onMounted(() => {
  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
  themeMedia.addEventListener('change', handleSystemThemeChange)
  void siteSettingsStore.ensureLoaded()
})

onUnmounted(() => {
  window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
  themeMedia.removeEventListener('change', handleSystemThemeChange)
})

watch(browserTitle, (title) => {
  document.title = title
}, { immediate: true })

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
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          :title="themeMode === 'system' ? 'Системная тема включена' : 'Переключить светлую/тёмную тему'"
          @click="toggleTheme"
        >
          <span>{{ isDark ? '🌙' : '☀️' }}</span>
        </button>
      </div>
      <div v-if="!isAdmin" class="text-right">
        <router-link to="/login" class="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300">
          Войти
        </router-link>
      </div>
      <div v-else class="flex items-center justify-end gap-4">
        <router-link to="/admin" class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Админка</router-link>
        <button @click="handleLogout" class="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">Выйти</button>
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
