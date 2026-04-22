import { apiRequest } from '../api/http'

export type Lesson = {
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

export type Direction = {
  id: number
  name: string
  description: string | null
}

export type Level = {
  id: number
  name: string
  color: string
}

export type Teacher = {
  id: number
  name: string
  photo: string
}

export type NewLesson = Omit<Lesson, 'id'>

export const getPublicSchedule = () => apiRequest<Lesson[]>('/lessons')
export const getDirections = () => apiRequest<Direction[]>('/directions')
export const getLevels = () => apiRequest<Level[]>('/levels')
export const getTeachers = () => apiRequest<Teacher[]>('/teachers')
export const updateLesson = (id: number, payload: NewLesson) =>
  apiRequest<Lesson>(`/lessons/${id}`, { method: 'PUT', body: payload })
export const deleteLesson = (id: number) => apiRequest<void>(`/lessons/${id}`, { method: 'DELETE' })
