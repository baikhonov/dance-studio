import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../services/authService.js'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export const requireAuthForMutations = (req: Request, res: Response, next: NextFunction) => {
  if (!MUTATING_METHODS.has(req.method)) {
    return next()
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.slice('Bearer '.length).trim()
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    verifyToken(token)
    return next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
