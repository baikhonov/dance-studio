import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'

type AuthPayload = {
  role: 'admin'
}

const getJwtSecret = (): Secret => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }
  return secret
}

export const validateAdminPassword = (password: string): boolean => {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    throw new Error('ADMIN_PASSWORD is not configured')
  }
  return password === expected
}

export const issueToken = (): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d'
  const payload: AuthPayload = { role: 'admin' }
  return jwt.sign(payload, getJwtSecret(), { expiresIn } as SignOptions)
}

export const verifyToken = (token: string): AuthPayload => {
  const decoded = jwt.verify(token, getJwtSecret())
  if (typeof decoded === 'string' || !decoded || decoded.role !== 'admin') {
    throw new Error('Invalid token payload')
  }
  return decoded as AuthPayload
}
