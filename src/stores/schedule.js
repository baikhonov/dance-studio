import { defineStore } from "pinia";

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    days: [
      'Понедельник',
      'Вторник',
      'Среда',
      'Четверг',
      'Пятница',
      'Суббота',
      'Воскресенье',
    ],
    timeSlots: [
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
    ],
    lessons: [
      {
        id: 1,
        day: 'Понедельник',
        time: '19:30',
        endTime: '20:30',
        direction: 'Lady Style (соло)',
        level: 'Продолжающие',
        teachers: [{ name: 'Татьяна', photo: 'tatyana.jpg' }],
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
        teachers: [
          { name: 'Кеулемжай', photo: 'keulemzhai.jpg' },
          { name: 'Татьяна', photo: 'tatyana.jpg' },
        ],
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
        teachers: [{ name: 'Кеулемжай', photo: 'keulemzhai.jpg' }],
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
        teachers: [
          { name: 'Кеулемжай', photo: 'keulemzhai.jpg' },
          { name: 'Татьяна', photo: 'tatyana.jpg' },
        ],
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
        teachers: [{ name: 'Татьяна', photo: 'tatyana.jpg' }],
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
        teachers: [
          { name: 'Кеулемжай', photo: 'keulemzhai.jpg' },
          { name: 'Татьяна', photo: 'tatyana.jpg' },
        ],
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
        teachers: [{ name: 'Кеулемжай', photo: 'keulemzhai.jpg' }],
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
        teachers: [
          { name: 'Кеулемжай', photo: 'keulemzhai.jpg' },
          { name: 'Татьяна', photo: 'tatyana.jpg' },
        ],
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
        teachers: [{ name: 'Татьяна', photo: 'tatyana.jpg' }],
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
        teachers: [
          { name: 'Кеулемжай', photo: 'keulemzhai.jpg' },
          { name: 'Татьяна', photo: 'tatyana.jpg' },
        ],
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
        type: 'party',
        poster: 'party-bachatamania.webp',
      },
      {
        id: 20,
        day: 'Воскресенье',
        time: '13:00',
        endTime: '14:00',
        direction: 'Lady Style (соло)',
        level: 'Начинающие',
        teachers: [{ name: 'Татьяна', photo: 'tatyana.jpg' }],
        type: 'lesson',
        poster: null,
      },
    ],
    filters: {
      direction: '',
      level: '',
    }
  }),
  getters: {
    // Получаем занятия для конкретного дня
    getLessonsByDay: (state) => (day) => {
      return state.filteredLessons.filter((lesson) => lesson.day === day)
    },
    uniqueDirections: (state) => {
      const dirs = [...new Set(state.lessons?.map((lesson) => lesson.direction).filter(Boolean))]
      return dirs.sort()
    },
    uniqueLevels: (state) => {
      const levels = [...new Set(state.lessons?.map((lesson) => lesson.level).filter(Boolean))]
      return levels.filter(
        (level) => level.toLowerCase() !== 'для всех' && level.toLowerCase() !== 'все уровни',
      )
    },
    filteredLessons: (state) => {
      if (!state.lessons) return []

      const lessons = state.lessons.filter((lesson) => {
        let matchDirection = true

        if (state.filters.direction) {
          // если фильтр активен — сравниваем
          matchDirection = lesson.direction.toLowerCase() === state.filters.direction.toLowerCase()
        }

        let matchLevel = true

        if (state.filters.level) {
          // если фильтр активен — сравниваем (с защитой от отсутствия level)
          const lessonLevel = lesson.level?.toLowerCase()
          const selectedLevel = state.filters.level.toLowerCase()
          matchLevel = lessonLevel === selectedLevel || lessonLevel === 'для всех'
        }

        return matchDirection && matchLevel
      })

      return lessons
    }
  },
  actions: {

  },
})
