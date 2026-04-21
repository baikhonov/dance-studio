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

const SLOT_HEIGHT = 110
const COMPRESSED_SLOT_HEIGHT = 32
const LONG_LESSON_THRESHOLD_MINUTES = 90
const LONG_ONLY_SLOT_HEIGHT = Math.round(SLOT_HEIGHT * 0.5)

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
const slotDurations = computed(() =>
  timeSlotMinutes.value.map((slotStart, index, slots) => {
    const nextSlotStart = slots[index + 1]
    const fallbackInterval = index > 0 ? slotStart - slots[index - 1] : 60
    return (nextSlotStart ?? slotStart + fallbackInterval) - slotStart
  }),
)

const slotOccupancy = computed(() =>
  timeSlotMinutes.value.map((slotStart, index, slots) => {
    const nextSlotStart = slots[index + 1]
    const fallbackInterval = index > 0 ? slotStart - slots[index - 1] : 60
    const slotEnd = nextSlotStart ?? slotStart + fallbackInterval

    let hasAny = false
    let hasShort = false

    filteredLessons.value.forEach((lesson) => {
      const lessonStart = timeToMinutes(lesson.time)
      const lessonEnd = lesson.crossesMidnight ? 24 * 60 : timeToMinutes(lesson.endTime)
      const intersects = lessonStart < slotEnd && lessonEnd > slotStart
      if (!intersects) return

      hasAny = true
      const lessonDuration = lesson.crossesMidnight
        ? 24 * 60 - lessonStart + timeToMinutes(lesson.endTime)
        : lessonEnd - lessonStart
      if (lessonDuration < LONG_LESSON_THRESHOLD_MINUTES) {
        hasShort = true
      }
    })

    return {
      hasAny,
      isLongOnly: hasAny && !hasShort,
    }
  }),
)

type TimelineSegment = {
  startMinutes: number
  endMinutes: number
  height: number
}

type TimeRow = {
  key: string
  label: string
  height: number
}

const timelineSegments = computed<TimelineSegment[]>(() => {
  const segments: TimelineSegment[] = []
  const minutes = timeSlotMinutes.value
  const durations = slotDurations.value
  const occupancy = slotOccupancy.value

  let index = 0
  while (index < minutes.length) {
    const startMinutes = minutes[index]

    if (occupancy[index]?.hasAny) {
      const endMinutes = startMinutes + durations[index]
      segments.push({
        startMinutes,
        endMinutes,
        height: occupancy[index].isLongOnly ? LONG_ONLY_SLOT_HEIGHT : SLOT_HEIGHT,
      })
      index += 1
      continue
    }

    let endIndex = index
    while (endIndex + 1 < minutes.length && !occupancy[endIndex + 1]?.hasAny) {
      endIndex += 1
    }

    const endMinutes = minutes[endIndex] + durations[endIndex]
    segments.push({
      startMinutes,
      endMinutes,
      height: COMPRESSED_SLOT_HEIGHT,
    })
    index = endIndex + 1
  }

  return segments
})

const toTimeLabel = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

const timeRows = computed<TimeRow[]>(() =>
  timelineSegments.value.map((segment) => {
    const duration = segment.endMinutes - segment.startMinutes
    const label =
      duration > 60
        ? `${toTimeLabel(segment.startMinutes)}-${toTimeLabel(segment.endMinutes)}`
        : toTimeLabel(segment.startMinutes)

    return {
      key: `${segment.startMinutes}-${segment.endMinutes}`,
      label,
      height: segment.height,
    }
  }),
)

const totalGridHeight = computed(() => timeRows.value.reduce((sum, row) => sum + row.height, 0))

const getMinutesOffset = (targetMinutes: number): number => {
  const segments = timelineSegments.value
  if (segments.length === 0) {
    return 0
  }

  let offset = 0
  const lastIndex = segments.length - 1

  for (let index = 0; index < lastIndex; index += 1) {
    const slotStart = segments[index].startMinutes
    const slotEnd = segments[index].endMinutes
    const intervalMinutes = slotEnd - slotStart
    const slotHeight = segments[index].height

    if (targetMinutes <= slotStart) {
      return offset
    }

    if (targetMinutes < slotEnd) {
      const filledMinutes = targetMinutes - slotStart
      return offset + (filledMinutes / intervalMinutes) * slotHeight
    }

    offset += slotHeight
  }

  const lastSegment = segments[lastIndex]
  const lastSlotStart = lastSegment.startMinutes
  const fallbackInterval = lastSegment.endMinutes - lastSegment.startMinutes || 60
  const lastSlotHeight = lastSegment.height
  const minutesAfterLastSlot = Math.max(targetMinutes - lastSlotStart, 0)

  return offset + (minutesAfterLastSlot / fallbackInterval) * lastSlotHeight
}

const getLessonStyle = (lesson: Lesson): CSSProperties => {
  const startMinutes = timeToMinutes(lesson.time)
  const endMinutes = lesson.crossesMidnight ? 24 * 60 : timeToMinutes(lesson.endTime)
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
    crossesMidnight: false,
    directionId: defaultDirectionId,
    levelId: null,
    teacherIds: [],
    poster: null,
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
      <div class="mx-auto min-w-[870px] md:min-w-0 md:max-w-[1280px] border-gray-300">
        <!-- ШАПКА С ДНЯМИ (sticky) -->
        <div
          class="sticky top-0 z-30 grid grid-cols-[90px_repeat(7,minmax(110px,1fr))] bg-gray-100 shadow-sm"
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
        <div class="grid grid-cols-[90px_repeat(7,minmax(110px,1fr))]">
          <!-- КОЛОНКА С ВРЕМЕННЫМИ МЕТКАМИ -->
          <div class="sticky left-0 z-10 bg-gray-100 md:static">
            <div
              v-for="row in timeRows"
              :key="row.key"
              class="flex items-center justify-center whitespace-nowrap border border-b-0 last:border-b border-gray-300 text-sm p-2 md:p-3 text-gray-600 font-medium text-center"
              :style="{ height: `${row.height}px` }"
            >
              {{ row.label }}
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
              v-for="row in timeRows"
              :key="row.key"
              class="border-b border-gray-300"
              :style="{ height: `${row.height}px` }"
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
