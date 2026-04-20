import type { Direction, Lesson, Level, NewDirection, NewLesson, NewLevel, NewTeacher, Teacher } from '@/types/lesson'
import { apiRequest } from './http'

export const getLessons = async (filters?: {
  directionId?: number
  levelId?: number
  day?: string
}): Promise<Lesson[]> => {
  const search = new URLSearchParams()
  if (filters?.directionId) search.set('directionId', String(filters.directionId))
  if (filters?.levelId) search.set('levelId', String(filters.levelId))
  if (filters?.day) search.set('day', filters.day)
  const suffix = search.size > 0 ? `?${search.toString()}` : ''
  return apiRequest<Lesson[]>(`/lessons${suffix}`)
}

export const createLesson = (payload: NewLesson) =>
  apiRequest<Lesson>('/lessons', { method: 'POST', body: payload })

export const updateLesson = (id: number, payload: NewLesson) =>
  apiRequest<Lesson>(`/lessons/${id}`, { method: 'PUT', body: payload })

export const deleteLesson = (id: number) =>
  apiRequest<void>(`/lessons/${id}`, { method: 'DELETE' })

export const getTeachers = () => apiRequest<Teacher[]>('/teachers')
export const createTeacher = (payload: NewTeacher) =>
  apiRequest<Teacher>('/teachers', { method: 'POST', body: payload })
export const updateTeacher = (id: number, payload: NewTeacher) =>
  apiRequest<Teacher>(`/teachers/${id}`, { method: 'PUT', body: payload })
export const deleteTeacher = (id: number) =>
  apiRequest<void>(`/teachers/${id}`, { method: 'DELETE' })

export const getDirections = () => apiRequest<Direction[]>('/directions')
export const createDirection = (payload: NewDirection) =>
  apiRequest<Direction>('/directions', { method: 'POST', body: payload })
export const updateDirection = (id: number, payload: NewDirection) =>
  apiRequest<Direction>(`/directions/${id}`, { method: 'PUT', body: payload })
export const deleteDirection = (id: number) =>
  apiRequest<void>(`/directions/${id}`, { method: 'DELETE' })

export const getLevels = () => apiRequest<Level[]>('/levels')
export const createLevel = (payload: NewLevel) =>
  apiRequest<Level>('/levels', { method: 'POST', body: payload })
export const updateLevel = (id: number, payload: NewLevel) =>
  apiRequest<Level>(`/levels/${id}`, { method: 'PUT', body: payload })
export const deleteLevel = (id: number) =>
  apiRequest<void>(`/levels/${id}`, { method: 'DELETE' })
