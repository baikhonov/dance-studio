import { UPLOADS_BASE_URL } from '../config/runtime'

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value)
const toDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

export const DEFAULT_TEACHER_AVATAR = toDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <rect width="160" height="160" fill="#f3f4f6"/>
    <circle cx="80" cy="58" r="28" fill="#d1d5db"/>
    <path d="M28 144c0-29 23-52 52-52s52 23 52 52" fill="#d1d5db"/>
  </svg>`,
)

export const DEFAULT_EVENT_POSTER = toDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320">
    <rect width="480" height="320" fill="#f3f4f6"/>
    <rect x="24" y="24" width="432" height="272" rx="16" fill="#e5e7eb"/>
    <circle cx="130" cy="120" r="28" fill="#cbd5e1"/>
    <path d="M70 232l70-66 56 48 78-80 136 98H70z" fill="#cbd5e1"/>
  </svg>`,
)

export const resolveTeacherPhotoUrl = (photo: string): string => {
  if (!photo) return DEFAULT_TEACHER_AVATAR
  if (isAbsoluteUrl(photo)) return photo
  if (photo.includes('/')) return `${UPLOADS_BASE_URL}/${photo}`
  return DEFAULT_TEACHER_AVATAR
}

export const resolvePosterUrl = (poster: string | null): string => {
  if (!poster) return DEFAULT_EVENT_POSTER
  if (isAbsoluteUrl(poster)) return poster
  if (poster.includes('/')) return `${UPLOADS_BASE_URL}/${poster}`
  return DEFAULT_EVENT_POSTER
}
