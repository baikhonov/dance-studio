<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import { storeToRefs } from 'pinia'
import AlertModal from '@/components/AlertModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { uploadPoster } from '@/api/uploads'
import {
  DEFAULT_EVENT_POSTER,
  DEFAULT_TEACHER_AVATAR,
  resolvePosterUrl,
  resolveTeacherPhotoUrl,
} from '@/utils/assets'
import type { Lesson, NewLesson } from '@/types/lesson'

type LessonForm = Omit<Lesson, 'id'> & { id: number | null }
type Teacher = { id: number; name: string; photo: string }

const props = defineProps<{
  lesson: LessonForm | Lesson | null
  isOpen: boolean
  isAdmin: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useScheduleStore()
const { days, directions, levels } = storeToRefs(store)
const CUSTOM_DIRECTION_VALUE = '__custom_direction__'

const isEditing = ref(false)
const editableLesson = ref<LessonForm | null>(null)
const selectedTeacherIds = ref<number[]>([])
const directionSelectValue = ref<string>('')
const customDirectionName = ref('')
const isCreatingDirection = ref(false)
const isConfirmOpen = ref(false)
const isAlertOpen = ref(false)
const alertMessage = ref('')
const lessonToDelete = ref<number | null>(null)
const lessonNameToDelete = ref('')
const deleteEntityLabel = computed(() => 'занятие')

watch(
  () => props.lesson,
  (lesson) => {
    if (lesson) {
      const isNew = !lesson.id

      if (isNew) {
        isEditing.value = true
        editableLesson.value = {
          id: null,
          day: '',
          time: '',
          endTime: '',
          crossesMidnight: false,
          directionId: directions.value[0]?.id ?? 0,
          levelIds: [],
          teacherIds: [],
          poster: null,
        }
      } else {
        isEditing.value = false
        editableLesson.value = JSON.parse(JSON.stringify(lesson)) as LessonForm
      }

      selectedTeacherIds.value = [...(editableLesson.value.teacherIds || [])]
    }
  },
  { immediate: true },
)

watch(
  () => props.isOpen,
  (open) => {
    if (!open) {
      isEditing.value = false
      isConfirmOpen.value = false
      isAlertOpen.value = false
      lessonToDelete.value = null
      lessonNameToDelete.value = ''

      const lesson = props.lesson
      if (!lesson) return

      if (!lesson.id) {
        editableLesson.value = {
          id: null,
          day: '',
          time: '',
          endTime: '',
          crossesMidnight: false,
          directionId: directions.value[0]?.id ?? 0,
          levelIds: [],
          teacherIds: [],
          poster: null,
        }
      } else {
        editableLesson.value = JSON.parse(JSON.stringify(lesson)) as LessonForm
      }
      selectedTeacherIds.value = [...(editableLesson.value.teacherIds || [])]
    }
  },
)

watch(
  () => editableLesson.value,
  (newLesson) => {
    if (newLesson) {
      selectedTeacherIds.value = [...(newLesson.teacherIds || [])]
      directionSelectValue.value = String(newLesson.directionId)
    }
  },
  { immediate: true },
)

const lessonTeachers = computed(() => {
  if (!props.lesson?.teacherIds) return []
  return props.lesson.teacherIds
    .map((id) => store.getTeacherById(id))
    .filter((teacher): teacher is Teacher => Boolean(teacher))
})

const directionDescription = computed(() => {
  if (!props.lesson) return null
  return store.getDirectionById(props.lesson.directionId)?.description ?? null
})

const showAlert = (message: string) => {
  alertMessage.value = message
  isAlertOpen.value = true
}

const setFallbackImage = (event: Event, fallbackSrc: string) => {
  const image = event.target as HTMLImageElement | null
  if (image) {
    image.src = fallbackSrc
  }
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const enableEditing = () => {
  isEditing.value = true
}

const onLessonDirectionChange = (event: Event) => {
  if (!editableLesson.value) return
  const raw = (event.target as HTMLSelectElement).value
  directionSelectValue.value = raw
  if (raw === CUSTOM_DIRECTION_VALUE) return
  editableLesson.value.directionId = Number(raw)
}

const toggleLessonLevel = (event: Event, levelId: number) => {
  if (!editableLesson.value) return
  const checked = (event.target as HTMLInputElement).checked
  const current = editableLesson.value.levelIds
  editableLesson.value.levelIds = checked
    ? [...new Set([...current, levelId])]
    : current.filter((id) => id !== levelId)
}

const createCustomDirection = async () => {
  if (!editableLesson.value) return
  const name = customDirectionName.value.trim()
  if (!name) {
    showAlert('Введите название направления')
    return
  }

  const existing = directions.value.find(
    (direction) => direction.name.trim().toLowerCase() === name.toLowerCase(),
  )
  if (existing) {
    editableLesson.value.directionId = existing.id
    directionSelectValue.value = String(existing.id)
    customDirectionName.value = ''
    showAlert('Такое направление уже существует. Выбрали существующий вариант.')
    return
  }

  try {
    isCreatingDirection.value = true
    const created = await store.addDirection({ name, description: null })
    editableLesson.value.directionId = created.id
    directionSelectValue.value = String(created.id)
    customDirectionName.value = ''
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    showAlert(message ? `Не удалось добавить направление: ${message}` : 'Не удалось добавить направление')
  } finally {
    isCreatingDirection.value = false
  }
}

const deleteLesson = () => {
  if (!editableLesson.value) return
  lessonToDelete.value = editableLesson.value.id
  lessonNameToDelete.value = store.getDirectionNameById(editableLesson.value.directionId)
  isConfirmOpen.value = true
}

const handleDeleteLesson = async () => {
  if (lessonToDelete.value === null) return
  try {
    await store.deleteLesson(lessonToDelete.value)
    lessonToDelete.value = null
    lessonNameToDelete.value = ''
    isConfirmOpen.value = false
    emit('close')
  } catch {
    showAlert('Не удалось удалить занятие')
  }
}

const hasConflict = () => {
  const lessons = store.lessons
  const current = editableLesson.value
  if (!current) return false

  const dayToIndex = new Map(days.value.map((day, index) => [day, index]))
  const dayCount = days.value.length
  if (dayCount === 0) return false

  type Segment = { dayIndex: number; start: number; end: number }
  const buildSegments = (lesson: LessonForm | Lesson): Segment[] => {
    const dayIndex = dayToIndex.get(lesson.day)
    if (dayIndex === undefined) return []
    const start = timeToMinutes(lesson.time)
    const end = timeToMinutes(lesson.endTime)
    if (!lesson.crossesMidnight) {
      return [{ dayIndex, start, end }]
    }
    return [
      { dayIndex, start, end: 24 * 60 },
      { dayIndex: (dayIndex + 1) % dayCount, start: 0, end },
    ]
  }

  const currentSegments = buildSegments(current)

  return lessons.some((lesson) => {
    if (lesson.id === current.id) return false
    const lessonSegments = buildSegments(lesson)
    return currentSegments.some((left) =>
      lessonSegments.some(
        (right) => left.dayIndex === right.dayIndex && left.start < right.end && left.end > right.start,
      ),
    )
  })
}

// Сохранение изменений
const saveLesson = async () => {
  if (!editableLesson.value) return

  if (directionSelectValue.value === CUSTOM_DIRECTION_VALUE) {
    showAlert('Добавьте новое направление или выберите существующее')
    return
  }

  const startMinutes = timeToMinutes(editableLesson.value.time)
  const endMinutes = timeToMinutes(editableLesson.value.endTime)
  if (!editableLesson.value.crossesMidnight && startMinutes >= endMinutes) {
    showAlert('Если занятие в рамках дня, время начала должно быть раньше времени окончания')
    return
  }
  if (editableLesson.value.crossesMidnight && startMinutes <= endMinutes) {
    showAlert('Для перехода через полночь время начала должно быть позже времени окончания')
    return
  }

  // Проверка конфликта
  if (hasConflict()) {
    showAlert('Это время уже занято другим занятием в выбранный день')
    return
  }

  if (!store.getDirectionById(editableLesson.value.directionId)) {
    showAlert('Выберите направление из списка')
    return
  }

  const hasMissingLevels = editableLesson.value.levelIds.some((levelId) => !store.getLevelById(levelId))
  if (hasMissingLevels) {
    showAlert('Выберите корректные уровни из списка')
    return
  }

  editableLesson.value.teacherIds = selectedTeacherIds.value

  try {
    if (editableLesson.value.id !== null) {
      await store.updateLesson(editableLesson.value as Lesson)
    } else {
      const newLesson: NewLesson = {
        day: editableLesson.value.day,
        time: editableLesson.value.time,
        endTime: editableLesson.value.endTime,
        crossesMidnight: editableLesson.value.crossesMidnight,
        directionId: editableLesson.value.directionId,
        levelIds: editableLesson.value.levelIds,
        teacherIds: editableLesson.value.teacherIds,
        poster: editableLesson.value.poster,
      }
      await store.addLesson(newLesson)
    }
    emit('close')
  } catch {
    showAlert('Не удалось сохранить занятие')
  }
}

// Закрытие по клавише Escape
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    if (isConfirmOpen.value || isAlertOpen.value) {
      return
    }
    emit('close')
  }
}

const handlePosterUpload = async (event: Event) => {
  if (!editableLesson.value) return
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (file) {
    try {
      const uploaded = await uploadPoster(file)
      editableLesson.value.poster = uploaded.path
    } catch {
      showAlert('Не удалось загрузить постер')
    }
  }
}

const removePoster = () => {
  if (!editableLesson.value) return
  editableLesson.value.poster = null
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50">
        <!-- Оверлей -->
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')">
          <!-- Контейнер для центрирования -->
          <div class="fixed inset-0 flex items-center justify-center p-4">
            <!-- Модальное окно -->
            <div
              class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
              @click.stop
            >
              <!-- Контент с прокруткой -->
              <div class="overflow-y-auto p-6" style="max-height: calc(90vh - 8px)">
                <template v-if="lesson && !isEditing">
                  <!-- Заголовок -->
                  <h3 class="text-2xl font-bold text-gray-900 mb-3 pr-8">
                    {{ store.getDirectionNameById(lesson.directionId) }}
                  </h3>

                  <!-- Время и уровень: на mobile уровень под временем -->
                  <div class="mb-4 text-sm">
                    <span class="bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-medium">
                      {{ lesson.time }} — {{ lesson.endTime }}
                    </span>
                    <span
                      class="mt-2 inline-flex md:mt-0 md:ml-3 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {{ store.getLevelNamesByIds(lesson.levelIds).join(', ') }}
                    </span>
                  </div>
                  <p v-if="directionDescription" class="text-sm text-gray-700 whitespace-pre-line mb-4">
                    {{ directionDescription }}
                  </p>

                  <!-- Преподаватели -->
                  <div v-if="lessonTeachers.length > 0" class="mb-6">
                    <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      {{ lessonTeachers.length > 1 ? 'Преподаватели' : 'Преподаватель' }}
                    </h4>
                    <div class="flex flex-wrap gap-4">
                      <div
                        v-for="teacher in lessonTeachers"
                        :key="teacher.id"
                        class="flex items-center gap-3 bg-gray-50 rounded-lg p-3 min-w-45"
                      >
                        <img
                          :src="resolveTeacherPhotoUrl(teacher.photo)"
                          :alt="teacher.name"
                          class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                          @error="setFallbackImage($event, DEFAULT_TEACHER_AVATAR)"
                        />
                        <p class="font-semibold text-gray-800">
                          {{ teacher.name }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <!-- Постер занятия -->
                  <div v-if="lesson.poster">
                    <img
                      :src="resolvePosterUrl(lesson.poster)"
                      :alt="store.getDirectionNameById(lesson.directionId)"
                      class="w-full mx-auto rounded-lg shadow-md"
                      @error="setFallbackImage($event, DEFAULT_EVENT_POSTER)"
                    />
                  </div>
                  <!-- Кнопки действий (только если глобальный режим редактирования) -->
                  <div v-if="isAdmin" class="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      @click="enableEditing"
                      class="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                      Редактировать
                    </button>
                    <button
                      @click="deleteLesson"
                      class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Удалить
                    </button>
                  </div>
                </template>
                <template v-else-if="editableLesson">
                  <form @submit.prevent="saveLesson" class="space-y-4">
                    <div>
                      <label for="direction" class="block text-sm font-medium text-gray-700 mb-1">
                        Направление
                      </label>
                      <select
                        id="direction"
                        :value="directionSelectValue"
                        @change="onLessonDirectionChange"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        required
                      >
                        <option v-for="direction in directions" :key="direction.id" :value="direction.id">
                          {{ direction.name }}
                        </option>
                        <option :value="CUSTOM_DIRECTION_VALUE">Свой вариант...</option>
                      </select>
                      <div v-if="directionSelectValue === CUSTOM_DIRECTION_VALUE" class="mt-2 flex gap-2">
                        <input
                          v-model="customDirectionName"
                          type="text"
                          placeholder="Новое направление"
                          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        />
                        <button
                          type="button"
                          @click="createCustomDirection"
                          :disabled="isCreatingDirection"
                          class="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-60"
                        >
                          {{ isCreatingDirection ? '...' : 'Добавить' }}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Уровни</label>
                      <p class="text-xs text-gray-500 mb-2">Если ничего не выбрано, занятие считается "Для всех".</p>
                      <div class="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                        <label v-for="level in levels" :key="level.id" class="flex items-center gap-2">
                          <input
                            type="checkbox"
                            :checked="editableLesson.levelIds.includes(level.id)"
                            @change="toggleLessonLevel($event, level.id)"
                            class="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                          />
                          <span class="text-sm text-gray-700">{{ level.name }}</span>
                        </label>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label for="startTime" class="block text-sm font-medium text-gray-700 mb-1">
                          Время начала
                        </label>
                        <input
                          id="startTime"
                          v-model="editableLesson.time"
                          type="time"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label for="endTime" class="block text-sm font-medium text-gray-700 mb-1">
                          Время окончания
                        </label>
                        <input
                          id="endTime"
                          v-model="editableLesson.endTime"
                          type="time"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <label class="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        v-model="editableLesson.crossesMidnight"
                        type="checkbox"
                        class="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                      />
                      Переходит через полночь (заканчивается на следующие сутки)
                    </label>

                    <div>
                      <label for="day" class="block text-sm font-medium text-gray-700 mb-1">
                        День недели
                      </label>
                      <select
                        id="day"
                        v-model="editableLesson.day"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      >
                        <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Преподаватели
                      </label>
                      <div
                        class="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3"
                      >
                        <label
                          v-for="teacher in store.teachers"
                          :key="teacher.id"
                          class="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            :value="teacher.id"
                            v-model="selectedTeacherIds"
                            class="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                          />
                          <img
                            :src="resolveTeacherPhotoUrl(teacher.photo)"
                            :alt="teacher.name"
                            class="w-6 h-6 rounded-full object-cover"
                          />
                          <span class="text-sm text-gray-700">{{ teacher.name }}</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Постер
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        @change="handlePosterUpload"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                      <div class="flex items-center gap-2">
                        <img
                        v-if="editableLesson.poster"
                        :src="resolvePosterUrl(editableLesson.poster)"
                        class="mt-2 w-32 object-cover rounded"
                      />
                      <button
                        v-if="editableLesson.poster"
                        type="button"
                        @click="removePoster"
                        class="mt-2 mb-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        Удалить текущий постер
                      </button>
                      </div>
                      
                      
                    </div>

                    <div class="flex gap-3 pt-4">
                      <button
                        type="submit"
                        class="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        Сохранить
                      </button>
                      <button
                        type="button"
                        @click="emit('close')"
                        class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                </template>
              </div>

              <button
                @click="emit('close')"
                class="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>


  </Teleport>

  <ConfirmModal
    :isOpen="isConfirmOpen"
    :message="`Вы уверены, что хотите удалить ${deleteEntityLabel} «${lessonNameToDelete}»?`"
    :cancelText="'Отмена'"
    @confirm="handleDeleteLesson"
    @close="isConfirmOpen = false"
  />

  <AlertModal
    :isOpen="isAlertOpen"
    :message="alertMessage"
    @close="isAlertOpen = false"
  />
</template>
