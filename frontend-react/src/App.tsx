import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AUTH_UNAUTHORIZED_EVENT, clearAuthToken, isAuthenticated } from './auth/session'

function App() {
  const schoolName = 'Dance Studio'
  const location = useLocation()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAuthenticated())

  const pageTitle = location.pathname === '/admin' ? 'Администрирование' : 'Расписание занятий'

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
            <h1 className="truncate text-base font-semibold text-gray-800 md:text-lg">{schoolName}</h1>
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
