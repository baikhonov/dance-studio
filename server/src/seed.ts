import { sql } from 'drizzle-orm'
import { db, pool } from './db/client.js'
import { directions, lessonLevels, lessonTeachers, lessons, levels, studioSettings, teachers } from './db/schema.js'
import { seedDirections, seedLessons, seedLevels, seedTeachers } from './db/seedData.js'

const resetDatabase = async () => {
  await db.execute(sql`TRUNCATE TABLE lesson_teachers, lesson_levels, lessons, teachers, directions, levels, studio_settings RESTART IDENTITY CASCADE`)
}

const seed = async () => {
  await resetDatabase()

  await db.insert(directions).values(
    seedDirections.map((direction) => ({
      id: direction.id,
      name: direction.name,
      description: direction.description,
    })),
  )
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
    void pool.end()
  })
