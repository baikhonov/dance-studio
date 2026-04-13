export type LessonType = 'lesson' | 'event'

export interface Lesson {
  id: number
  day: string
  time: string
  endTime: string
  direction: string
  level?: string
  teacherIds?: number[]
  type: LessonType
  poster?: string | null
}
