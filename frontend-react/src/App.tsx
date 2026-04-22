import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AUTH_SESSION_CHANGED_EVENT, AUTH_UNAUTHORIZED_EVENT, clearAuthToken, isAuthenticated } from './auth/session'
import { getSettings, SITE_SETTINGS_UPDATED_EVENT } from './services/settings'
import { resolveBrandingLogoUrl } from './utils/assets'
import { resetFaviconToDefault, updateFaviconFromLogoUrl } from './utils/favicon'
import { shouldUseLogoContrastBackground } from './utils/logoContrast'
import { getResolvedTheme, getStoredThemeMode, setThemeMode as persistThemeMode, type ThemeMode } from './utils/theme'
import { ThemeSwitch } from './components/ThemeSwitch'

const DEFAULT_SCHOOL_NAME = 'Школа танцев'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const userMenuRef = useRef<HTMLDivElement | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAuthenticated())
  const [schoolName, setSchoolName] = useState(DEFAULT_SCHOOL_NAME)
  const [logoPath, setLogoPath] = useState<string | null>(null)
  const [needsLogoContrastBg, setNeedsLogoContrastBg] = useState(false)
  const [isDarkUi, setIsDarkUi] = useState(() => document.documentElement.classList.contains('dark'))
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => getStoredThemeMode())

  const pageTitle = location.pathname === '/admin' ? 'Администрирование' : 'Расписание занятий'
  const schoolLogoUrl = resolveBrandingLogoUrl(logoPath)

  const loadSiteBranding = useCallback(() => {
    void getSettings()
      .then((settings) => {
        setSchoolName(settings.schoolName?.trim() ? settings.schoolName : DEFAULT_SCHOOL_NAME)
        setLogoPath(settings.logoPath)
      })
      .catch(() => {
        /* оставляем значения по умолчанию */
      })
  }, [])

  useEffect(() => {
    loadSiteBranding()
  }, [location.pathname, loadSiteBranding])

  useEffect(() => {
    if (!schoolLogoUrl) {
      resetFaviconToDefault()
      return
    }
    let cancelled = false
    void updateFaviconFromLogoUrl(schoolLogoUrl).catch(() => {
      if (!cancelled) resetFaviconToDefault()
    })
    return () => {
      cancelled = true
    }
  }, [schoolLogoUrl])

  useEffect(() => {
    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, loadSiteBranding)
    return () => window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, loadSiteBranding)
  }, [loadSiteBranding])

  useEffect(() => {
    const updateDark = () => setIsDarkUi(document.documentElement.classList.contains('dark'))
    const observer = new MutationObserver(updateDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (themeMode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystemThemeChange = () => {
      persistThemeMode('system')
    }
    mq.addEventListener('change', onSystemThemeChange)
    return () => mq.removeEventListener('change', onSystemThemeChange)
  }, [themeMode])

  const toggleTheme = () => {
    const wasDark = getResolvedTheme(themeMode) === 'dark'
    const next: ThemeMode = wasDark ? 'light' : 'dark'
    persistThemeMode(next)
    setThemeModeState(next)
  }

  useEffect(() => {
    if (!schoolLogoUrl) {
      setNeedsLogoContrastBg(false)
      return
    }
    let cancelled = false
    void shouldUseLogoContrastBackground(schoolLogoUrl)
      .then((needs) => {
        if (!cancelled) setNeedsLogoContrastBg(needs)
      })
      .catch(() => {
        if (!cancelled) setNeedsLogoContrastBg(false)
      })
    return () => {
      cancelled = true
    }
  }, [schoolLogoUrl])

  useEffect(() => {
    const base = schoolName.trim() || DEFAULT_SCHOOL_NAME
    if (location.pathname === '/admin') {
      document.title = `${base} - Админка`
    } else if (location.pathname === '/login') {
      document.title = `${base} - Вход`
    } else {
      document.title = `${base} - Расписание занятий`
    }
  }, [schoolName, location.pathname])

  useEffect(() => {
    const syncAuth = () => setIsAdmin(isAuthenticated())
    const onUnauthorized = () => {
      clearAuthToken()
      setIsAdmin(false)
      navigate('/login')
    }
    window.addEventListener('storage', syncAuth)
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, syncAuth)
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized)
    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, syncAuth)
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized)
    }
  }, [navigate])

  useEffect(() => {
    setIsUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (!userMenuRef.current?.contains(target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [])

  const logout = () => {
    setIsUserMenuOpen(false)
    clearAuthToken()
    setIsAdmin(false)
    navigate('/')
  }

  const goToAdmin = () => {
    setIsUserMenuOpen(false)
    void navigate('/admin')
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <header className="mx-auto mb-3 grid w-full max-w-[1800px] grid-cols-[1fr_auto] gap-2 border-b border-gray-200 pb-2 md:grid-cols-[1fr_auto_1fr] md:items-center dark:border-slate-700">
        <div className="min-w-0">
          <Link to="/" className="inline-flex items-center">
            {schoolLogoUrl ? (
              needsLogoContrastBg && !isDarkUi ? (
                <span className="logo-contrast-bg">
                  <img src={schoolLogoUrl} alt={schoolName} className="max-h-9 w-auto object-contain md:max-h-10" />
                </span>
              ) : (
                <img src={schoolLogoUrl} alt={schoolName} className="max-h-9 w-auto object-contain md:max-h-10" />
              )
            ) : (
              <h1 className="truncate text-base font-semibold text-gray-800 md:text-lg dark:text-slate-100">{schoolName}</h1>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-3 justify-self-end md:justify-self-end">
          <div className="flex items-center justify-end gap-3">
            <ThemeSwitch themeMode={themeMode} isDark={isDarkUi} onToggle={toggleTheme} />
            {!isAdmin ? (
              <div className="text-right">
                <Link
                  to="/login"
                  className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  Войти
                </Link>
              </div>
            ) : (
              <div ref={userMenuRef} className="relative">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                aria-label="Меню администратора"
                onClick={(event) => {
                  event.stopPropagation()
                  setIsUserMenuOpen((open) => !open)
                }}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M10 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM8 6.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0ZM4.25 14A2.25 2.25 0 0 1 6.5 11.75h7A2.25 2.25 0 0 1 15.75 14v.75a.75.75 0 0 1-1.5 0V14a.75.75 0 0 0-.75-.75h-7a.75.75 0 0 0-.75.75v.75a.75.75 0 0 1-1.5 0V14Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="hidden sm:inline">Админ</span>
                <span className="text-[10px] text-gray-500 dark:text-slate-400">▼</span>
              </button>

              {isUserMenuOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800">
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 dark:text-blue-300 dark:hover:bg-slate-700"
                    onClick={goToAdmin}
                  >
                    Админка
                  </button>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:text-red-300 dark:hover:bg-slate-700"
                    onClick={logout}
                  >
                    Выйти
                  </button>
                </div>
              ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-2 flex justify-center md:col-span-1 md:col-start-2 md:row-start-1">
          {pageTitle ? (
            <h2 className="text-lg font-semibold text-gray-800 md:text-xl dark:text-slate-100">{pageTitle}</h2>
          ) : null}
        </div>
      </header>

      <main className="mx-auto mb-4 w-full max-w-[1800px]">
        <Outlet />
      </main>

      <footer className="my-6 text-center text-gray-600 dark:text-slate-400">© 2026 {schoolName}. Все права защищены.</footer>
    </div>
  )
}

export default App
