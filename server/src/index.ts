import 'dotenv/config'
import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import { db } from './db/client.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) ?? true,
  }),
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api', (_req, res) => {
  void db
  res.status(404).json({ error: 'API routes not implemented yet' })
})

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  void next
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on http://localhost:${port}`)
})
