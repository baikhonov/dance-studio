import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../db/client.js'
import { lessonLevels, lessonTeachers, lessons } from '../db/schema.js'

export type LessonFilters = {
  day?: string
  directionId?: number
  levelId?: number
}

export type LessonPayload = {
  day: string
  time: string
  endTime: string
  crossesMidnight: boolean
  directionId: number
  levelIds: number[]
  teacherIds: number[]
  poster: string | null
}

export const listLessons = async (filters: LessonFilters = {}) => {
  const conditions = []
  if (filters.day) conditions.push(eq(lessons.day, filters.day))
  if (filters.directionId) conditions.push(eq(lessons.directionId, filters.directionId))

  const lessonRows =
    conditions.length > 0 ? await db.select().from(lessons).where(and(...conditions)) : await db.select().from(lessons)

  if (lessonRows.length === 0) return []

  const lessonIds = lessonRows.map((lesson) => lesson.id)
  const [teacherLinks, levelLinks] = await Promise.all([
    db.select().from(lessonTeachers).where(inArray(lessonTeachers.lessonId, lessonIds)),
    db.select().from(lessonLevels).where(inArray(lessonLevels.lessonId, lessonIds)),
  ])

  const teacherIdsByLesson = new Map<number, number[]>()
  for (const link of teacherLinks) {
    const ids = teacherIdsByLesson.get(link.lessonId) ?? []
    ids.push(link.teacherId)
    teacherIdsByLesson.set(link.lessonId, ids)
  }

  const levelIdsByLesson = new Map<number, number[]>()
  for (const link of levelLinks) {
    const ids = levelIdsByLesson.get(link.lessonId) ?? []
    ids.push(link.levelId)
    levelIdsByLesson.set(link.lessonId, ids)
  }

  return lessonRows.map((lesson) => ({
    id: lesson.id,
    day: lesson.day,
    time: lesson.time,
    endTime: lesson.endTime,
    crossesMidnight: lesson.crossesMidnight,
    directionId: lesson.directionId,
    levelIds: levelIdsByLesson.get(lesson.id) ?? [],
    teacherIds: teacherIdsByLesson.get(lesson.id) ?? [],
    poster: lesson.poster,
  })).filter((lesson) =>
    filters.levelId ? lesson.levelIds.length === 0 || lesson.levelIds.includes(filters.levelId) : true,
  )
}

export const getLessonById = async (id: number) => {
  const rows = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1)
  return rows[0] ?? null
}

export const createLesson = async (payload: LessonPayload) => {
  const insertedRows = await db
    .insert(lessons)
    .values({
      day: payload.day,
      time: payload.time,
      endTime: payload.endTime,
      crossesMidnight: payload.crossesMidnight,
      directionId: payload.directionId,
      poster: payload.poster,
    })
    .returning({ id: lessons.id })

  const inserted = insertedRows[0]?.id
  if (!inserted) return null

  const inserts: Promise<unknown>[] = []
  if (payload.teacherIds.length > 0) {
    inserts.push(
      db.insert(lessonTeachers).values(
        payload.teacherIds.map((teacherId) => ({
          lessonId: inserted,
          teacherId,
        })),
      ),
    )
  }
  if (payload.levelIds.length > 0) {
    inserts.push(
      db.insert(lessonLevels).values(
        payload.levelIds.map((levelId) => ({
          lessonId: inserted,
          levelId,
        })),
      ),
    )
  }
  if (inserts.length > 0) {
    await Promise.all(inserts)
  }

  return inserted
}

export const updateLesson = async (id: number, payload: LessonPayload) => {
  await db
    .update(lessons)
    .set({
      day: payload.day,
      time: payload.time,
      endTime: payload.endTime,
      crossesMidnight: payload.crossesMidnight,
      directionId: payload.directionId,
      poster: payload.poster,
    })
    .where(eq(lessons.id, id))

  await Promise.all([
    db.delete(lessonTeachers).where(eq(lessonTeachers.lessonId, id)),
    db.delete(lessonLevels).where(eq(lessonLevels.lessonId, id)),
  ])

  const inserts: Promise<unknown>[] = []
  if (payload.teacherIds.length > 0) {
    inserts.push(
      db.insert(lessonTeachers).values(
        payload.teacherIds.map((teacherId) => ({
          lessonId: id,
          teacherId,
        })),
      ),
    )
  }
  if (payload.levelIds.length > 0) {
    inserts.push(
      db.insert(lessonLevels).values(
        payload.levelIds.map((levelId) => ({
          lessonId: id,
          levelId,
        })),
      ),
    )
  }
  if (inserts.length > 0) {
    await Promise.all(inserts)
  }
}

export const deleteLesson = async (id: number) => {
  const deleted = await db.delete(lessons).where(eq(lessons.id, id)).returning({ id: lessons.id })
  return deleted.length > 0
}
