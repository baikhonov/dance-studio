import { relations } from 'drizzle-orm'
import { boolean, integer, pgTable, primaryKey, serial, text } from 'drizzle-orm/pg-core'

export const directions = pgTable('directions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
})

export const levels = pgTable('levels', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').notNull().default('#f59e0b'),
})

export const teachers = pgTable('teachers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  photo: text('photo').notNull(),
})

export const studioSettings = pgTable('studio_settings', {
  id: integer('id').primaryKey(),
  schoolName: text('school_name').notNull(),
  logoPath: text('logo_path'),
})

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  day: text('day').notNull(),
  time: text('time').notNull(),
  endTime: text('end_time').notNull(),
  crossesMidnight: boolean('crosses_midnight').notNull().default(false),
  directionId: integer('direction_id')
    .notNull()
    .references(() => directions.id, { onDelete: 'cascade' }),
  poster: text('poster'),
})

export const lessonLevels = pgTable(
  'lesson_levels',
  {
    lessonId: integer('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    levelId: integer('level_id')
      .notNull()
      .references(() => levels.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.lessonId, table.levelId] })],
)

export const lessonTeachers = pgTable(
  'lesson_teachers',
  {
    lessonId: integer('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    teacherId: integer('teacher_id')
      .notNull()
      .references(() => teachers.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.lessonId, table.teacherId] })],
)

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  direction: one(directions, {
    fields: [lessons.directionId],
    references: [directions.id],
  }),
  lessonLevels: many(lessonLevels),
  lessonTeachers: many(lessonTeachers),
}))

export const directionsRelations = relations(directions, ({ many }) => ({
  lessons: many(lessons),
}))

export const levelsRelations = relations(levels, ({ many }) => ({
  lessonLevels: many(lessonLevels),
}))

export const teachersRelations = relations(teachers, ({ many }) => ({
  lessonTeachers: many(lessonTeachers),
}))

export const lessonTeachersRelations = relations(lessonTeachers, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonTeachers.lessonId],
    references: [lessons.id],
  }),
  teacher: one(teachers, {
    fields: [lessonTeachers.teacherId],
    references: [teachers.id],
  }),
}))

export const lessonLevelsRelations = relations(lessonLevels, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonLevels.lessonId],
    references: [lessons.id],
  }),
  level: one(levels, {
    fields: [lessonLevels.levelId],
    references: [levels.id],
  }),
}))
