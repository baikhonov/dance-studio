import path from 'node:path'
import sqlite3 from 'sqlite3'

const tables = [
  'directions',
  'levels',
  'teachers',
  'studio_settings',
  'lessons',
  'lesson_levels',
  'lesson_teachers',
] as const

const sqlitePath = path.resolve(process.cwd(), process.env.SQLITE_SOURCE_PATH ?? './data/app.db')
const db = new sqlite3.Database(sqlitePath, sqlite3.OPEN_READONLY)

const get = <T>(query: string): Promise<T> =>
  new Promise((resolve, reject) => {
    db.get(query, (error, row) => {
      if (error) return reject(error)
      resolve(row as T)
    })
  })

const close = (): Promise<void> =>
  new Promise((resolve, reject) => {
    db.close((error) => {
      if (error) return reject(error)
      resolve()
    })
  })

try {
  for (const table of tables) {
    const row = await get<{ count: number }>(`SELECT COUNT(*) AS count FROM ${table};`)
    console.log(`${table}=${row.count}`)
  }
} catch (error) {
  console.error('SQLite count check failed:', error)
  process.exitCode = 1
} finally {
  await close()
}
