import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { levels } from '../db/schema.js'

export const listLevels = async () => db.select().from(levels)

export const createLevel = async (payload: { name: string; color: string }) => {
  const inserted = await db.insert(levels).values(payload).returning()
  return inserted[0]
}

export const updateLevel = async (id: number, payload: { name: string; color: string }) => {
  const updated = await db.update(levels).set(payload).where(eq(levels.id, id)).returning()
  return updated[0] ?? null
}

export const deleteLevel = async (id: number) => {
  const deleted = await db.delete(levels).where(eq(levels.id, id)).returning({ id: levels.id })
  return deleted.length > 0
}
