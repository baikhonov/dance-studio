import { relations } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const directions = sqliteTable('directions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
})

export const levels = sqliteTable('levels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
})

export const teachers = sqliteTable('teachers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  photo: text('photo').notNull(),
})

export const lessons = sqliteTable('lessons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  day: text('day').notNull(),
  time: text('time').notNull(),
  endTime: text('end_time').notNull(),
  directionId: integer('direction_id')
    .notNull()
    .references(() => directions.id, { onDelete: 'cascade' }),
  levelId: integer('level_id').references(() => levels.id, { onDelete: 'set null' }),
  type: text('type', { enum: ['lesson', 'event'] }).notNull(),
  poster: text('poster'),
})

export const lessonTeachers = sqliteTable(
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
  level: one(levels, {
    fields: [lessons.levelId],
    references: [levels.id],
  }),
  lessonTeachers: many(lessonTeachers),
}))

export const directionsRelations = relations(directions, ({ many }) => ({
  lessons: many(lessons),
}))

export const levelsRelations = relations(levels, ({ many }) => ({
  lessons: many(lessons),
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
