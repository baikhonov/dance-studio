<script setup>
// ============================================
// 1. ИМПОРТЫ
// ============================================
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import { storeToRefs } from 'pinia'

// ============================================
// 2. PROPS (данные от родителя)
// ============================================
const props = defineProps({
  lesson: Object, // Текущее занятие для просмотра/редактирования
  isOpen: Boolean, // Открыта ли модалка
  isAdmin: Boolean, // Режим админа на главной странице
})

// ============================================
// 3. EMITS (события для родителя)
// ============================================
const emit = defineEmits(['close'])

// ============================================
// 4. STORE (глобальное состояние)
// ============================================
const store = useScheduleStore()
const { days } = storeToRefs(store) // Список дней недели из store

// ============================================
// 5. ЛОКАЛЬНОЕ СОСТОЯНИЕ (реактивные переменные)
// ============================================
const isEditing = ref(false) // Режим редактирования формы внутри модалки
const editableLesson = ref(null) // Копия занятия для редактирования
const selectedTeacherIds = ref([])

// ============================================
// 6. WATCH (следим за изменением пропсов)
// ============================================
// При открытии модалки с новым занятием — создаем копию для редактирования
watch(
  () => props.lesson,
  (newLesson) => {
    if (newLesson) {
      isEditing.value = false // Сбрасываем режим редактирования формы
      editableLesson.value = JSON.parse(JSON.stringify(newLesson)) // Глубокая копия
    }
  },
  { immediate: true },
) // immediate = true — запускается сразу при монтировании

// При открытии модалки синхронизировать selectedTeacherIds с editableLesson.teacherIds
watch(
  () => editableLesson.value,
  (newLesson) => {
    if (newLesson) {
      selectedTeacherIds.value = [...(newLesson.teacherIds || [])]
    }
  },
  { immediate: true },
)

// ============================================
// 6. COMPUTED (вычисляемые значения)
// ============================================
const lessonTeachers = computed(() => {
  if (!props.lesson?.teacherIds) return []
  return props.lesson.teacherIds.map((id) => store.getTeacherById(id)).filter(Boolean)
})
// ============================================
// 7. МЕТОДЫ (функции-обработчики)
// ============================================

// Переключение в режим редактирования формы
const enableEditing = () => {
  isEditing.value = true
}

// Удаление занятия
const deleteLesson = () => {
  if (confirm('Удалить занятие?')) {
    store.deleteLesson(props.lesson.id)
    emit('close') // Закрываем модалку после удаления
  }
}

const hasConflict = () => {
  const lessons = store.lessons
  const current = editableLesson.value

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
  // Проверка времени
  if (editableLesson.value.time >= editableLesson.value.endTime) {
    alert('Время начала должно быть раньше времени окончания')
    return
  }

  // Проверка конфликта
  if (hasConflict()) {
    alert('Это время уже занято другим занятием в выбранный день')
    return
  }

  editableLesson.value.teacherIds = selectedTeacherIds.value
  store.updateLesson(editableLesson.value)
  emit('close')
}

// ============================================
// 8. ЖИЗНЕННЫЙ ЦИКЛ (хуки)
// ============================================

// Закрытие по клавише Escape
const handleEscape = (event) => {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close')
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
              class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden"
              @click.stop
            >
              <!-- Контент с прокруткой -->
              <div class="overflow-y-auto p-6" style="max-height: calc(85vh - 8px)">
                <template v-if="!isEditing">
                  <!-- Заголовок -->
                  <h3 class="text-2xl font-bold text-gray-900 mb-3 pr-8">
                    {{ lesson.direction }}
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
                  <div v-if="lesson.teacherIds && lesson.teacherIds.length > 0" class="mb-6">
                    <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      {{ lesson.teacherIds.length > 1 ? 'Преподаватели' : 'Преподаватель' }}
                    </h4>
                    <div class="flex flex-wrap gap-4">
                      <div
                        v-for="teacherId in lesson.teacherIds"
                        :key="teacherId"
                        class="flex items-center gap-3 bg-gray-50 rounded-lg p-3 min-w-[180px]"
                      >
                        <img
                          :src="`/images/teachers/${store.getTeacherById(teacherId).photo}`"
                          :alt="store.getTeacherById(teacherId).name"
                          class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                          @error="$event.target.src = '/images/teachers/default-avatar.jpg'"
                        />
                        <p class="font-semibold text-gray-800">
                          {{ store.getTeacherById(teacherId).name }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <!-- Постер мероприятия -->
                  <div v-else-if="lesson.type === 'party' && lesson.poster">
                    <img
                      :src="`/images/posters/${lesson.poster}`"
                      :alt="lesson.direction"
                      class="w-full mx-auto rounded-lg shadow-md"
                      @error="$event.target.src = '/images/events/default-party.jpg'"
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
                <template v-else>
                  <form @submit.prevent="saveLesson" class="space-y-4">
                    <div>
                      <label for="direction" class="block text-sm font-medium text-gray-700 mb-1">
                        Направление
                      </label>
                      <input
                        id="direction"
                        v-model="editableLesson.direction"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        required
                      />
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

                    <!-- Для занятия: выбор преподавателей -->
                    <div v-if="editableLesson.type !== 'party'">
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
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Постер (имя файла)
                      </label>
                      <input
                        v-model="editableLesson.poster"
                        type="text"
                        placeholder="party-bachatamania.webp"
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

              <!-- Крестик в углу -->
              <button
                @click="emit('close')"
                class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
</template>
