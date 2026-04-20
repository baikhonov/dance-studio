import { Router } from 'express'
import { createDirection, deleteDirection, listDirections, updateDirection } from '../services/directionsService.js'
import { parseNumericId } from '../utils/parsers.js'

const directionsRouter = Router()

directionsRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await listDirections()
    return res.json(rows)
  } catch (error) {
    return next(error)
  }
})

directionsRouter.post('/', async (req, res, next) => {
  try {
    const { name } = req.body as { name?: unknown }
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Invalid direction payload' })
    }
    const inserted = await createDirection({ name: name.trim() })
    return res.status(201).json(inserted)
  } catch (error) {
    return next(error)
  }
})

directionsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = parseNumericId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid direction id' })
    const { name } = req.body as { name?: unknown }
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Invalid direction payload' })
    }
    const updated = await updateDirection(id, { name: name.trim() })
    if (!updated) return res.status(404).json({ error: 'Direction not found' })
    return res.json(updated)
  } catch (error) {
    return next(error)
  }
})

directionsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = parseNumericId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid direction id' })
    const deleted = await deleteDirection(id)
    if (!deleted) return res.status(404).json({ error: 'Direction not found' })
    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
})

export { directionsRouter }
