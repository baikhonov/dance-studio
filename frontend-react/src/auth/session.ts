export const AUTH_TOKEN_KEY = 'admin_token'
export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized'
/** Same-tab auth updates (localStorage "storage" only fires in other tabs). */
export const AUTH_SESSION_CHANGED_EVENT = 'auth:session-changed'

const notifyAuthSessionChanged = () => {
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT))
}

export const getAuthToken = (): string | null => localStorage.getItem(AUTH_TOKEN_KEY)

export const setAuthToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  notifyAuthSessionChanged()
}

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  notifyAuthSessionChanged()
}

export const isAuthenticated = () => Boolean(getAuthToken())
