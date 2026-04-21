import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSettings, updateSettings } from '@/api/settings'

const DEFAULT_NAME = 'Школа танцев'

export const useSiteSettingsStore = defineStore('siteSettings', () => {
  const schoolName = ref(DEFAULT_NAME)
  const logoPath = ref<string | null>(null)
  const isLoaded = ref(false)
  const isLoading = ref(false)

  const load = async () => {
    isLoading.value = true
    try {
      const settings = await getSettings()
      schoolName.value = settings.schoolName || DEFAULT_NAME
      logoPath.value = settings.logoPath
      isLoaded.value = true
    } finally {
      isLoading.value = false
    }
  }

  const ensureLoaded = async () => {
    if (!isLoaded.value && !isLoading.value) {
      await load()
    }
  }

  const save = async (nextSchoolName: string, nextLogoPath: string | null) => {
    const saved = await updateSettings({
      schoolName: nextSchoolName,
      logoPath: nextLogoPath,
    })
    schoolName.value = saved.schoolName || DEFAULT_NAME
    logoPath.value = saved.logoPath
    isLoaded.value = true
    return saved
  }

  return {
    schoolName,
    logoPath,
    isLoaded,
    isLoading,
    load,
    ensureLoaded,
    save,
  }
})
