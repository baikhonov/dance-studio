import type { Lesson } from '../services/schedule'

type ScheduleListProps = {
  lessons: Lesson[]
}

export function ScheduleList({ lessons }: ScheduleListProps) {
  if (lessons.length === 0) {
    return <p>No lessons yet.</p>
  }

  return (
    <ul>
      {lessons.map((lesson) => (
        <li key={lesson.id}>
          #{lesson.id} | {lesson.day} {lesson.time}-{lesson.endTime} | dir:{lesson.directionId} |
          levels:{lesson.levelIds.join(',') || '-'} | teachers:{lesson.teacherIds.join(',') || '-'}
        </li>
      ))}
    </ul>
  )
}
