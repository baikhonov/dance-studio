import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as scheduleApi from '@/api/schedule'
import type {
  Direction,
  Filters,
  Level,
  Lesson,
  NewDirection,
  NewLesson,
  NewLevel,
  NewTeacher,
  Teacher,
} from '@/types/lesson'

export const useScheduleStore = defineStore('schedule', () => {
  const days = ref<string[]>([
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье',
  ])

  const timeSlots = ref<string[]>([
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
  ])

  const lessons = ref<Lesson[]>([])
  const directions = ref<Direction[]>([])
  const teachers = ref<Teacher[]>([])
  const levels = ref<Level[]>([])
  const isLoaded = ref(false)
  const isLoading = ref(false)

  const filters = ref<Filters>({
    direction: null,
    level: null,
  })

  const uniqueDirections = computed(() => {
    return [...directions.value]
      .map((direction) => direction.name)
      .filter(Boolean)
      .sort()
  })

  const filteredLessons = computed(() => {
    return lessons.value.filter((lesson) => {
      let matchDirection = true
      if (filters.value.direction !== null) {
        matchDirection = lesson.directionId === filters.value.direction
      }

      let matchLevel = true
      if (filters.value.level !== null) {
        matchLevel = lesson.levelId === null || lesson.levelId === filters.value.level
      }

      return matchDirection && matchLevel
    })
  })

  const getLessonsByDay = (day: string): Lesson[] => {
    return filteredLessons.value.filter((lesson) => lesson.day === day)
  }

  const getTeacherById = (id: number): Teacher | undefined => {
    return teachers.value.find((teacher) => teacher.id === id)
  }

  const getDirectionById = (id: number): Direction | undefined => {
    return directions.value.find((direction) => direction.id === id)
  }

  const getDirectionNameById = (id: number): string => {
    return getDirectionById(id)?.name ?? 'Без направления'
  }

  const getLevelById = (id: number): Level | undefined => {
    return levels.value.find((level) => level.id === id)
  }

  const getLevelNameById = (id: number | null): string => {
    if (id === null) return 'Для всех'
    return getLevelById(id)?.name ?? 'Для всех'
  }

  const getTeachersForLesson = (teacherIds: number[] = []): Teacher[] => {
    return teacherIds
      .map((id) => teachers.value.find((teacher) => teacher.id === id))
      .filter((teacher): teacher is Teacher => Boolean(teacher))
  }

  const loadData = async () => {
    isLoading.value = true
    try {
      const [lessonsData, directionsData, teachersData, levelsData] = await Promise.all([
        scheduleApi.getLessons(),
        scheduleApi.getDirections(),
        scheduleApi.getTeachers(),
        scheduleApi.getLevels(),
      ])
      lessons.value = lessonsData
      directions.value = directionsData
      teachers.value = teachersData
      levels.value = levelsData
      isLoaded.value = true
    } finally {
      isLoading.value = false
    }
  }

  const ensureLoaded = async () => {
    if (!isLoaded.value && !isLoading.value) {
      await loadData()
    }
  }

  const deleteLesson = async (id: number) => {
    await scheduleApi.deleteLesson(id)
    lessons.value = lessons.value.filter((lesson) => lesson.id !== id)
  }

  const updateLesson = async (updatedLesson: Lesson) => {
    const updated = await scheduleApi.updateLesson(updatedLesson.id, {
      day: updatedLesson.day,
      time: updatedLesson.time,
      endTime: updatedLesson.endTime,
      crossesMidnight: updatedLesson.crossesMidnight,
      directionId: updatedLesson.directionId,
      levelId: updatedLesson.levelId ?? null,
      teacherIds: updatedLesson.teacherIds,
      poster: updatedLesson.poster,
    })

    const index = lessons.value.findIndex((lesson) => lesson.id === updated.id)
    if (index !== -1) {
      lessons.value[index] = updated
    }
  }

  const addLesson = async (newLesson: NewLesson) => {
    const created = await scheduleApi.createLesson({
      ...newLesson,
      levelId: newLesson.levelId ?? null,
      teacherIds: newLesson.teacherIds ?? [],
    })
    lessons.value.push(created)
  }

  const addTeacher = async (teacher: NewTeacher) => {
    const created = await scheduleApi.createTeacher(teacher)
    teachers.value.push(created)
  }

  const updateTeacher = async (updated: Teacher) => {
    const saved = await scheduleApi.updateTeacher(updated.id, {
      name: updated.name,
      photo: updated.photo,
    })
    const index = teachers.value.findIndex((t) => t.id === saved.id)
    if (index !== -1) {
      teachers.value[index] = saved
    }
  }

  const deleteTeacher = async (id: number) => {
    await scheduleApi.deleteTeacher(id)
    teachers.value = teachers.value.filter((teacher) => teacher.id !== id)
    lessons.value = lessons.value.map((lesson) => ({
      ...lesson,
      teacherIds: lesson.teacherIds.filter((teacherId) => teacherId !== id),
    }))
  }

  const addDirection = async (direction: NewDirection) => {
    const created = await scheduleApi.createDirection(direction)
    directions.value.push(created)
    return created
  }

  const updateDirection = async (updated: Direction) => {
    const saved = await scheduleApi.updateDirection(updated.id, { name: updated.name })
    const index = directions.value.findIndex((direction) => direction.id === saved.id)
    if (index !== -1) {
      directions.value[index] = saved
    }
  }

  const deleteDirection = async (id: number) => {
    await scheduleApi.deleteDirection(id)
    directions.value = directions.value.filter((direction) => direction.id !== id)
    lessons.value = lessons.value.filter((lesson) => lesson.directionId !== id)
    if (filters.value.direction === id) {
      filters.value.direction = null
    }
  }

  const addLevel = async (level: NewLevel) => {
    const created = await scheduleApi.createLevel(level)
    levels.value.push(created)
    return created
  }

  const updateLevel = async (updated: Level) => {
    const saved = await scheduleApi.updateLevel(updated.id, { name: updated.name, color: updated.color })
    const index = levels.value.findIndex((level) => level.id === saved.id)
    if (index !== -1) {
      levels.value[index] = saved
    }
  }

  const deleteLevel = async (id: number) => {
    await scheduleApi.deleteLevel(id)
    levels.value = levels.value.filter((level) => level.id !== id)
    lessons.value = lessons.value.map((lesson) => (lesson.levelId === id ? { ...lesson, levelId: null } : lesson))
    if (filters.value.level === id) {
      filters.value.level = null
    }
  }

  return {
    days,
    timeSlots,
    lessons,
    filters,
    directions,
    teachers,
    levels,
    uniqueDirections,
    filteredLessons,
    isLoaded,
    isLoading,
    loadData,
    ensureLoaded,
    getLessonsByDay,
    getTeacherById,
    getDirectionById,
    getDirectionNameById,
    getLevelById,
    getLevelNameById,
    getTeachersForLesson,
    deleteLesson,
    updateLesson,
    addLesson,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addDirection,
    updateDirection,
    deleteDirection,
    addLevel,
    updateLevel,
    deleteLevel,
  }
})
