import 'dotenv/config'
import path from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

const sqlitePath = process.env.SQLITE_PATH ?? './data/app.db'
const resolvedPath = path.resolve(process.cwd(), sqlitePath)

export const sqlite = new Database(resolvedPath)
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite)
