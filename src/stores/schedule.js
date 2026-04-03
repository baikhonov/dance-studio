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
        teacherIds: [7], // Татьяна
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
        teacherIds: [5, 7], // Кеулемжай, Татьяна
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
        teacherIds: [5], // Кеулемжай
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
        teacherIds: [5, 7], // Кеулемжай, Татьяна
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
        teacherIds: [7], // Татьяна
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
        teacherIds: [5, 7], // Кеулемжай, Татьяна
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
        teacherIds: [5], // Кеулемжай
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
        teacherIds: [5, 7], // Кеулемжай, Татьяна
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
        teacherIds: [7], // Татьяна
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
        teacherIds: [5, 7], // Кеулемжай, Татьяна
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
        teacherIds: [7], // Татьяна
        type: 'lesson',
        poster: null,
      },
    ],
    filters: {
      direction: '',
      level: '',
    },
    teachers: [
      { id: 5, name: 'Кеулемжай', photo: 'keulemzhai.jpg' },
      { id: 7, name: 'Татьяна', photo: 'tatyana.jpg' },
    ]
  }),
  getters: {
    getLessonsByDay() {
      return (day) => {
        return this.filteredLessons.filter((lesson) => lesson.day === day)
      }
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
    },
    getTeacherById: (state) => (id) => {
      return state.teachers.find(teacher => teacher.id === id)
    },

    getTeachersForLesson: (state) => (teacherIds) => {
      if (!teacherIds || !Array.isArray(teacherIds)) return []
      return teacherIds.map(id => state.teachers.find(t => t.id === id)).filter(Boolean)
    },
  },
  actions: {
    deleteLesson(id) {
      this.lessons = this.lessons.filter((lesson) => lesson.id !== id)
    },
    updateLesson(updatedLesson) {
      const index = this.lessons.findIndex(l => l.id === updatedLesson.id)
      if (index !== -1) this.lessons[index] = updatedLesson
    },
    addLesson(newLesson) {
      const maxId = Math.max(...this.lessons.map(lesson => lesson.id))
      this.lessons.push({
        ...newLesson,
        id: maxId + 1
      })
    }
  },
})
