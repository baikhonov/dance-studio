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
const scheduleHeaderTop = computed(() => Math.max(filtersHeight.value - 1, 0))

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
const COMPRESSED_SLOT_HEIGHT = 32

const sortedDirections = computed(() => [...directions.value].sort((a, b) => a.name.localeCompare(b.name)))
const sortedLevels = computed(() => [...levels.value].sort((a, b) => a.name.localeCompare(b.name)))

const filteredLessons = computed(() => scheduleStore.filteredLessons)
const isDesktop = computed(() => windowWidth.value >= 768)

// Вспомогательная функция: время в минуты
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const timeSlotMinutes = computed(() => timeSlots.value.map((time) => timeToMinutes(time)))

const slotHasLessons = computed(() =>
  timeSlotMinutes.value.map((slotStart, index, slots) => {
    const nextSlotStart = slots[index + 1]
    const fallbackInterval = index > 0 ? slotStart - slots[index - 1] : 60
    const slotEnd = nextSlotStart ?? slotStart + fallbackInterval

    return filteredLessons.value.some((lesson) => {
      const lessonStart = timeToMinutes(lesson.time)
      const lessonEnd = timeToMinutes(lesson.endTime)
      return lessonStart < slotEnd && lessonEnd > slotStart
    })
  }),
)

const timeSlotHeights = computed(() =>
  timeSlots.value.map((_, index) => {
    if (!isDesktop.value || filteredLessons.value.length === 0) {
      return SLOT_HEIGHT
    }

    return slotHasLessons.value[index] ? SLOT_HEIGHT : COMPRESSED_SLOT_HEIGHT
  }),
)

const totalGridHeight = computed(() => timeSlotHeights.value.reduce((sum, height) => sum + height, 0))

const getMinutesOffset = (targetMinutes: number): number => {
  if (timeSlotMinutes.value.length === 0 || timeSlotHeights.value.length === 0) {
    return 0
  }

  let offset = 0
  const lastIndex = timeSlotMinutes.value.length - 1

  for (let index = 0; index < lastIndex; index += 1) {
    const slotStart = timeSlotMinutes.value[index]
    const slotEnd = timeSlotMinutes.value[index + 1]
    const intervalMinutes = slotEnd - slotStart
    const slotHeight = timeSlotHeights.value[index]

    if (targetMinutes <= slotStart) {
      return offset
    }

    if (targetMinutes < slotEnd) {
      const filledMinutes = targetMinutes - slotStart
      return offset + (filledMinutes / intervalMinutes) * slotHeight
    }

    offset += slotHeight
  }

  const lastSlotStart = timeSlotMinutes.value[lastIndex]
  const fallbackInterval =
    lastIndex > 0 ? timeSlotMinutes.value[lastIndex] - timeSlotMinutes.value[lastIndex - 1] : 60
  const lastSlotHeight = timeSlotHeights.value[lastIndex] ?? SLOT_HEIGHT
  const minutesAfterLastSlot = Math.max(targetMinutes - lastSlotStart, 0)

  return offset + (minutesAfterLastSlot / fallbackInterval) * lastSlotHeight
}

const getLessonStyle = (lesson: Lesson): CSSProperties => {
  const startMinutes = timeToMinutes(lesson.time)
  const endMinutes = timeToMinutes(lesson.endTime)
  const top = getMinutesOffset(startMinutes)
  const height = getMinutesOffset(endMinutes) - top

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
      <div class="mb-2 max-md:mb-0 md:flex md:items-start md:gap-2">
        <button
          v-if="isAdmin"
          @click="openLessonModal()"
          class="mb-2 w-full md:mb-0 md:w-auto md:shrink-0 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          Добавить занятие
        </button>

        <div
          class="flex flex-row flex-nowrap items-center gap-2 pb-1 md:pb-0 md:flex-1 md:justify-end"
        >
          <div class="min-w-0 flex-1 md:flex-none">
            <Filters
              :directions="sortedDirections"
              :levels="sortedLevels"
              :filtered-count="filteredLessons.length"
              v-model="filters"
            />
          </div>

          <div
            v-if="filters.direction || filters.level"
            class="hidden md:block shrink-0 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full text-center"
          >
            Найдено: {{ filteredLessons.length }}
          </div>
        </div>
      </div>
    </div>

    <!-- СЕТКА РАСПИСАНИЯ -->
    <div class="max-h-[75dvh] overflow-x-auto overflow-y-auto md:max-h-none md:overflow-visible">
      <div class="min-w-[800px] md:min-w-0 border-gray-300">
        <!-- ШАПКА С ДНЯМИ (sticky) -->
        <div
          class="sticky top-0 z-30 grid grid-cols-[80px_repeat(7,minmax(120px,1fr))] bg-gray-100 shadow-sm"
          :style="windowWidth >= 768 ? { top: `${scheduleHeaderTop}px` } : {}"
        >
          <!-- УГЛОВАЯ ЯЧЕЙКА "Время" -->
          <div
            class="sticky left-0 z-20 flex items-center justify-center p-2 md:p-3 font-semibold text-gray-700 border border-r border-gray-300 text-center bg-gray-200 md:border-r-0 md:bg-gray-200/50"
          >
            Время
          </div>
          <!-- ДНИ НЕДЕЛИ -->
          <div
            v-for="day in days"
            :key="day"
            class="flex items-center justify-center p-2 md:p-3 font-semibold text-gray-700 text-center border border-r-0 border-gray-300 last:border-r bg-gray-200 md:bg-gray-200/50"
          >
            <span class="md:hidden">{{ day.slice(0, 11) }}</span>
            <span class="hidden md:inline">{{ day }}</span>
          </div>
        </div>

        <!-- ОСНОВНОЙ КОНТЕЙНЕР: временная сетка + занятия -->
        <div class="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))]">
          <!-- КОЛОНКА С ВРЕМЕННЫМИ МЕТКАМИ -->
          <div class="sticky left-0 z-10 bg-gray-100 md:static">
            <div
              v-for="(time, index) in timeSlots"
              :key="time"
              class="flex items-center justify-center border border-b-0 last:border-b border-gray-300 text-sm p-2 md:p-3 text-gray-600 font-medium text-center"
              :style="{ height: `${timeSlotHeights[index] ?? SLOT_HEIGHT}px` }"
            >
              {{ time }}
            </div>
          </div>

          <!-- КОЛОНКИ ДНЕЙ С ЗАНЯТИЯМИ -->
          <div
            v-for="day in days"
            :key="day"
            class="relative bg-gray-100 border border-b-0 border-r-0 border-gray-300 last:border-r"
            :style="{ minHeight: `${totalGridHeight}px` }"
          >
            <!-- ФОНОВАЯ СЕТКА (серые линии) -->
            <div
              v-for="(time, index) in timeSlots"
              :key="time"
              class="border-b border-gray-300"
              :style="{ height: `${timeSlotHeights[index] ?? SLOT_HEIGHT}px` }"
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
