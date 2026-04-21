import fs from 'node:fs/promises'
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
const outputPath = path.resolve(process.cwd(), process.env.SQLITE_EXPORT_SQL_PATH ?? './data/sqlite-export.sql')

const db = new sqlite3.Database(sqlitePath, sqlite3.OPEN_READONLY)

const all = <T>(query: string): Promise<T[]> =>
  new Promise((resolve, reject) => {
    db.all(query, (error, rows) => {
      if (error) return reject(error)
      resolve(rows as T[])
    })
  })

const close = (): Promise<void> =>
  new Promise((resolve, reject) => {
    db.close((error) => {
      if (error) return reject(error)
      resolve()
    })
  })

const quote = (value: unknown, table: string, column: string) => {
  if (value === null || value === undefined) return 'NULL'
  if (table === 'lessons' && column === 'crosses_midnight') {
    if (value === 1 || value === '1' || value === true) return 'TRUE'
    return 'FALSE'
  }
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  return `'${String(value).replaceAll("'", "''")}'`
}

try {
  const chunks: string[] = [
    '-- Generated from SQLite for PostgreSQL import',
    'BEGIN;',
    'TRUNCATE TABLE lesson_teachers, lesson_levels, lessons, teachers, directions, levels, studio_settings RESTART IDENTITY CASCADE;',
  ]

  for (const table of tables) {
    const rows = await all<Record<string, unknown>>(`SELECT * FROM ${table};`)
    if (rows.length === 0) continue

    const columns = Object.keys(rows[0])
    const values = rows.map((row) => `(${columns.map((column) => quote(row[column], table, column)).join(', ')})`)
    chunks.push(`INSERT INTO ${table} (${columns.join(', ')}) VALUES`)
    chunks.push(`${values.join(',\n')};`)
  }

  // Keep serial sequences in sync after explicit id inserts.
  chunks.push(
    "SELECT setval(pg_get_serial_sequence('directions', 'id'), COALESCE((SELECT MAX(id) FROM directions), 1), true);",
  )
  chunks.push(
    "SELECT setval(pg_get_serial_sequence('levels', 'id'), COALESCE((SELECT MAX(id) FROM levels), 1), true);",
  )
  chunks.push(
    "SELECT setval(pg_get_serial_sequence('teachers', 'id'), COALESCE((SELECT MAX(id) FROM teachers), 1), true);",
  )
  chunks.push(
    "SELECT setval(pg_get_serial_sequence('lessons', 'id'), COALESCE((SELECT MAX(id) FROM lessons), 1), true);",
  )

  chunks.push('COMMIT;')
  await fs.writeFile(outputPath, `${chunks.join('\n')}\n`, 'utf-8')
  console.log(`SQLite export written to ${outputPath}`)
} catch (error) {
  console.error('SQLite export failed:', error)
  process.exitCode = 1
} finally {
  await close()
}
