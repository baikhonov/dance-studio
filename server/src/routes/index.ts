import { Router } from 'express'
import { requireAuthForMutations } from '../middleware/auth.js'
import { authRouter } from './auth.js'
import { directionsRouter } from './directions.js'
import { lessonsRouter } from './lessons.js'
import { levelsRouter } from './levels.js'
import { teachersRouter } from './teachers.js'

const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use(requireAuthForMutations)

apiRouter.use('/lessons', lessonsRouter)
apiRouter.use('/teachers', teachersRouter)
apiRouter.use('/directions', directionsRouter)
apiRouter.use('/levels', levelsRouter)

apiRouter.use((_req, res) => {
  res.status(404).json({ error: 'API route not found' })
})

export { apiRouter }
