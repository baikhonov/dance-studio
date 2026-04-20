import { Router } from 'express'
import { issueToken, validateAdminPassword } from '../services/authService.js'

const authRouter = Router()

authRouter.post('/login', (req, res, next) => {
  try {
    const { password } = req.body as { password?: unknown }
    if (typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ error: 'Invalid login payload' })
    }

    if (!validateAdminPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = issueToken()
    return res.json({ token })
  } catch (error) {
    return next(error)
  }
})

export { authRouter }
