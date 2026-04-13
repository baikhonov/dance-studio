import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { generateId } from '@/utils/generateId'
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
  const FOR_ALL_LEVEL = 'для всех'
  const normalizeLevel = (level: string | null | undefined): string => (level ?? '').trim().toLowerCase()
  const normalizeLevelForLogic = (level: string | null | undefined): string => {
    const normalized = normalizeLevel(level)
    return normalized === '' ? FOR_ALL_LEVEL : normalized
  }

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

  const lessons = ref<Lesson[]>([
    {
      id: 1,
      day: 'Понедельник',
      time: '19:30',
      endTime: '20:30',
      directionId: 1,
      level: 'Продолжающие',
      teacherIds: [7],
      type: 'lesson',
      poster: null,
    },
    {
      id: 2,
      day: 'Понедельник',
      time: '20:30',
      endTime: '21:30',
      directionId: 2,
      level: 'Начинающие',
      teacherIds: [5, 7],
      type: 'lesson',
      poster: null,
    },
    {
      id: 3,
      day: 'Вторник',
      time: '19:30',
      endTime: '20:30',
      directionId: 3,
      level: '',
      teacherIds: [5],
      type: 'lesson',
      poster: null,
    },
    {
      id: 4,
      day: 'Вторник',
      time: '20:30',
      endTime: '21:30',
      directionId: 2,
      level: 'Продолжающие',
      teacherIds: [5, 7],
      type: 'lesson',
      poster: null,
    },
    {
      id: 5,
      day: 'Среда',
      time: '19:30',
      endTime: '20:30',
      directionId: 1,
      level: 'Продолжающие',
      teacherIds: [7],
      type: 'lesson',
      poster: null,
    },
    {
      id: 6,
      day: 'Среда',
      time: '20:30',
      endTime: '21:30',
      directionId: 2,
      level: 'Начинающие',
      teacherIds: [5, 7],
      type: 'lesson',
      poster: null,
    },
    {
      id: 7,
      day: 'Четверг',
      time: '19:30',
      endTime: '20:30',
      directionId: 3,
      level: '',
      teacherIds: [5],
      type: 'lesson',
      poster: null,
    },
    {
      id: 8,
      day: 'Четверг',
      time: '20:30',
      endTime: '21:30',
      directionId: 2,
      level: 'Продолжающие',
      teacherIds: [5, 7],
      type: 'lesson',
      poster: null,
    },
    {
      id: 9,
      day: 'Пятница',
      time: '19:30',
      endTime: '20:30',
      directionId: 1,
      level: 'Начинающие',
      teacherIds: [7],
      type: 'lesson',
      poster: null,
    },
    {
      id: 10,
      day: 'Пятница',
      time: '20:30',
      endTime: '22:30',
      directionId: 4,
      level: '',
      teacherIds: [5, 7],
      type: 'lesson',
      poster: null,
    },
    {
      id: 19,
      day: 'Суббота',
      time: '20:00',
      endTime: '23:00',
      directionId: 5,
      level: '',
      teacherIds: [],
      type: 'event',
      poster: 'party-bachatamania.webp',
    },
    {
      id: 20,
      day: 'Воскресенье',
      time: '13:00',
      endTime: '14:00',
      directionId: 1,
      level: 'Начинающие',
      teacherIds: [7],
      type: 'lesson',
      poster: null,
    },
  ])

  const filters = ref<Filters>({
    direction: null,
    level: '',
  })

  const directions = ref<Direction[]>([
    { id: 1, name: 'Lady Style (соло)' },
    { id: 2, name: 'Бачата в паре' },
    { id: 3, name: 'Общее хорео (соло)' },
    { id: 4, name: 'Бачата интенсив "Украшения в паре"' },
    { id: 5, name: 'Вечеринка' },
  ])

  const teachers = ref<Teacher[]>([
    { id: 5, name: 'Кеулемжай', photo: 'keulemzhai.jpg' },
    { id: 7, name: 'Татьяна', photo: 'tatyana.jpg' },
  ])

  const levels = ref<Level[]>([
    { id: 1, name: 'Начинающие' },
    { id: 2, name: 'Продолжающие' },
  ])

  const uniqueDirections = computed(() => {
    return [...directions.value]
      .map((direction) => direction.name)
      .filter(Boolean)
      .sort()
  })

  const uniqueLevels = computed(() => {
    const availableLevels = [...new Set(levels.value.map((level) => level.name).filter(Boolean))]
    return availableLevels.filter(
      (level) => level.toLowerCase() !== 'для всех' && level.toLowerCase() !== 'все уровни',
    )
  })

  const filteredLessons = computed(() => {
    return lessons.value.filter((lesson) => {
      let matchDirection = true
      if (filters.value.direction !== null) {
        matchDirection = lesson.directionId === filters.value.direction
      }

      let matchLevel = true
      if (filters.value.level) {
        const lessonLevel = normalizeLevelForLogic(lesson.level)
        const selectedLevel = normalizeLevel(filters.value.level)
        matchLevel = lessonLevel === selectedLevel || lessonLevel === FOR_ALL_LEVEL
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

  const getTeachersForLesson = (teacherIds: number[] = []): Teacher[] => {
    return teacherIds
      .map((id) => teachers.value.find((teacher) => teacher.id === id))
      .filter((teacher): teacher is Teacher => Boolean(teacher))
  }

  const deleteLesson = (id: number) => {
    lessons.value = lessons.value.filter((lesson) => lesson.id !== id)
  }

  const updateLesson = (updatedLesson: Lesson) => {
    const index = lessons.value.findIndex((lesson) => lesson.id === updatedLesson.id)
    if (index !== -1) {
      lessons.value[index] = { ...updatedLesson, level: (updatedLesson.level ?? '').trim() }
    }
  }

  const addLesson = (newLesson: NewLesson) => {
    const maxId = generateId(lessons.value)
    lessons.value.push({
      ...newLesson,
      id: maxId,
      level: (newLesson.level ?? '').trim(),
      teacherIds: newLesson.teacherIds ?? [],
    })
  }

  const addTeacher = (teacher: NewTeacher) => {
    const maxId = generateId(teachers.value)
    teachers.value.push({
      ...teacher,
      id: maxId,
    })
  }

  const updateTeacher = (updated: Teacher) => {
    const index = teachers.value.findIndex((t) => t.id === updated.id)
    if (index !== -1) {
      teachers.value[index] = { ...updated }
    }
  }

  const deleteTeacher = (id: number) => {
    teachers.value = teachers.value.filter((teacher) => teacher.id !== id)
  }

  const addDirection = (direction: NewDirection) => {
    const maxId = generateId(directions.value)
    directions.value.push({
      ...direction,
      id: maxId,
    })
  }

  const updateDirection = (updated: Direction) => {
    const index = directions.value.findIndex((direction) => direction.id === updated.id)
    if (index !== -1) {
      directions.value[index] = { ...updated }
    }
  }

  const deleteDirection = (id: number) => {
    directions.value = directions.value.filter((direction) => direction.id !== id)
    lessons.value = lessons.value.filter((lesson) => lesson.directionId !== id)
    if (filters.value.direction === id) {
      filters.value.direction = null
    }
  }

  const addLevel = (level: NewLevel) => {
    const maxId = generateId(levels.value)
    levels.value.push({
      ...level,
      id: maxId,
    })
  }

  const updateLevel = (updated: Level) => {
    const index = levels.value.findIndex((level) => level.id === updated.id)
    if (index !== -1) {
      levels.value[index] = { ...updated }
    }
  }

  const deleteLevel = (id: number) => {
    const levelToDelete = levels.value.find((level) => level.id === id)
    if (!levelToDelete) return

    const normalizedName = levelToDelete.name.trim().toLowerCase()
    levels.value = levels.value.filter((level) => level.id !== id)
    lessons.value = lessons.value.map((lesson) => {
      const lessonLevel = lesson.level.trim().toLowerCase()
      if (lessonLevel === normalizedName) {
        return { ...lesson, level: '' }
      }
      return lesson
    })

    if (filters.value.level.trim().toLowerCase() === normalizedName) {
      filters.value.level = ''
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
    uniqueLevels,
    filteredLessons,
    getLessonsByDay,
    getTeacherById,
    getDirectionById,
    getDirectionNameById,
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
