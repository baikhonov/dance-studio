import type { NextFunction, Request, Response } from 'express'

export const errorHandler = (err: unknown, _req: Request, res: Response, next: NextFunction) => {
  void next
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
