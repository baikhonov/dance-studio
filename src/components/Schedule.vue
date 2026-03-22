<script setup>
import Filters from '@/components/Filters.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const filtersSection = ref(null)
const filtersHeight = ref(0)

const updateFiltersHeight = () => {
  if (filtersSection.value) {
    // offsetHeight включает высоту элемента + padding + border
    filtersHeight.value = filtersSection.value.offsetHeight
  }
}

onMounted(() => {
  updateFiltersHeight()
  window.addEventListener('resize', updateFiltersHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateFiltersHeight)
})

const SLOT_HEIGHT = 120
const props = defineProps({
  days: Array,
  timeSlots: Array,
  lessons: Array,
})

const uniqueDirections = computed(() => {
  const dirs = [...new Set(props.lessons?.map((lesson) => lesson.direction).filter(Boolean))]
  return dirs.sort()
})

const uniqueLevels = computed(() => {
  const levels = [...new Set(props.lessons?.map((lesson) => lesson.level).filter(Boolean))]
  return levels.filter(
    (level) => level.toLowerCase() !== 'для всех' && level.toLowerCase() !== 'все уровни',
  )
})

const filters = ref({
  direction: '',
  level: '',
})

const filteredLessons = computed(() => {
  if (!props.lessons) return []

  const lessons = props.lessons.filter((lesson) => {
    let matchDirection = true

    if (filters.value.direction) {
      // если фильтр активен — сравниваем
      matchDirection = lesson.direction.toLowerCase() === filters.value.direction.toLowerCase()
    }

    let matchLevel = true

    if (filters.value.level) {
      // если фильтр активен — сравниваем (с защитой от отсутствия level)
      const lessonLevel = lesson.level?.toLowerCase()
      const selectedLevel = filters.value.level.toLowerCase()
      matchLevel = lessonLevel === selectedLevel || lessonLevel === 'для всех'
    }

    return matchDirection && matchLevel
  })

  return lessons
})

// Вспомогательная функция: время в минуты
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Получаем занятия для конкретного дня
const getLessonsForDay = (day) => {
  return filteredLessons.value?.filter((lesson) => lesson.day === day) || []
}

// Вычисляем стиль для занятия
const getLessonStyle = (lesson) => {
  const startMinutes = timeToMinutes(lesson.time)
  const endMinutes = timeToMinutes(lesson.endTime)

  const firstSlotMinutes = timeToMinutes(props.timeSlots[0])

  const minutesFromStart = startMinutes - firstSlotMinutes
  const top = (minutesFromStart / 60) * SLOT_HEIGHT

  const durationHours = (endMinutes - startMinutes) / 60
  const height = durationHours * SLOT_HEIGHT

  return {
    position: 'absolute',
    top: `${top + 3}px`,
    left: '3px',
    right: '3px',
    height: `${height - 6}px`,
    zIndex: 10,
  }
}

const directionStyles = {
  lady: 'border-purple-600 bg-purple-100 hover:bg-purple-200',
  пар: 'border-orange-600 bg-orange-100 hover:bg-orange-200',
  растяжка: 'border-blue-600 bg-blue-100 hover:bg-blue-200',
  stretching: 'border-blue-600 bg-blue-100 hover:bg-blue-200',
  общее: 'border-teal-600 bg-teal-100 hover:bg-teal-200',
  party: 'border-red-600 bg-red-100 hover:bg-red-200',
  вечеринка: 'border-red-600 bg-red-100 hover:bg-red-200',
}

const getDirectionClass = (direction) => {
  const lower = direction.toLowerCase()
  for (const [key, value] of Object.entries(directionStyles)) {
    if (lower.includes(key)) return value
  }
  return 'border-amber-600 bg-amber-100 hover:bg-amber-200'
}
</script>

<template>
  <div class="schedule">
    <div ref="filtersSection" class="sticky top-0 z-20 bg-gray-100 pb-2">
      <h2 class="text-center text-2xl font-semibold mb-4">Расписание занятий</h2>
      <div class="flex gap-2 justify-end items-center mb-4">
        <Filters :directions="uniqueDirections" :levels="uniqueLevels" v-model="filters" />

        <div
          v-if="filters.direction || filters.level"
          class="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full"
        >
          Найдено: {{ filteredLessons.length }}
        </div>
      </div>
    </div>

    <!-- СЕТКА: Внешний контейнер -->
    <div class="border border-t-0 border-gray-300">
      <!-- ШАПКА С ДНЯМИ -->
      <div
        class="sticky z-11 grid grid-cols-[80px_repeat(7,1fr)] bg-gray-100 border-t border-b border-gray-300"
        :style="{ top: `${filtersHeight}px` }"
      >
        <div
          class="p-3 font-semibold text-gray-700 border-r border-gray-300 text-center bg-gray-200/50"
        >
          Время
        </div>
        <div
          v-for="day in days"
          :key="day"
          class="p-3 font-semibold text-gray-700 text-center border-r border-gray-300 last:border-r-0 bg-gray-200/50"
        >
          {{ day }}
        </div>
      </div>

      <!-- ОСНОВНОЙ КОНТЕЙНЕР: временная сетка + занятия -->
      <div class="grid grid-cols-[80px_repeat(7,1fr)]">
        <!-- Колонка с временными метками -->
        <div class="bg-gray-100">
          <div
            v-for="time in timeSlots"
            :key="time"
            class="border-b border-r border-gray-300 text-sm p-2 text-gray-600 font-medium text-center"
            :style="{ height: SLOT_HEIGHT + 'px' }"
          >
            {{ time }}
          </div>
        </div>

        <!-- Колонки дней с занятиями -->
        <div
          v-for="day in days"
          :key="day"
          class="relative bg-gray-100 border-r border-gray-300 last:border-r-0"
          :style="{ minHeight: `${timeSlots.length * SLOT_HEIGHT}px` }"
        >
          <!-- Фоновая сетка -->
          <div
            v-for="time in timeSlots"
            :key="time"
            class="border-b border-gray-300"
            :style="{ height: SLOT_HEIGHT + 'px' }"
          ></div>

          <!-- Занятия поверх сетки -->
          <template v-auto-animate v-for="lesson in getLessonsForDay(day)" :key="lesson.id">
            <div
              class="absolute rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer border-l-4"
              :class="getDirectionClass(lesson.direction)"
              :style="getLessonStyle(lesson)"
            >
              <!-- Контент занятия -->
              <div class="h-full p-1.5 flex flex-col text-[10px] overflow-y-auto">
                <!-- Название -->
                <p
                  class="shrink-0 font-bold text-xs leading-tight truncate text-gray-900"
                  :title="lesson.direction"
                >
                  {{ lesson.direction }}
                </p>

                <!-- Уровень -->
                <p v-if="lesson.level" class="text-xs text-gray-700 mt-0.5 font-medium">
                  {{ lesson.level }}
                </p>

                <!-- Время на полупрозрачном фоне -->
                <div
                  class="text-xs font-medium mt-1 bg-white/50 px-1 py-0.5 rounded inline-block self-start"
                >
                  {{ lesson.time }}—{{ lesson.endTime }}
                </div>

                <!-- Преподаватели -->
                <div class="flex items-center justify-between mt-1 pt-1 border-t border-white/50">
                  <!-- Имена преподавателей -->
                  <p class="text-xs text-gray-700 font-medium max-w-[60%] truncate">
                    {{ lesson.teachers.map((t) => t.name).join(' & ') }}
                  </p>

                  <!-- Фотографии преподавателей -->
                  <div class="flex shrink-0 -space-x-2 ml-1">
                    <img
                      v-for="(teacher, idx) in lesson.teachers"
                      :key="teacher.name"
                      :src="`/images/teachers/${teacher.photo}`"
                      :alt="teacher.name"
                      class="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                      :class="{ 'relative z-10': idx === 0 && lesson.teachers.length > 1 }"
                      @error="$event.target.src = '/images/teachers/default-avatar.jpg'"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Для скролла внутри длинных занятий */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #999 #e0e0e0;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #e0e0e0;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #999;
  border-radius: 4px;
}

/* Улучшаем читаемость текста на цветном фоне */
.text-gray-900 {
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}
</style>
