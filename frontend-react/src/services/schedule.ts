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
export type NewTeacher = Omit<Teacher, 'id'>
export type NewDirection = Omit<Direction, 'id'>
export type NewLevel = Omit<Level, 'id'>

export const getPublicSchedule = () => apiRequest<Lesson[]>('/lessons')
export const getDirections = () => apiRequest<Direction[]>('/directions')
export const getLevels = () => apiRequest<Level[]>('/levels')
export const getTeachers = () => apiRequest<Teacher[]>('/teachers')
export const createTeacher = (payload: NewTeacher) => apiRequest<Teacher>('/teachers', { method: 'POST', body: payload })
export const updateTeacher = (id: number, payload: NewTeacher) =>
  apiRequest<Teacher>(`/teachers/${id}`, { method: 'PUT', body: payload })
export const deleteTeacher = (id: number) => apiRequest<void>(`/teachers/${id}`, { method: 'DELETE' })
export const createDirection = (payload: NewDirection) =>
  apiRequest<Direction>('/directions', { method: 'POST', body: payload })
export const updateDirection = (id: number, payload: NewDirection) =>
  apiRequest<Direction>(`/directions/${id}`, { method: 'PUT', body: payload })
export const deleteDirection = (id: number) => apiRequest<void>(`/directions/${id}`, { method: 'DELETE' })
export const createLevel = (payload: NewLevel) => apiRequest<Level>('/levels', { method: 'POST', body: payload })
export const updateLevel = (id: number, payload: NewLevel) =>
  apiRequest<Level>(`/levels/${id}`, { method: 'PUT', body: payload })
export const deleteLevel = (id: number) => apiRequest<void>(`/levels/${id}`, { method: 'DELETE' })
export const createLesson = (payload: NewLesson) => apiRequest<Lesson>('/lessons', { method: 'POST', body: payload })
export const updateLesson = (id: number, payload: NewLesson) =>
  apiRequest<Lesson>(`/lessons/${id}`, { method: 'PUT', body: payload })
export const deleteLesson = (id: number) => apiRequest<void>(`/lessons/${id}`, { method: 'DELETE' })
