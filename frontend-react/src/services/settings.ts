import { apiRequest } from '../api/http'

export type SiteSettings = {
  schoolName: string
  logoPath: string | null
}

export const getSettings = () => apiRequest<SiteSettings>('/settings')

export const updateSettings = (payload: SiteSettings) =>
  apiRequest<SiteSettings>('/settings', { method: 'PUT', body: payload })
