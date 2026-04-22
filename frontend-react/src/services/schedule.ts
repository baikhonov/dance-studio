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

export const getPublicSchedule = () => apiRequest<Lesson[]>('/lessons')
