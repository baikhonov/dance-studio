import type { Direction, Lesson, Level, Teacher } from '../services/schedule'
import { LessonCard } from './LessonCard'

type ScheduleListProps = {
  lessons: Lesson[]
  directions: Direction[]
  levels: Level[]
  teachers: Teacher[]
}

const weekDaysOrder = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
]

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0
  return hours * 60 + minutes
}

export function ScheduleList({ lessons, directions, levels, teachers }: ScheduleListProps) {
  if (lessons.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-600">
        No lessons yet.
      </div>
    )
  }

  const getDirectionNameById = (id: number) =>
    directions.find((direction) => direction.id === id)?.name ?? 'Без направления'

  const getLevelNamesByIds = (ids: number[]) => {
    if (ids.length === 0) return 'Для всех'
    return ids.map((id) => levels.find((level) => level.id === id)?.name ?? 'Для всех').join(', ')
  }

  const getTeacherNamesByIds = (ids: number[]) => {
    if (ids.length === 0) return '-'
    return ids.map((id) => teachers.find((teacher) => teacher.id === id)?.name ?? `#${id}`).join(', ')
  }

  const getTeacherPhotosByIds = (ids: number[]) =>
    ids
      .map((id) => teachers.find((teacher) => teacher.id === id)?.photo)
      .filter((value): value is string => Boolean(value))

  const getLevelColorByIds = (ids: number[]) => {
    if (ids.length === 0) return null
    return levels.find((level) => level.id === ids[0])?.color ?? null
  }

  const grouped = weekDaysOrder
    .map((day) => {
      const byDay = lessons
        .filter((lesson) => lesson.day === day)
        .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
      return { day, lessons: byDay }
    })
    .filter((group) => group.lessons.length > 0)

  return (
    <section className="space-y-6">
      {grouped.map((group) => (
        <div key={group.day}>
          <h2 className="mb-3 text-2xl font-semibold text-slate-900">{group.day}</h2>
          <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {group.lessons.map((lesson) => (
              <li key={lesson.id}>
                <LessonCard
                  lesson={lesson}
                  directionName={getDirectionNameById(lesson.directionId)}
                  levelLabel={getLevelNamesByIds(lesson.levelIds)}
                  teacherNames={getTeacherNamesByIds(lesson.teacherIds)}
                  teacherPhotos={getTeacherPhotosByIds(lesson.teacherIds)}
                  levelColor={getLevelColorByIds(lesson.levelIds)}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
