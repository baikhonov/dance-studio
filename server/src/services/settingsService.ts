import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { studioSettings } from '../db/schema.js'

const DEFAULT_SETTINGS = {
  id: 1,
  schoolName: 'Школа танцев',
  logoPath: null as string | null,
}

export type StudioSettingsPayload = {
  schoolName: string
  logoPath: string | null
}

const ensureSingleton = async () => {
  const rows = await db.select().from(studioSettings).where(eq(studioSettings.id, 1)).limit(1)
  if (rows.length > 0) {
    return rows[0]
  }

  const inserted = await db.insert(studioSettings).values(DEFAULT_SETTINGS).returning()
  return inserted[0]
}

export const getStudioSettings = async () => {
  const row = await ensureSingleton()
  return {
    schoolName: row.schoolName,
    logoPath: row.logoPath,
  }
}

export const updateStudioSettings = async (payload: StudioSettingsPayload) => {
  await ensureSingleton()
  const updated = await db
    .update(studioSettings)
    .set({
      schoolName: payload.schoolName,
      logoPath: payload.logoPath,
    })
    .where(eq(studioSettings.id, 1))
    .returning()

  return {
    schoolName: updated[0].schoolName,
    logoPath: updated[0].logoPath,
  }
}
