import { sql } from 'drizzle-orm'
import { db, pool } from '../db/client.js'

const normalizeLegacyAssets = async () => {
  const teachersResult = await db.execute(sql`
    UPDATE teachers
    SET photo = ''
    WHERE photo IS NOT NULL
      AND BTRIM(photo) != ''
      AND POSITION('/' IN photo) = 0
      AND photo NOT LIKE 'http://%'
      AND photo NOT LIKE 'https://%'
  `)
  const postersResult = await db.execute(sql`
    UPDATE lessons
    SET poster = NULL
    WHERE poster IS NOT NULL
      AND BTRIM(poster) != ''
      AND POSITION('/' IN poster) = 0
      AND poster NOT LIKE 'http://%'
      AND poster NOT LIKE 'https://%'
  `)

  console.log(
    `Normalized legacy assets: teachers=${teachersResult.rowCount ?? 0}, posters=${postersResult.rowCount ?? 0}`,
  )
}

try {
  await normalizeLegacyAssets()
} catch (error) {
  console.error('Legacy asset normalization failed:', error)
  process.exitCode = 1
} finally {
  void pool.end()
}
