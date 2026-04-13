<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import { storeToRefs } from 'pinia'
import AlertModal from '@/components/AlertModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
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
const { days, directions } = storeToRefs(store)

const isEditing = ref(false)
const editableLesson = ref<LessonForm | null>(null)
const selectedTeacherIds = ref<number[]>([])
const isConfirmOpen = ref(false)
const isAlertOpen = ref(false)
const alertMessage = ref('')
const lessonToDelete = ref<number | null>(null)
const lessonNameToDelete = ref('')
const deleteEntityLabel = computed(() =>
  editableLesson.value?.type === 'event' ? 'мероприятие' : 'занятие',
)

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
          directionId: directions.value[0]?.id ?? 0,
          level: '',
          teacherIds: [],
          type: 'lesson',
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
          directionId: directions.value[0]?.id ?? 0,
          level: '',
          teacherIds: [],
          type: 'lesson',
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
    }
  },
  { immediate: true },
)

watch(
  () => editableLesson.value?.type,
  (newType) => {
    if (!editableLesson.value) return

    if (newType === 'event') {
      editableLesson.value.teacherIds = []
      selectedTeacherIds.value = []
    } else if (newType === 'lesson') {
      editableLesson.value.poster = null
    }
  },
)

const lessonTeachers = computed(() => {
  if (!props.lesson?.teacherIds) return []
  return props.lesson.teacherIds
    .map((id) => store.getTeacherById(id))
    .filter((teacher): teacher is Teacher => Boolean(teacher))
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
const enableEditing = () => {
  isEditing.value = true
}

const deleteLesson = () => {
  if (!editableLesson.value) return
  lessonToDelete.value = editableLesson.value.id
  lessonNameToDelete.value = store.getDirectionNameById(editableLesson.value.directionId)
  isConfirmOpen.value = true
}

const handleDeleteLesson = () => {
  if (lessonToDelete.value === null) return
  store.deleteLesson(lessonToDelete.value)
  lessonToDelete.value = null
  lessonNameToDelete.value = ''
  isConfirmOpen.value = false
  emit('close')
}

const hasConflict = () => {
  const lessons = store.lessons
  const current = editableLesson.value
  if (!current) return false

  return lessons.some((lesson) => {
    // Пропускаем само редактируемое занятие
    if (lesson.id === current.id) return false

    // Проверяем только занятия в выбранный день
    if (lesson.day !== current.day) return false

    const start1 = current.time
    const end1 = current.endTime
    const start2 = lesson.time
    const end2 = lesson.endTime

    // Проверка пересечения интервалов
    return start1 < end2 && end1 > start2
  })
}

// Сохранение изменений
const saveLesson = () => {
  if (!editableLesson.value) return

  // Проверка времени
  if (editableLesson.value.time >= editableLesson.value.endTime) {
    showAlert('Время начала должно быть раньше времени окончания')
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

  editableLesson.value.teacherIds = selectedTeacherIds.value

  if (editableLesson.value.id !== null) {
    store.updateLesson(editableLesson.value as Lesson)
  } else {
    const newLesson: NewLesson = {
      day: editableLesson.value.day,
      time: editableLesson.value.time,
      endTime: editableLesson.value.endTime,
      directionId: editableLesson.value.directionId,
      level: editableLesson.value.level,
      teacherIds: editableLesson.value.teacherIds,
      type: editableLesson.value.type,
      poster: editableLesson.value.poster,
    }
    store.addLesson(newLesson)
  }
  emit('close')
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

const handlePosterUpload = (event: Event) => {
  if (!editableLesson.value) return
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (file) {
    // Пока сохраняем имя файла
    editableLesson.value.poster = file.name
    // В будущем: загрузка на сервер
  }
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

                  <!-- Время и уровень в одной строке -->
                  <div class="flex items-center gap-3 mb-4 text-sm">
                    <span class="bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-medium">
                      {{ lesson.time }} — {{ lesson.endTime }}
                    </span>
                    <span
                      v-if="lesson.level"
                      class="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {{ lesson.level }}
                    </span>
                  </div>

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
                          :src="`/images/teachers/${teacher.photo}`"
                          :alt="teacher.name"
                          class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                          @error="setFallbackImage($event, '/images/teachers/default-avatar.jpg')"
                        />
                        <p class="font-semibold text-gray-800">
                          {{ teacher.name }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <!-- Постер мероприятия -->
                  <div v-else-if="lesson.type === 'event' && lesson.poster">
                    <img
                      :src="`/images/posters/${lesson.poster}`"
                      :alt="store.getDirectionNameById(lesson.directionId)"
                      class="w-full mx-auto rounded-lg shadow-md"
                      @error="setFallbackImage($event, '/images/events/default-party.jpg')"
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
                        v-model.number="editableLesson.directionId"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        required
                      >
                        <option v-for="direction in directions" :key="direction.id" :value="direction.id">
                          {{ direction.name }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label for="level" class="block text-sm font-medium text-gray-700 mb-1">
                        Уровень
                      </label>
                      <input
                        id="level"
                        v-model="editableLesson.level"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
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
                      <label class="block text-sm font-medium text-gray-700 mb-1"
                        >Тип занятия</label
                      >
                      <select
                        v-model="editableLesson.type"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="lesson">Занятие</option>
                        <option value="event">Мероприятие</option>
                      </select>
                    </div>

                    <!-- Для занятия: выбор преподавателей -->
                    <div v-if="editableLesson.type !== 'event'">
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
                            :src="`/images/teachers/${teacher.photo}`"
                            :alt="teacher.name"
                            class="w-6 h-6 rounded-full object-cover"
                          />
                          <span class="text-sm text-gray-700">{{ teacher.name }}</span>
                        </label>
                      </div>
                    </div>

                    <!-- Для вечеринки: поле для постера -->
                    <div v-else>
                      <img
                        v-if="editableLesson.poster"
                        :src="`/images/posters/${editableLesson.poster}`"
                        class="mt-2 w-32 h-32 object-cover rounded"
                      />
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Постер (имя файла)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        @change="handlePosterUpload"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
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
