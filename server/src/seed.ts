import { sql } from 'drizzle-orm'
import { db, sqlite } from './db/client.js'
import { directions, lessonLevels, lessonTeachers, lessons, levels, studioSettings, teachers } from './db/schema.js'
import { seedDirections, seedLessons, seedLevels, seedTeachers } from './db/seedData.js'

const resetDatabase = () => {
  sqlite.exec('PRAGMA foreign_keys = OFF;')
  sqlite.exec('DELETE FROM lesson_teachers;')
  sqlite.exec('DELETE FROM lesson_levels;')
  sqlite.exec('DELETE FROM lessons;')
  sqlite.exec('DELETE FROM teachers;')
  sqlite.exec('DELETE FROM directions;')
  sqlite.exec('DELETE FROM levels;')
  sqlite.exec('DELETE FROM studio_settings;')
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
      crossesMidnight: lesson.crossesMidnight,
      directionId: lesson.directionId,
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

  const seedLessonLevels = seedLessons.flatMap((lesson) =>
    lesson.levelIds.map((levelId) => ({
      lessonId: lesson.id,
      levelId,
    })),
  )
  if (seedLessonLevels.length > 0) {
    await db.insert(lessonLevels).values(seedLessonLevels)
  }

  const [{ count: directionsCount }] = await db.select({ count: sql<number>`count(*)` }).from(directions)
  const [{ count: levelsCount }] = await db.select({ count: sql<number>`count(*)` }).from(levels)
  const [{ count: teachersCount }] = await db.select({ count: sql<number>`count(*)` }).from(teachers)
  const [{ count: lessonsCount }] = await db.select({ count: sql<number>`count(*)` }).from(lessons)
  const [{ count: linksCount }] = await db.select({ count: sql<number>`count(*)` }).from(lessonTeachers)
  const [{ count: levelLinksCount }] = await db.select({ count: sql<number>`count(*)` }).from(lessonLevels)

  console.log(
    `Seeded: directions=${directionsCount}, levels=${levelsCount}, teachers=${teachersCount}, lessons=${lessonsCount}, lessonTeachers=${linksCount}, lessonLevels=${levelLinksCount}`,
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
