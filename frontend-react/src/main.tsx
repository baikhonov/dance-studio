import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { initThemeMode } from './utils/theme'

initThemeMode()
import { isAuthenticated } from './auth/session'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'
import { SchedulePage } from './pages/SchedulePage'

function RequireAdmin({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<SchedulePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route
            path="admin"
            element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
