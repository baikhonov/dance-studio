import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { generateId } from '@/utils/generateId'
import type { Filters, Lesson, NewLesson, NewTeacher, Teacher } from '@/types/lesson'

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

  const lessons = ref<Lesson[]>([
    {
      id: 1,
      day: 'Понедельник',
      time: '19:30',
      endTime: '20:30',
      direction: 'Lady Style (соло)',
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
      direction: 'Бачата в паре',
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
      direction: 'Общее хорео (соло)',
      level: 'Для всех',
      teacherIds: [5],
      type: 'lesson',
      poster: null,
    },
    {
      id: 4,
      day: 'Вторник',
      time: '20:30',
      endTime: '21:30',
      direction: 'Бачата в паре',
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
      direction: 'Lady Style (соло)',
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
      direction: 'Бачата в паре',
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
      direction: 'Общее хорео (соло)',
      level: 'Для всех',
      teacherIds: [5],
      type: 'lesson',
      poster: null,
    },
    {
      id: 8,
      day: 'Четверг',
      time: '20:30',
      endTime: '21:30',
      direction: 'Бачата в паре',
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
      direction: 'Lady Style (соло)',
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
      direction: 'Бачата интенсив "Украшения в паре"',
      level: 'Для всех',
      teacherIds: [5, 7],
      type: 'lesson',
      poster: null,
    },
    {
      id: 19,
      day: 'Суббота',
      time: '20:00',
      endTime: '23:00',
      direction: 'Вечеринка',
      level: 'Для всех',
      teacherIds: [],
      type: 'event',
      poster: 'party-bachatamania.webp',
    },
    {
      id: 20,
      day: 'Воскресенье',
      time: '13:00',
      endTime: '14:00',
      direction: 'Lady Style (соло)',
      level: 'Начинающие',
      teacherIds: [7],
      type: 'lesson',
      poster: null,
    },
  ])

  const filters = ref<Filters>({
    direction: '',
    level: '',
  })

  const teachers = ref<Teacher[]>([
    { id: 5, name: 'Кеулемжай', photo: 'keulemzhai.jpg' },
    { id: 7, name: 'Татьяна', photo: 'tatyana.jpg' },
  ])

  const uniqueDirections = computed(() => {
    const dirs = [...new Set(lessons.value.map((lesson) => lesson.direction).filter(Boolean))]
    return dirs.sort()
  })

  const uniqueLevels = computed(() => {
    const levels = [...new Set(lessons.value.map((lesson) => lesson.level).filter(Boolean))]
    return levels.filter(
      (level) => level.toLowerCase() !== 'для всех' && level.toLowerCase() !== 'все уровни',
    )
  })

  const filteredLessons = computed(() => {
    return lessons.value.filter((lesson) => {
      let matchDirection = true
      if (filters.value.direction) {
        matchDirection = lesson.direction.toLowerCase() === filters.value.direction.toLowerCase()
      }

      let matchLevel = true
      if (filters.value.level) {
        const lessonLevel = lesson.level?.toLowerCase()
        const selectedLevel = filters.value.level.toLowerCase()
        matchLevel = lessonLevel === selectedLevel || lessonLevel === 'для всех'
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
      lessons.value[index] = updatedLesson
    }
  }

  const addLesson = (newLesson: NewLesson) => {
    const maxId = generateId(lessons.value)
    lessons.value.push({
      ...newLesson,
      id: maxId,
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

  const deleteTeacher = (id: number) => {
    teachers.value = teachers.value.filter((teacher) => teacher.id !== id)
  }

  return {
    days,
    timeSlots,
    lessons,
    filters,
    teachers,
    uniqueDirections,
    uniqueLevels,
    filteredLessons,
    getLessonsByDay,
    getTeacherById,
    getTeachersForLesson,
    deleteLesson,
    updateLesson,
    addLesson,
    addTeacher,
    deleteTeacher,
  }
})
