import { Router } from 'express'
import { createTeacher, deleteTeacher, listTeachers, updateTeacher } from '../services/teachersService.js'
import { parseNumericId } from '../utils/parsers.js'

const teachersRouter = Router()

teachersRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await listTeachers()
    return res.json(rows)
  } catch (error) {
    return next(error)
  }
})

teachersRouter.post('/', async (req, res, next) => {
  try {
    const { name, photo } = req.body as { name?: unknown; photo?: unknown }
    if (typeof name !== 'string' || name.trim() === '' || typeof photo !== 'string') {
      return res.status(400).json({ error: 'Invalid teacher payload' })
    }
    const inserted = await createTeacher({ name: name.trim(), photo: photo.trim() })
    return res.status(201).json(inserted)
  } catch (error) {
    return next(error)
  }
})

teachersRouter.put('/:id', async (req, res, next) => {
  try {
    const id = parseNumericId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid teacher id' })
    const { name, photo } = req.body as { name?: unknown; photo?: unknown }
    if (typeof name !== 'string' || name.trim() === '' || typeof photo !== 'string') {
      return res.status(400).json({ error: 'Invalid teacher payload' })
    }
    const updated = await updateTeacher(id, { name: name.trim(), photo: photo.trim() })
    if (!updated) return res.status(404).json({ error: 'Teacher not found' })
    return res.json(updated)
  } catch (error) {
    return next(error)
  }
})

teachersRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = parseNumericId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid teacher id' })
    const deleted = await deleteTeacher(id)
    if (!deleted) return res.status(404).json({ error: 'Teacher not found' })
    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
})

export { teachersRouter }
