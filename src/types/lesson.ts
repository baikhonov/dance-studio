export interface Lesson {
  id: number
  day: string
  time: string
  endTime: string
  crossesMidnight: boolean
  directionId: number
  levelId: number | null
  teacherIds: number[]
  poster: string | null
}

export interface Direction {
  id: number
  name: string
}

export interface Level {
  id: number
  name: string
}

export interface Teacher {
  id: number
  name: string
  photo: string
}

export interface Filters {
  direction: number | null
  level: number | null
}

export interface ScheduleState {
  days: string[]
  timeSlots: string[]
  lessons: Lesson[]
  filters: Filters
  teachers: Teacher[]
}

export type NewLesson = Omit<Lesson, 'id'>
export type NewDirection = Omit<Direction, 'id'>
export type NewLevel = Omit<Level, 'id'>
export type NewTeacher = Omit<Teacher, 'id'>
