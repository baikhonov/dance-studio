export const AUTH_TOKEN_KEY = 'admin_token'
export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized'

export const getAuthToken = (): string | null => localStorage.getItem(AUTH_TOKEN_KEY)

export const setAuthToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export const isAuthenticated = () => Boolean(getAuthToken())
