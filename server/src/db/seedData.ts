export type SeedDirection = { id: number; name: string; description: string | null }
export type SeedLevel = { id: number; name: string; color: string }
export type SeedTeacher = { id: number; name: string; photo: string }
export type SeedLesson = {
  id: number
  day: string
  time: string
  endTime: string
  crossesMidnight: boolean
  directionId: number
  levelIds: number[]
  teacherIds: number[]
  poster: string | null
}

export const seedDirections: SeedDirection[] = [
  {
    id: 1,
    name: 'Lady Style (соло)',
    description: 'Женская пластика, осанка и музыкальность. На занятии разбираются связки и акценты корпуса.',
  },
  {
    id: 2,
    name: 'Бачата в паре',
    description:
      'Работа в паре: ведение, следование, базовые и развивающие элементы. Фокус на комфортном взаимодействии.',
  },
  {
    id: 3,
    name: 'Общее хорео (соло)',
    description:
      'Танцевальные комбинации в сольном формате. Развивает координацию, память движений и уверенность в танце.',
  },
  {
    id: 4,
    name: 'Бачата интенсив "Украшения в паре"',
    description:
      'Интенсив по музыкальным и визуальным украшениям в парной бачате. Подходит для расширения танцевального словаря.',
  },
  {
    id: 5,
    name: 'Вечеринка',
    description: 'Практика в свободном формате: социальные танцы, закрепление материала и общение.',
  },
]

export const seedLevels: SeedLevel[] = [
  { id: 3, name: 'Новички', color: '#f59e0b' },
  { id: 1, name: 'Начинающие', color: '#10b981' },
  { id: 2, name: 'Продолжающие', color: '#3b82f6' },
]

export const seedTeachers: SeedTeacher[] = [
  { id: 5, name: 'Кеулемжай', photo: 'keulemzhai.jpg' },
  { id: 7, name: 'Татьяна', photo: 'tatyana.jpg' },
]

export const seedLessons: SeedLesson[] = [
  {
    id: 1,
    day: 'Понедельник',
    time: '19:30',
    endTime: '20:30',
    crossesMidnight: false,
    directionId: 1,
    levelIds: [2],
    teacherIds: [7],
    poster: null,
  },
  {
    id: 2,
    day: 'Понедельник',
    time: '20:30',
    endTime: '21:30',
    crossesMidnight: false,
    directionId: 2,
    levelIds: [1],
    teacherIds: [5, 7],
    poster: null,
  },
  {
    id: 3,
    day: 'Вторник',
    time: '19:30',
    endTime: '20:30',
    crossesMidnight: false,
    directionId: 3,
    levelIds: [3, 1],
    teacherIds: [5],
    poster: null,
  },
  {
    id: 4,
    day: 'Вторник',
    time: '20:30',
    endTime: '21:30',
    crossesMidnight: false,
    directionId: 2,
    levelIds: [2],
    teacherIds: [5, 7],
    poster: null,
  },
  {
    id: 5,
    day: 'Среда',
    time: '19:30',
    endTime: '20:30',
    crossesMidnight: false,
    directionId: 1,
    levelIds: [2],
    teacherIds: [7],
    poster: null,
  },
  {
    id: 6,
    day: 'Среда',
    time: '20:30',
    endTime: '21:30',
    crossesMidnight: false,
    directionId: 2,
    levelIds: [1],
    teacherIds: [5, 7],
    poster: null,
  },
  {
    id: 7,
    day: 'Четверг',
    time: '19:30',
    endTime: '20:30',
    crossesMidnight: false,
    directionId: 3,
    levelIds: [3, 1],
    teacherIds: [5],
    poster: null,
  },
  {
    id: 8,
    day: 'Четверг',
    time: '20:30',
    endTime: '21:30',
    crossesMidnight: false,
    directionId: 2,
    levelIds: [2],
    teacherIds: [5, 7],
    poster: null,
  },
  {
    id: 9,
    day: 'Пятница',
    time: '19:30',
    endTime: '20:30',
    crossesMidnight: false,
    directionId: 1,
    levelIds: [3, 1],
    teacherIds: [7],
    poster: null,
  },
  {
    id: 10,
    day: 'Пятница',
    time: '20:30',
    endTime: '22:30',
    crossesMidnight: false,
    directionId: 4,
    levelIds: [],
    teacherIds: [5, 7],
    poster: null,
  },
  {
    id: 19,
    day: 'Суббота',
    time: '20:00',
    endTime: '23:00',
    crossesMidnight: false,
    directionId: 5,
    levelIds: [],
    teacherIds: [],
    poster: 'party-bachatamania.webp',
  },
  {
    id: 20,
    day: 'Воскресенье',
    time: '13:00',
    endTime: '14:00',
    crossesMidnight: false,
    directionId: 1,
    levelIds: [3, 1],
    teacherIds: [7],
    poster: null,
  },
]
