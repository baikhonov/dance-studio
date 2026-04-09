<script setup>
import Filters from '@/components/Filters.vue'
import LessonModal from '@/components/LessonModal.vue'
import { useScheduleStore } from '@/stores/schedule'
import { useUserStore } from '@/stores/user'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { getDirectionClass } from '@/utils/directionColors'

const userStore = useUserStore()
const { isAdmin } = storeToRefs(userStore)

const scheduleStore = useScheduleStore()

const getTeachers = (teacherIds) => {
  return scheduleStore.getTeachersForLesson(teacherIds)
}

const filtersSection = ref(null)
const filtersHeight = ref(0)

const updateFiltersHeight = () => {
  if (filtersSection.value) {
    filtersHeight.value = filtersSection.value.offsetHeight
  }
}

const windowWidth = ref(window.innerWidth)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
  updateFiltersHeight()
}

onMounted(() => {
  updateWindowWidth()
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

const SLOT_HEIGHT = 120

const { days, timeSlots, filters } = storeToRefs(scheduleStore)

const uniqueDirections = computed(() => scheduleStore.uniqueDirections)
const uniqueLevels = computed(() => scheduleStore.uniqueLevels)

const filteredLessons = computed(() => scheduleStore.filteredLessons)

// Вспомогательная функция: время в минуты
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Вычисляем стиль для занятия
const getLessonStyle = (lesson) => {
  const startMinutes = timeToMinutes(lesson.time)
  const endMinutes = timeToMinutes(lesson.endTime)

  const firstSlotMinutes = timeToMinutes(scheduleStore.timeSlots[0])

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
    zIndex: 1,
  }
}

const isModalOpen = ref(false)
const selectedLesson = ref()

const createEmptyLesson = () => {
  return {
    id: null,
    day: '',
    time: '',
    endTime: '',
    direction: '',
    level: '',
    teacherIds: [],
    poster: null,
    type: 'lesson',
  }
}

const openLessonModal = (lesson) => {
  if (lesson) {
    selectedLesson.value = lesson
  } else {
    selectedLesson.value = createEmptyLesson()
  }
  isModalOpen.value = true
}
</script>

<template>
  <div class="schedule">
    <!-- БЛОК ФИЛЬТРОВ (sticky) -->
    <div ref="filtersSection" class="md:sticky md:top-0 z-20 bg-gray-100 py-2">
      <h2 class="text-center text-2xl font-semibold mb-4">Расписание занятий</h2>
      <div class="flex flex-col md:flex-row gap-2 justify-end items-center md:items-center mb-4">
        <button
          v-if="isAdmin"
          @click="openLessonModal()"
          class="px-4 py-2 mr-auto bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          Добавить занятие
        </button>
        <Filters :directions="uniqueDirections" :levels="uniqueLevels" v-model="filters" />

        <div
          v-if="filters.direction || filters.level"
          class="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full text-center"
        >
          Найдено: {{ filteredLessons.length }}
        </div>
      </div>
    </div>

    <!-- СЕТКА РАСПИСАНИЯ -->
    <div
      class="overflow-x-auto md:overflow-visible max-h-screen md:max-h-none overflow-y-auto md:overflow-y-visible"
    >
      <div class="min-w-[800px] md:min-w-0 border-gray-300">
        <!-- ШАПКА С ДНЯМИ (sticky) -->
        <div
          class="sticky top-0 z-11 grid grid-cols-[80px_repeat(7,minmax(120px,1fr))] bg-gray-100"
          :style="windowWidth >= 768 ? { top: `${filtersHeight}px` } : {}"
        >
          <!-- УГЛОВАЯ ЯЧЕЙКА "Время" -->
          <div
            class="sticky left-0 z-10 flex items-center justify-center p-2 md:p-3 font-semibold text-gray-700 border border-r-0 border-gray-300 text-center bg-gray-200 md:bg-gray-200/50"
          >
            Время
          </div>
          <!-- ДНИ НЕДЕЛИ -->
          <div
            v-for="day in days"
            :key="day"
            class="flex items-center justify-center p-2 md:p-3 font-semibold text-gray-700 text-center border border-r-0 border-gray-300 last:border-r bg-gray-200/50"
          >
            <span class="md:hidden">{{ day.slice(0, 11) }}</span>
            <span class="hidden md:inline">{{ day }}</span>
          </div>
        </div>

        <!-- ОСНОВНОЙ КОНТЕЙНЕР: временная сетка + занятия -->
        <div class="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))]">
          <!-- КОЛОНКА С ВРЕМЕННЫМИ МЕТКАМИ -->
          <div class="sticky left-0 z-10 bg-gray-100">
            <div
              v-for="time in timeSlots"
              :key="time"
              class="flex items-center justify-center border border-b-0 last:border-b border-gray-300 text-sm p-2 md:p-3 text-gray-600 font-medium text-center"
              :style="{ height: SLOT_HEIGHT + 'px' }"
            >
              {{ time }}
            </div>
          </div>

          <!-- КОЛОНКИ ДНЕЙ С ЗАНЯТИЯМИ -->
          <div
            v-for="day in days"
            :key="day"
            class="relative bg-gray-100 border border-b-0 border-r-0 border-gray-300 last:border-r"
            :style="{ minHeight: `${timeSlots.length * SLOT_HEIGHT}px` }"
          >
            <!-- ФОНОВАЯ СЕТКА (серые линии) -->
            <div
              v-for="time in timeSlots"
              :key="time"
              class="border-b border-gray-300"
              :style="{ height: SLOT_HEIGHT + 'px' }"
            ></div>

            <!-- КАРТОЧКИ ЗАНЯТИЙ -->
            <template v-for="lesson in scheduleStore.getLessonsByDay(day)" :key="lesson.id">
              <div
                class="absolute rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer border-l-2 md:border-l-4"
                :class="getDirectionClass(lesson.direction)"
                :style="getLessonStyle(lesson)"
                @click="openLessonModal(lesson)"
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
                  <div
                    v-if="
                      getTeachers(lesson.teacherIds) && getTeachers(lesson.teacherIds).length > 0
                    "
                    class="flex items-center justify-between mt-1 pt-1 border-t border-white/50"
                  >
                    <!-- Имена преподавателей -->
                    <p class="text-xs text-gray-700 font-medium max-w-[60%] truncate">
                      {{
                        getTeachers(lesson.teacherIds)
                          .map((t) => t.name)
                          .join(' и ')
                      }}
                    </p>

                    <!-- Фотографии преподавателей -->
                    <div class="flex shrink-0 -space-x-4 md:-space-x-2 ml-1">
                      <img
                        v-for="(teacher, idx) in getTeachers(lesson.teacherIds)"
                        :key="teacher.name"
                        :src="`/images/teachers/${teacher.photo}`"
                        :alt="teacher.name"
                        class="w-9 h-9 rounded-full border-1 md:border-2 border-white shadow-sm"
                        :class="{
                          'relative z-10': idx === 0 && getTeachers(lesson.teacherIds).length > 1,
                        }"
                        @error="$event.target.src = '/images/teachers/default-avatar.jpg'"
                      />
                    </div>
                  </div>
                  <!-- Постер мероприятия -->
                  <div
                    v-else-if="lesson.type === 'event'"
                    class="flex items-center justify-end mt-1 pt-1 border-t border-white/50"
                  >
                    <img
                      v-if="lesson.poster"
                      :src="`/images/posters/${lesson.poster}`"
                      :alt="lesson.direction"
                      class="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
                    />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- МОДАЛКА ДЕТАЛЬНОЙ ИНФОРМАЦИИ -->
    <LessonModal
      :lesson="selectedLesson"
      :isOpen="isModalOpen"
      :isAdmin="isAdmin"
      @close="isModalOpen = false"
    />
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
