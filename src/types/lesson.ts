export type LessonType = 'lesson' | 'event'

export interface Lesson {
  id: number
  day: string
  time: string
  endTime: string
  direction: string
  level: string
  teacherIds: number[]
  type: LessonType
  poster: string | null
}

export interface Teacher {
  id: number
  name: string
  photo: string
}

export interface Filters {
  direction: string
  level: string
}

export interface ScheduleState {
  days: string[]
  timeSlots: string[]
  lessons: Lesson[]
  filters: Filters
  teachers: Teacher[]
}

export type NewLesson = Omit<Lesson, 'id'>
export type NewTeacher = Omit<Teacher, 'id'>
