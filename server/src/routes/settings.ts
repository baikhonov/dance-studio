import { Router } from 'express'
import { getStudioSettings, updateStudioSettings } from '../services/settingsService.js'

const settingsRouter = Router()

settingsRouter.get('/', async (_req, res, next) => {
  try {
    const settings = await getStudioSettings()
    return res.json(settings)
  } catch (error) {
    return next(error)
  }
})

settingsRouter.put('/', async (req, res, next) => {
  try {
    const { schoolName, logoPath } = req.body as { schoolName?: unknown; logoPath?: unknown }

    if (typeof schoolName !== 'string' || schoolName.trim() === '') {
      return res.status(400).json({ error: 'Invalid school name' })
    }
    if (logoPath !== null && typeof logoPath !== 'string') {
      return res.status(400).json({ error: 'Invalid logo path' })
    }

    const updated = await updateStudioSettings({
      schoolName: schoolName.trim(),
      logoPath: typeof logoPath === 'string' ? logoPath.trim() : null,
    })
    return res.json(updated)
  } catch (error) {
    return next(error)
  }
})

export { settingsRouter }
