import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { errorHandler } from './middleware/errorHandler.js'
import { apiRouter } from './routes/index.js'

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

app.use('/api', apiRouter)
app.use(errorHandler)

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on http://localhost:${port}`)
})
