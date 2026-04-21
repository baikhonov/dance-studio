<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import { useSiteSettingsStore } from '@/stores/siteSettings'
import { storeToRefs } from 'pinia'
import TeacherModal from '@/components/TeacherModal.vue'
import DirectionModal from '@/components/DirectionModal.vue'
import LevelModal from '@/components/LevelModal.vue'
import { uploadSchoolLogo } from '@/api/uploads'
import {
  DEFAULT_TEACHER_AVATAR,
  resolveBrandingLogoUrl,
  resolveTeacherPhotoUrl,
} from '@/utils/assets'
import type { Direction, Level, NewDirection, NewLevel, NewTeacher, Teacher } from '@/types/lesson'

type TeacherDraft = NewTeacher & { id: null }
type DirectionDraft = NewDirection & { id: null }
type LevelDraft = NewLevel & { id: null }

const schedule = useScheduleStore()
const { teachers, directions, levels } = storeToRefs(schedule)
const siteSettings = useSiteSettingsStore()
const { schoolName, logoPath } = storeToRefs(siteSettings)
const SYSTEM_LEVEL_ALIASES = ['для всех', 'все уровни']
const managedLevels = computed(() =>
  levels.value.filter((level) => !SYSTEM_LEVEL_ALIASES.includes(level.name.trim().toLowerCase())),
)

const isTeacherModalOpen = ref(false)
const selectedTeacher = ref<Teacher | TeacherDraft | null>(null)
const isDirectionModalOpen = ref(false)
const selectedDirection = ref<Direction | DirectionDraft | null>(null)
const isLevelModalOpen = ref(false)
const selectedLevel = ref<Level | LevelDraft | null>(null)
const schoolNameDraft = ref('')
const logoPathDraft = ref<string | null>(null)
const isSavingSettings = ref(false)
const settingsMessage = ref('')
const settingsError = ref('')
const isUploadingLogo = ref(false)

const logoPreviewUrl = computed(() => resolveBrandingLogoUrl(logoPathDraft.value))

const createEmptyTeacher = (): TeacherDraft => ({
  id: null,
  name: '',
  photo: '',
})

const openTeacherModal = (teacher?: Teacher | TeacherDraft) => {
  if (teacher) {
    selectedTeacher.value = teacher
  } else {
    selectedTeacher.value = createEmptyTeacher()
  }
  isTeacherModalOpen.value = true
}

const createEmptyDirection = (): DirectionDraft => ({
  id: null,
  name: '',
})

const openDirectionModal = (direction?: Direction | DirectionDraft) => {
  if (direction) {
    selectedDirection.value = direction
  } else {
    selectedDirection.value = createEmptyDirection()
  }
  isDirectionModalOpen.value = true
}

const createEmptyLevel = (): LevelDraft => ({
  id: null,
  name: '',
})

const openLevelModal = (level?: Level | LevelDraft) => {
  if (level) {
    selectedLevel.value = level
  } else {
    selectedLevel.value = createEmptyLevel()
  }
  isLevelModalOpen.value = true
}

const closeTeacherModal = () => {
  isTeacherModalOpen.value = false
  selectedTeacher.value = null
}

const closeDirectionModal = () => {
  isDirectionModalOpen.value = false
  selectedDirection.value = null
}

const closeLevelModal = () => {
  isLevelModalOpen.value = false
  selectedLevel.value = null
}

const setFallbackImage = (event: Event, fallbackSrc: string) => {
  const image = event.target as HTMLImageElement | null
  if (image) {
    image.src = fallbackSrc
  }
}

onMounted(() => {
  void schedule.ensureLoaded()
  void siteSettings.ensureLoaded().then(() => {
    schoolNameDraft.value = schoolName.value
    logoPathDraft.value = logoPath.value
  })
})

const saveStudioSettings = async () => {
  settingsMessage.value = ''
  settingsError.value = ''
  const normalizedName = schoolNameDraft.value.trim()
  if (!normalizedName) {
    settingsError.value = 'Введите название школы'
    return
  }

  isSavingSettings.value = true
  try {
    await siteSettings.save(normalizedName, logoPathDraft.value)
    schoolNameDraft.value = siteSettings.schoolName
    logoPathDraft.value = siteSettings.logoPath
    settingsMessage.value = 'Настройки сохранены'
  } catch {
    settingsError.value = 'Не удалось сохранить настройки'
  } finally {
    isSavingSettings.value = false
  }
}

const handleSchoolLogoUpload = async (event: Event) => {
  settingsMessage.value = ''
  settingsError.value = ''
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (!file) {
    return
  }

  isUploadingLogo.value = true
  try {
    const uploaded = await uploadSchoolLogo(file)
    logoPathDraft.value = uploaded.path
  } catch {
    settingsError.value = 'Не удалось загрузить логотип'
  } finally {
    isUploadingLogo.value = false
    if (target) {
      target.value = ''
    }
  }
}

const removeSchoolLogo = () => {
  logoPathDraft.value = null
}
</script>

<template>
  <div class="space-y-8 py-2">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
      <section class="rounded-2xl border border-amber-100 bg-white p-4 md:p-5 shadow-sm">
        <div class="flex flex-col gap-3 mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Настройки школы</h2>
          <p class="text-sm text-gray-600">
            Название используется в шапке, футере и title страницы
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label class="block">
            <span class="mb-1 block text-sm text-gray-700">Название школы</span>
            <input
              v-model="schoolNameDraft"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:text-base"
              maxlength="80"
            />
          </label>

          <button
            type="button"
            class="px-4 py-2 text-sm md:text-base bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-60"
            :disabled="isSavingSettings"
            @click="saveStudioSettings"
          >
            {{ isSavingSettings ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>

        <div class="mt-4 flex flex-col gap-3">
          <p class="text-sm text-gray-700">Логотип</p>
          <div class="flex flex-wrap items-center gap-3">
            <img
              v-if="logoPreviewUrl"
              :src="logoPreviewUrl"
              alt="Логотип школы"
              class="h-14 max-w-[180px] object-contain rounded border border-gray-200 bg-white p-1"
            />
            <span v-else class="text-sm text-gray-500">Логотип не загружен</span>

            <label
              class="inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
            >
              {{ isUploadingLogo ? 'Загрузка...' : 'Загрузить логотип' }}
              <input
                type="file"
                class="hidden"
                accept="image/png,image/jpeg,image/webp"
                @change="handleSchoolLogoUpload"
              />
            </label>

            <button
              type="button"
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              :disabled="!logoPathDraft"
              @click="removeSchoolLogo"
            >
              Удалить логотип
            </button>
          </div>
        </div>

        <p v-if="settingsMessage" class="mt-3 text-sm text-emerald-600">{{ settingsMessage }}</p>
        <p v-if="settingsError" class="mt-3 text-sm text-red-600">{{ settingsError }}</p>
      </section>

      <section class="rounded-2xl border border-amber-100 bg-white p-4 md:p-5 shadow-sm">
        <div class="flex flex-col gap-3 mb-4">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-semibold text-gray-900">Управление преподавателями</h2>
            <span
              class="px-2.5 py-1 text-xs md:text-sm font-medium rounded-full bg-blue-100 text-blue-700 whitespace-nowrap"
            >
              Всего: {{ teachers.length }}
            </span>
          </div>
          <p class="text-sm text-gray-600">Состав и карточки преподавателей</p>
        </div>

        <button
          type="button"
          @click="openTeacherModal()"
          class="mb-4 px-3.5 py-2 text-sm md:text-base bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          Добавить преподавателя
        </button>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="teacher in teachers"
            :key="teacher.id"
            role="button"
            tabindex="0"
            :aria-label="`Карточка преподавателя ${teacher.name}`"
            class="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-200 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            @click="openTeacherModal(teacher)"
            @keydown.enter="openTeacherModal(teacher)"
            @keydown.space.prevent="openTeacherModal(teacher)"
          >
            <img
              :src="resolveTeacherPhotoUrl(teacher.photo)"
              :alt="teacher.name"
              class="w-14 h-14 rounded-full object-cover shrink-0 pointer-events-none"
              @error="setFallbackImage($event, DEFAULT_TEACHER_AVATAR)"
            />
            <p class="font-semibold text-base leading-tight text-gray-900">
              {{ teacher.name }}
            </p>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-amber-100 bg-white p-4 md:p-5 shadow-sm">
        <div class="flex flex-col gap-3 mb-4">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-semibold text-gray-900">Управление направлениями</h2>
            <span
              class="px-2.5 py-1 text-xs md:text-sm font-medium rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap"
            >
              Всего: {{ directions.length }}
            </span>
          </div>
          <p class="text-sm text-gray-600">Справочник направлений для расписания</p>
        </div>

        <button
          type="button"
          @click="openDirectionModal()"
          class="mb-4 px-3.5 py-2 text-sm md:text-base bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          Добавить направление
        </button>

        <ul class="space-y-2">
          <li
            v-for="direction in directions"
            :key="direction.id"
            role="button"
            tabindex="0"
            :aria-label="`Элемент направления ${direction.name}`"
            class="min-h-11 px-3 py-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between gap-3 hover:border-emerald-200 hover:bg-emerald-50/40 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
            @click="openDirectionModal(direction)"
            @keydown.enter="openDirectionModal(direction)"
            @keydown.space.prevent="openDirectionModal(direction)"
          >
            <span class="font-medium text-gray-800 leading-tight">{{ direction.name }}</span>
            <span class="text-emerald-600 text-sm font-semibold" aria-hidden="true">></span>
          </li>
        </ul>
      </section>

      <section class="rounded-2xl border border-amber-100 bg-white p-4 md:p-5 shadow-sm">
        <div class="flex flex-col gap-3 mb-4">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-semibold text-gray-900">Управление уровнями</h2>
            <span
              class="px-2.5 py-1 text-xs md:text-sm font-medium rounded-full bg-violet-100 text-violet-700 whitespace-nowrap"
            >
              Всего: {{ managedLevels.length }}
            </span>
          </div>
          <p class="text-sm text-gray-600">Единый справочник уровней занятий</p>
        </div>

        <button
          type="button"
          @click="openLevelModal()"
          class="mb-4 px-3.5 py-2 text-sm md:text-base bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          Добавить уровень
        </button>

        <ul class="space-y-2">
          <li
            v-for="level in managedLevels"
            :key="level.id"
            role="button"
            tabindex="0"
            :aria-label="`Элемент уровня ${level.name}`"
            class="min-h-11 px-3 py-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between gap-3 hover:border-violet-200 hover:bg-violet-50/40 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
            @click="openLevelModal(level)"
            @keydown.enter="openLevelModal(level)"
            @keydown.space.prevent="openLevelModal(level)"
          >
            <span class="font-medium text-gray-800 leading-tight">{{ level.name }}</span>
            <span class="text-violet-600 text-sm font-semibold" aria-hidden="true">></span>
          </li>
        </ul>
      </section>
    </div>

    <TeacherModal
      :is-open="isTeacherModalOpen"
      :teacher="selectedTeacher"
      @close="closeTeacherModal"
    />

    <DirectionModal
      :is-open="isDirectionModalOpen"
      :direction="selectedDirection"
      @close="closeDirectionModal"
    />

    <LevelModal :is-open="isLevelModalOpen" :level="selectedLevel" @close="closeLevelModal" />
  </div>
</template>
