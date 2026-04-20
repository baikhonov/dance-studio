import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { teachers } from '../db/schema.js'

export const listTeachers = async () => db.select().from(teachers)

export const createTeacher = async (payload: { name: string; photo: string }) => {
  const inserted = await db.insert(teachers).values(payload).returning()
  return inserted[0]
}

export const updateTeacher = async (id: number, payload: { name: string; photo: string }) => {
  const updated = await db.update(teachers).set(payload).where(eq(teachers.id, id)).returning()
  return updated[0] ?? null
}

export const deleteTeacher = async (id: number) => {
  const deleted = await db.delete(teachers).where(eq(teachers.id, id)).returning({ id: teachers.id })
  return deleted.length > 0
}
