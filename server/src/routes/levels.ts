import { Router } from 'express'
import { createLevel, deleteLevel, listLevels, updateLevel } from '../services/levelsService.js'
import { parseNumericId } from '../utils/parsers.js'

const levelsRouter = Router()

levelsRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await listLevels()
    return res.json(rows)
  } catch (error) {
    return next(error)
  }
})

levelsRouter.post('/', async (req, res, next) => {
  try {
    const { name } = req.body as { name?: unknown }
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Invalid level payload' })
    }
    const inserted = await createLevel({ name: name.trim() })
    return res.status(201).json(inserted)
  } catch (error) {
    return next(error)
  }
})

levelsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = parseNumericId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid level id' })
    const { name } = req.body as { name?: unknown }
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Invalid level payload' })
    }
    const updated = await updateLevel(id, { name: name.trim() })
    if (!updated) return res.status(404).json({ error: 'Level not found' })
    return res.json(updated)
  } catch (error) {
    return next(error)
  }
})

levelsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = parseNumericId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid level id' })
    const deleted = await deleteLevel(id)
    if (!deleted) return res.status(404).json({ error: 'Level not found' })
    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
})

export { levelsRouter }
