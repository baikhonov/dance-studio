<script setup lang="ts">
import Filters from '@/components/Filters.vue'
import LessonModal from '@/components/LessonModal.vue'
import LessonCard from '@/components/LessonCard.vue'
import { useScheduleStore } from '@/stores/schedule'
import { useUserStore } from '@/stores/user'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { getDirectionClass } from '@/utils/directionColors'
import type { CSSProperties } from 'vue'
import type { Lesson, NewLesson, Teacher } from '@/types/lesson'

type LessonCard = Lesson & {
  teachers: Teacher[]
  directionName: string
  levelName: string
  directionClass: string
}
type LessonDraft = NewLesson & { id: null }

const userStore = useUserStore()
const { isAdmin } = storeToRefs(userStore)

const scheduleStore = useScheduleStore()
const { days, timeSlots, filters, directions, levels } = storeToRefs(scheduleStore)

const lessonsWithTeachers = computed<Record<string, LessonCard[]>>(() => {
  const result: Record<string, LessonCard[]> = {}

  for (const day of days.value) {
    const lessonsOfDay = scheduleStore.getLessonsByDay(day)
    result[day] = lessonsOfDay.map((lesson) => {
      const directionName = scheduleStore.getDirectionNameById(lesson.directionId)

      return {
        ...lesson,
        teachers: scheduleStore.getTeachersForLesson(lesson.teacherIds),
        directionName,
        levelName: scheduleStore.getLevelNameById(lesson.levelId),
        directionClass: getDirectionClass(directionName),
      }
    })
  }

  return result
})

const filtersSection = ref<HTMLElement | null>(null)
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
  void scheduleStore.ensureLoaded()
  updateWindowWidth()
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

const SLOT_HEIGHT = 120

const sortedDirections = computed(() => [...directions.value].sort((a, b) => a.name.localeCompare(b.name)))
const sortedLevels = computed(() => [...levels.value].sort((a, b) => a.name.localeCompare(b.name)))

const filteredLessons = computed(() => scheduleStore.filteredLessons)

// Вспомогательная функция: время в минуты
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Вычисляем стиль для занятия
const getLessonStyle = (lesson: Lesson): CSSProperties => {
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
const selectedLesson = ref<Lesson | LessonDraft | null>(null)

const createEmptyLesson = (): LessonDraft => {
  const defaultDirectionId = directions.value[0]?.id ?? 0
  return {
    id: null,
    day: '',
    time: '',
    endTime: '',
    directionId: defaultDirectionId,
    levelId: null,
    teacherIds: [],
    poster: null,
    type: 'lesson',
  }
}

const openLessonModal = (lesson?: Lesson | LessonDraft) => {
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
        <Filters :directions="sortedDirections" :levels="sortedLevels" v-model="filters" />

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
            <template v-for="lesson in lessonsWithTeachers[day]" :key="lesson.id">
              <LessonCard
                :lesson="lesson"
                :direction-name="lesson.directionName"
                :level-name="lesson.levelName"
                :direction-class="lesson.directionClass"
                :card-style="getLessonStyle(lesson)"
                @select="openLessonModal(lesson)"
              />
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
/* Для скролла в основном контейнере расписания */
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
</style>
