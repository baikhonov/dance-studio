const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const publicApiOrigin = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL?.trim() ?? '')

export const API_BASE_URL = publicApiOrigin ? `${publicApiOrigin}/api` : '/api'
export const UPLOADS_BASE_URL = publicApiOrigin ? `${publicApiOrigin}/uploads` : '/uploads'
