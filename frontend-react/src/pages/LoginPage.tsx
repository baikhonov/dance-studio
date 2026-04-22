import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginRequest } from '../api/auth'
import { setAuthToken } from '../auth/session'

export function LoginPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const login = async () => {
    if (!password.trim()) {
      setError('Введите пароль')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      const token = await loginRequest(password)
      setAuthToken(token)
      navigate('/admin')
    } catch {
      setError('Неверный пароль')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div className="w-96 rounded-lg border border-transparent bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Вход для администратора</h2>

        <div className="mb-4">
          <label className="mb-2 block text-gray-700">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') void login()
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
        </div>

        <button
          onClick={() => void login()}
          disabled={isSubmitting}
          className="w-full rounded-lg bg-amber-500 py-2 text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
        >
          {isSubmitting ? 'Вход...' : 'Войти'}
        </button>

        {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
      </div>
    </div>
  )
}
