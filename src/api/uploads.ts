import { API_BASE_URL } from '@/config/runtime'

type UploadResponse = {
  path: string
  url: string
}

const uploadFile = async (
  endpoint: '/teacher-photo' | '/poster' | '/school-logo',
  file: File,
): Promise<UploadResponse> => {
  const token = localStorage.getItem('admin_token')
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/uploads${endpoint}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  const data = (await response.json().catch(() => null)) as UploadResponse | { error?: string } | null
  if (!response.ok || !data || !('path' in data)) {
    throw new Error((data as { error?: string } | null)?.error ?? 'Upload failed')
  }
  return data
}

export const uploadTeacherPhoto = (file: File) => uploadFile('/teacher-photo', file)
export const uploadPoster = (file: File) => uploadFile('/poster', file)
export const uploadSchoolLogo = (file: File) => uploadFile('/school-logo', file)
