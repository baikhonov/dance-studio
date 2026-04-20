import { sql } from 'drizzle-orm'
import { db, sqlite } from './db/client.js'
import { directions, lessonTeachers, lessons, levels, teachers } from './db/schema.js'
import { seedDirections, seedLessons, seedLevels, seedTeachers } from './db/seedData.js'

const resetDatabase = () => {
  sqlite.exec('PRAGMA foreign_keys = OFF;')
  sqlite.exec('DELETE FROM lesson_teachers;')
  sqlite.exec('DELETE FROM lessons;')
  sqlite.exec('DELETE FROM teachers;')
  sqlite.exec('DELETE FROM directions;')
  sqlite.exec('DELETE FROM levels;')
  sqlite.exec('DELETE FROM sqlite_sequence;')
  sqlite.exec('PRAGMA foreign_keys = ON;')
}

const seed = async () => {
  resetDatabase()

  await db.insert(directions).values(seedDirections)
  await db.insert(levels).values(seedLevels)
  await db.insert(teachers).values(seedTeachers)
  await db.insert(lessons).values(
    seedLessons.map((lesson) => ({
      id: lesson.id,
      day: lesson.day,
      time: lesson.time,
      endTime: lesson.endTime,
      directionId: lesson.directionId,
      levelId: lesson.levelId,
      type: lesson.type,
      poster: lesson.poster,
    })),
  )

  const seedLessonTeachers = seedLessons.flatMap((lesson) =>
    lesson.teacherIds.map((teacherId) => ({
      lessonId: lesson.id,
      teacherId,
    })),
  )
  if (seedLessonTeachers.length > 0) {
    await db.insert(lessonTeachers).values(seedLessonTeachers)
  }

  const [{ count: directionsCount }] = await db.select({ count: sql<number>`count(*)` }).from(directions)
  const [{ count: levelsCount }] = await db.select({ count: sql<number>`count(*)` }).from(levels)
  const [{ count: teachersCount }] = await db.select({ count: sql<number>`count(*)` }).from(teachers)
  const [{ count: lessonsCount }] = await db.select({ count: sql<number>`count(*)` }).from(lessons)
  const [{ count: linksCount }] = await db.select({ count: sql<number>`count(*)` }).from(lessonTeachers)

  console.log(
    `Seeded: directions=${directionsCount}, levels=${levelsCount}, teachers=${teachersCount}, lessons=${lessonsCount}, lessonTeachers=${linksCount}`,
  )
}

seed()
  .catch((error: unknown) => {
    console.error('Seed failed:', error)
    process.exitCode = 1
  })
  .finally(() => {
    sqlite.close()
  })
