import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { directions } from '../db/schema.js'

export const listDirections = async () => db.select().from(directions)

export const createDirection = async (payload: { name: string; description: string | null }) => {
  const inserted = await db.insert(directions).values(payload).returning()
  return inserted[0]
}

export const updateDirection = async (id: number, payload: { name: string; description: string | null }) => {
  const updated = await db.update(directions).set(payload).where(eq(directions.id, id)).returning()
  return updated[0] ?? null
}

export const deleteDirection = async (id: number) => {
  const deleted = await db.delete(directions).where(eq(directions.id, id)).returning({ id: directions.id })
  return deleted.length > 0
}
