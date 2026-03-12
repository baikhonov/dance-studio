<script setup>
import { computed } from 'vue'

const SLOT_HEIGHT = 120 // или 100, или 120 - экспериментируй
const props = defineProps({
  days: Array,
  timeSlots: Array,
  lessons: Array,
})

// Вспомогательная функция: время в минуты
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Получаем занятия для конкретного дня
const getLessonsForDay = (day) => {
  return props.lessons?.filter((lesson) => lesson.day === day) || []
}

// Вычисляем стиль для занятия
const getLessonStyle = (lesson) => {
  const startMinutes = timeToMinutes(lesson.time)
  const endMinutes = timeToMinutes(lesson.endTime)

  // Находим индекс первого временного слота (09:00)
  const firstSlotMinutes = timeToMinutes(props.timeSlots[0])

  // Позиция сверху: (время начала - первый слот) / высота слота
  const minutesFromStart = startMinutes - firstSlotMinutes
  const top = (minutesFromStart / 60) * SLOT_HEIGHT

  // Высота: длительность в часах * высота слота
  const durationHours = (endMinutes - startMinutes) / 60
  const height = durationHours * SLOT_HEIGHT

  return {
    position: 'absolute',
    top: `${top + 3}px`,
    left: '3px',
    right: '3px',
    height: `${height - 6}px`,
    zIndex: 1,
  }
}

const directionStyles = {
  lady: 'border-purple-500 bg-purple-50',
  bachata: 'border-orange-500 bg-orange-50',
  растяжка: 'border-blue-500 bg-blue-50',
  stretching: 'border-blue-500 bg-blue-50',
  contemporary: 'border-teal-500 bg-teal-50',
  party: 'border-red-500 bg-red-50',
}

const getDirectionClass = (direction) => {
  const lower = direction.toLowerCase()
  for (const [key, value] of Object.entries(directionStyles)) {
    if (lower.includes(key)) return value
  }
  return 'border-amber-500 bg-amber-50' // дефолтный класс
}
</script>

<template>
  <div class="schedule">
    <h2 class="text-center text-2xl font-semibold mb-4">Расписание занятий</h2>

    <!-- СЕТКА: Внешний контейнер -->
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <!-- ШАПКА С ДНЯМИ -->
      <div class="grid grid-cols-[80px_repeat(7,1fr)] bg-gray-50 border-b border-gray-200">
        <div class="p-3 font-medium text-gray-600 border-r border-gray-200 text-center">Время</div>
        <div
          v-for="day in days"
          :key="day"
          class="p-3 font-medium text-gray-600 text-center border-r border-gray-200 last:border-r-0"
        >
          {{ day }}
        </div>
      </div>

      <!-- ОСНОВНОЙ КОНТЕЙНЕР: временная сетка + занятия -->
      <div class="grid grid-cols-[80px_repeat(7,1fr)]">
        <!-- Колонка с временными метками -->
        <div class="bg-gray-50">
          <div
            v-for="time in timeSlots"
            :key="time"
            class="border-b border-r border-gray-200 text-sm p-2 text-gray-500 text-center"
            :style="{ height: SLOT_HEIGHT + 'px' }"
          >
            {{ time }}
          </div>
        </div>

        <!-- Колонки дней с занятиями -->
        <div
          v-for="day in days"
          :key="day"
          class="relative bg-gray-50 border-r border-gray-200 last:border-r-0"
          :style="{ minHeight: `${timeSlots.length * 60}px` }"
        >
          <!-- Фоновая сетка (серые линии) -->
          <div
            v-for="time in timeSlots"
            :key="time"
            class="border-b border-gray-200"
            :style="{ height: SLOT_HEIGHT + 'px' }"
          ></div>

          <!-- Занятия поверх сетки -->
          <template v-for="lesson in getLessonsForDay(day)" :key="lesson.id">
            <div
              class="absolute rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              :class="getDirectionClass(lesson.direction)"
              :style="getLessonStyle(lesson)"
            >
              <!-- Контент занятия -->
              <div class="h-full p-1.5 flex flex-col text-[10px] overflow-y-auto">
                <!-- Название -->
                <p
                  class="shrink-0 font-bold text-xs leading-tight truncate"
                  :title="lesson.direction"
                >
                  {{ lesson.direction }}
                </p>

                <!-- Уровень (если есть) -->
                <p v-if="lesson.level" class="text-xs text-gray-600 mt-0.5">
                  {{ lesson.level }}
                </p>

                <div class="text-xs font-medium mt-1">{{ lesson.time }}—{{ lesson.endTime }}</div>

                <!-- Преподаватели -->
                <div
                  class="flex items-center justify-between mt-1 pt-1 border-t border-amber-200/50"
                  :class="'border-orange-200/50'"
                >
                  <!-- Имена преподавателей -->
                  <p class="text-xs text-gray-500 max-w-[60%]">
                    {{ lesson.teachers.map((t) => t.name).join(' & ') }}
                  </p>

                  <!-- Фотографии преподавателей -->
                  <div class="flex shrink-0 -space-x-2 ml-1">
                    <img
                      v-for="(teacher, idx) in lesson.teachers"
                      :key="teacher.name"
                      :src="`/images/teachers/${teacher.photo}`"
                      :alt="teacher.name"
                      class="w-10 h-10 rounded-full border-2 border-white shadow-sm"
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
  scrollbar-color: #ccc #f0f0f0;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
</style>
