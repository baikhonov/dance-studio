<script setup>
const props = defineProps({
  days: Array,
  timeSlots: Array,
  lessons: Array,
})

// Функция поиска занятия для конкретного времени и дня
const getLessonForSlot = (time, day) => {
  return props.lessons?.find((lesson) => lesson.time === time && lesson.day === day)
}
</script>

<template>
  <div class="schedule">
    <h2 class="text-center text-2xl font-semibold mb-4">Расписание занятий</h2>

    <!-- СЕТКА: Внешний контейнер -->
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <!-- ШАПКА С ДНЯМИ (первая строка) -->
      <div class="grid grid-cols-[80px_repeat(7,1fr)] bg-gray-50 border-b border-gray-200">
        <!-- Угловая ячейка (пустая) -->
        <div class="p-3 font-medium text-gray-600 border-r border-gray-200">Время</div>

        <!-- Дни недели -->
        <div
          v-for="day in days"
          :key="day"
          class="p-3 font-medium text-gray-600 text-center border-r border-gray-200 last:border-r-0"
        >
          {{ day }}
        </div>
      </div>

      <!-- СТРОКИ С ВРЕМЕНЕМ -->
      <div
        v-for="time in timeSlots"
        :key="time"
        class="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-200 last:border-b-0"
      >
        <!-- Колонка с временем -->
        <div class="p-3 bg-gray-50 border-r border-gray-200 font-medium text-gray-700">
          {{ time }}
        </div>

        <!-- Ячейки для каждого дня -->
        <div
          v-for="day in days"
          :key="day"
          class="p-2 min-h-[30px] border-r border-gray-200 relative"
        >
          <!-- Сначала получаем урок -->
          <template v-if="lesson = getLessonForSlot(time, day)">
            <div
              class="bg-amber-50 p-2 rounded border-l-4 border-amber-500 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full flex flex-col"
              :class="{
                'border-purple-500 bg-purple-50': lesson.direction.includes('Contemporary'),
                'border-orange-500 bg-orange-50': lesson.direction.includes('Bachata'),
                'border-blue-500 bg-blue-50': lesson.direction.includes('Hip-Hop'),
              }"
            >
              <!-- Верхняя часть: направление и уровень -->
              <div class="flex-1">
                <p class="font-bold text-sm leading-tight text-gray-800">{{ lesson.direction }}</p>
                <p class="text-xs text-gray-600 mt-0.5">{{ lesson.level }}</p>
              </div>

              <!-- Нижняя часть: преподаватели -->
              <div
                class="flex items-center justify-between mt-2 pt-1 border-t border-amber-200/50"
                :class="{
                  'border-purple-200/50': lesson.direction.includes('Contemporary'),
                  'border-orange-200/50': lesson.direction.includes('Bachata'),
                  'border-blue-200/50': lesson.direction.includes('Hip-Hop'),
                }"
              >
                <!-- Имена преподавателей -->
                <p class="text-xs text-gray-500 truncate max-w-[60%]">
                  {{ lesson.teachers.map((t) => t.name).join(' & ') }}
                </p>

                <!-- Фотографии преподавателей -->
                <div class="flex -space-x-2 ml-1">
                  <img
                    v-for="(teacher, idx) in lesson.teachers"
                    :key="teacher.name"
                    :src="`/images/teachers/${teacher.photo}`"
                    :alt="teacher.name"
                    class="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    :class="{ 'relative z-10': idx === 0 && lesson.teachers.length > 1 }"
                    @error="$event.target.src = '/images/teachers/default-avatar.jpg'"
                  />
                </div>
              </div>
            </div>
          </template>

          <!-- Пустая ячейка -->
          <div v-else class="text-xs text-gray-300 h-full flex items-center justify-center">—</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
