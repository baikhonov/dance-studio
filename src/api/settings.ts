import type { SiteSettings } from '@/types/settings'
import { apiRequest } from './http'

export const getSettings = () => apiRequest<SiteSettings>('/settings')

export const updateSettings = (payload: SiteSettings) =>
  apiRequest<SiteSettings>('/settings', { method: 'PUT', body: payload })
