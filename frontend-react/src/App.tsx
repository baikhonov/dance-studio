import { useCallback, useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AUTH_UNAUTHORIZED_EVENT, clearAuthToken, isAuthenticated } from './auth/session'
import { getSettings, SITE_SETTINGS_UPDATED_EVENT } from './services/settings'
import { resolveBrandingLogoUrl } from './utils/assets'
import { shouldUseLogoContrastBackground } from './utils/logoContrast'

const DEFAULT_SCHOOL_NAME = 'Школа танцев'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAuthenticated())
  const [schoolName, setSchoolName] = useState(DEFAULT_SCHOOL_NAME)
  const [logoPath, setLogoPath] = useState<string | null>(null)
  const [needsLogoContrastBg, setNeedsLogoContrastBg] = useState(false)
  const [isDarkUi, setIsDarkUi] = useState(() => document.documentElement.classList.contains('dark'))

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
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized)
    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized)
    }
  }, [navigate])

  const logout = () => {
    clearAuthToken()
    setIsAdmin(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen text-slate-900">
      <header className="mx-auto mb-3 grid w-full max-w-[1800px] grid-cols-[1fr_auto] gap-2 border-b border-gray-200 pb-2 md:grid-cols-[1fr_auto_1fr] md:items-center">
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
              <h1 className="truncate text-base font-semibold text-gray-800 md:text-lg">{schoolName}</h1>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-3 justify-self-end md:justify-self-end">
          {!isAdmin ? (
            <Link to="/login" className="text-sm text-amber-600 hover:text-amber-700">
              Войти
            </Link>
          ) : (
            <>
              <Link to="/admin" className="text-sm text-blue-600 hover:text-blue-700">
                Админка
              </Link>
              <button type="button" onClick={logout} className="text-sm text-red-600 hover:text-red-700">
                Выйти
              </button>
            </>
          )}
        </div>

        <div className="col-span-2 flex justify-center md:col-span-1 md:col-start-2 md:row-start-1">
          <h2 className="text-lg font-semibold text-gray-800 md:text-xl">{pageTitle}</h2>
        </div>
      </header>

      <main className="mx-auto mb-4 w-full max-w-[1800px]">
        <Outlet />
      </main>

      <footer className="my-6 text-center text-gray-600">© 2026 {schoolName}. Все права защищены.</footer>
    </div>
  )
}

export default App
