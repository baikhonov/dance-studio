import { sqlite } from '../db/client.js'

const normalizeLegacyAssets = () => {
  const updateTeachers = sqlite.prepare(`
    UPDATE teachers
    SET photo = ''
    WHERE photo IS NOT NULL
      AND TRIM(photo) != ''
      AND INSTR(photo, '/') = 0
      AND photo NOT LIKE 'http://%'
      AND photo NOT LIKE 'https://%'
  `)

  const updatePosters = sqlite.prepare(`
    UPDATE lessons
    SET poster = NULL
    WHERE poster IS NOT NULL
      AND TRIM(poster) != ''
      AND INSTR(poster, '/') = 0
      AND poster NOT LIKE 'http://%'
      AND poster NOT LIKE 'https://%'
  `)

  const teachersResult = updateTeachers.run()
  const postersResult = updatePosters.run()

  console.log(
    `Normalized legacy assets: teachers=${teachersResult.changes}, posters=${postersResult.changes}`,
  )
}

try {
  normalizeLegacyAssets()
} catch (error) {
  console.error('Legacy asset normalization failed:', error)
  process.exitCode = 1
} finally {
  sqlite.close()
}
