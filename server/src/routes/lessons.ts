import { Router } from 'express'
import { parseNumericId, parseOptionalNumeric, parseTeacherIds } from '../utils/parsers.js'
import { createLesson, deleteLesson, getLessonById, listLessons, updateLesson } from '../services/lessonsService.js'

const lessonsRouter = Router()

lessonsRouter.get('/', async (req, res, next) => {
  try {
    const directionIdQuery = req.query.directionId
    const levelIdQuery = req.query.levelId
    const dayQuery = req.query.day

    const directionId =
      typeof directionIdQuery === 'string' && directionIdQuery ? parseNumericId(directionIdQuery) : undefined
    if (typeof directionIdQuery === 'string' && directionIdQuery && directionId === null) {
      return res.status(400).json({ error: 'Invalid directionId query param' })
    }

    const levelId = typeof levelIdQuery === 'string' && levelIdQuery ? parseNumericId(levelIdQuery) : undefined
    if (typeof levelIdQuery === 'string' && levelIdQuery && levelId === null) {
      return res.status(400).json({ error: 'Invalid levelId query param' })
    }

    const day = typeof dayQuery === 'string' && dayQuery.trim() ? dayQuery.trim() : undefined
    const data = await listLessons({ day, directionId: directionId ?? undefined, levelId: levelId ?? undefined })
    return res.json(data)
  } catch (error) {
    return next(error)
  }
})

lessonsRouter.post('/', async (req, res, next) => {
  try {
    const { day, time, endTime, directionId, levelId, teacherIds, poster } = req.body as {
      day?: unknown
      time?: unknown
      endTime?: unknown
      directionId?: unknown
      levelId?: unknown
      teacherIds?: unknown
      poster?: unknown
    }

    if (
      typeof day !== 'string' ||
      typeof time !== 'string' ||
      typeof endTime !== 'string' ||
      typeof directionId !== 'number' ||
      !Number.isInteger(directionId) ||
      directionId <= 0
    ) {
      return res.status(400).json({ error: 'Invalid lesson payload' })
    }

    const normalizedLevelId = parseOptionalNumeric(levelId)
    if (levelId !== undefined && levelId !== null && normalizedLevelId === null) {
      return res.status(400).json({ error: 'Invalid levelId' })
    }

    const normalizedPoster = poster === null ? null : typeof poster === 'string' ? poster : null
    const normalizedTeacherIds = parseTeacherIds(teacherIds)

    const inserted = await createLesson({
      day: day.trim(),
      time: time.trim(),
      endTime: endTime.trim(),
      directionId,
      levelId: normalizedLevelId,
      teacherIds: normalizedTeacherIds,
      poster: normalizedPoster,
    })
    if (!inserted) {
      return res.status(500).json({ error: 'Failed to create lesson' })
    }

    const fullList = await listLessons()
    const createdLesson = fullList.find((lesson) => lesson.id === inserted)
    return res.status(201).json(createdLesson)
  } catch (error) {
    return next(error)
  }
})

lessonsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = parseNumericId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid lesson id' })

    const existing = await getLessonById(id)
    if (!existing) return res.status(404).json({ error: 'Lesson not found' })

    const { day, time, endTime, directionId, levelId, teacherIds, poster } = req.body as {
      day?: unknown
      time?: unknown
      endTime?: unknown
      directionId?: unknown
      levelId?: unknown
      teacherIds?: unknown
      poster?: unknown
    }

    if (
      typeof day !== 'string' ||
      typeof time !== 'string' ||
      typeof endTime !== 'string' ||
      typeof directionId !== 'number' ||
      !Number.isInteger(directionId) ||
      directionId <= 0
    ) {
      return res.status(400).json({ error: 'Invalid lesson payload' })
    }

    const normalizedLevelId = parseOptionalNumeric(levelId)
    if (levelId !== undefined && levelId !== null && normalizedLevelId === null) {
      return res.status(400).json({ error: 'Invalid levelId' })
    }

    const normalizedPoster = poster === null ? null : typeof poster === 'string' ? poster : null
    const normalizedTeacherIds = parseTeacherIds(teacherIds)

    await updateLesson(id, {
      day: day.trim(),
      time: time.trim(),
      endTime: endTime.trim(),
      directionId,
      levelId: normalizedLevelId,
      teacherIds: normalizedTeacherIds,
      poster: normalizedPoster,
    })

    const fullList = await listLessons()
    const updated = fullList.find((lesson) => lesson.id === id)
    return res.json(updated)
  } catch (error) {
    return next(error)
  }
})

lessonsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = parseNumericId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid lesson id' })

    const deleted = await deleteLesson(id)
    if (!deleted) return res.status(404).json({ error: 'Lesson not found' })
    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
})

export { lessonsRouter }
