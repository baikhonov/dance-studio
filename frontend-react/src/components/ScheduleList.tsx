import type { Direction, Lesson, Level, Teacher } from '../services/schedule'

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
    return <p>No lessons yet.</p>
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

  const grouped = weekDaysOrder
    .map((day) => {
      const byDay = lessons
        .filter((lesson) => lesson.day === day)
        .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
      return { day, lessons: byDay }
    })
    .filter((group) => group.lessons.length > 0)

  return (
    <section>
      {grouped.map((group) => (
        <div key={group.day}>
          <h2>{group.day}</h2>
          <ul>
            {group.lessons.map((lesson) => (
              <li key={lesson.id}>
                {lesson.time}-{lesson.endTime} | {getDirectionNameById(lesson.directionId)} | уровни:{' '}
                {getLevelNamesByIds(lesson.levelIds)} | преподаватели:{' '}
                {getTeacherNamesByIds(lesson.teacherIds)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
