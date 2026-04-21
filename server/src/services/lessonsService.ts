import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../db/client.js'
import { lessonTeachers, lessons } from '../db/schema.js'

export type LessonFilters = {
  day?: string
  directionId?: number
  levelId?: number
}

export type LessonPayload = {
  day: string
  time: string
  endTime: string
  directionId: number
  levelId: number | null
  teacherIds: number[]
  poster: string | null
}

export const listLessons = async (filters: LessonFilters = {}) => {
  const conditions = []
  if (filters.day) conditions.push(eq(lessons.day, filters.day))
  if (filters.directionId) conditions.push(eq(lessons.directionId, filters.directionId))
  if (filters.levelId) conditions.push(eq(lessons.levelId, filters.levelId))

  const lessonRows =
    conditions.length > 0 ? await db.select().from(lessons).where(and(...conditions)) : await db.select().from(lessons)

  if (lessonRows.length === 0) return []

  const lessonIds = lessonRows.map((lesson) => lesson.id)
  const links = await db.select().from(lessonTeachers).where(inArray(lessonTeachers.lessonId, lessonIds))

  const teacherIdsByLesson = new Map<number, number[]>()
  for (const link of links) {
    const ids = teacherIdsByLesson.get(link.lessonId) ?? []
    ids.push(link.teacherId)
    teacherIdsByLesson.set(link.lessonId, ids)
  }

  return lessonRows.map((lesson) => ({
    id: lesson.id,
    day: lesson.day,
    time: lesson.time,
    endTime: lesson.endTime,
    directionId: lesson.directionId,
    levelId: lesson.levelId,
    teacherIds: teacherIdsByLesson.get(lesson.id) ?? [],
    poster: lesson.poster,
  }))
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
      directionId: payload.directionId,
      levelId: payload.levelId,
      poster: payload.poster,
    })
    .returning({ id: lessons.id })

  const inserted = insertedRows[0]?.id
  if (!inserted) return null

  if (payload.teacherIds.length > 0) {
    await db.insert(lessonTeachers).values(
      payload.teacherIds.map((teacherId) => ({
        lessonId: inserted,
        teacherId,
      })),
    )
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
      directionId: payload.directionId,
      levelId: payload.levelId,
      poster: payload.poster,
    })
    .where(eq(lessons.id, id))

  await db.delete(lessonTeachers).where(eq(lessonTeachers.lessonId, id))
  if (payload.teacherIds.length > 0) {
    await db.insert(lessonTeachers).values(
      payload.teacherIds.map((teacherId) => ({
        lessonId: id,
        teacherId,
      })),
    )
  }
}

export const deleteLesson = async (id: number) => {
  const deleted = await db.delete(lessons).where(eq(lessons.id, id)).returning({ id: lessons.id })
  return deleted.length > 0
}
