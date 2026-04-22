import { apiRequest } from '../api/http'

/** Событие для обновления брендинга в layout после сохранения настроек в админке. */
export const SITE_SETTINGS_UPDATED_EVENT = 'site-settings:updated'

export type SiteSettings = {
  schoolName: string
  logoPath: string | null
}

export const getSettings = () => apiRequest<SiteSettings>('/settings')

export const updateSettings = (payload: SiteSettings) =>
  apiRequest<SiteSettings>('/settings', { method: 'PUT', body: payload })
