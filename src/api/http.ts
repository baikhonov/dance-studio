import { API_BASE_URL } from '@/config/runtime'

export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const token = localStorage.getItem('admin_token')
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const data = (await response.json().catch(() => null)) as { error?: string } | null
  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
    }
    throw new ApiError(data?.error ?? 'Request failed', response.status)
  }
  return data as T
}
