import type { SyntheticEvent } from 'react'
import type { Lesson } from '../services/schedule'
import { DEFAULT_EVENT_POSTER, DEFAULT_TEACHER_AVATAR, resolvePosterUrl, resolveTeacherPhotoUrl } from '../utils/assets'

type LessonCardProps = {
  lesson: Lesson
  directionName: string
  levelLabel: string
  teacherNames: string
  teacherPhotos: string[]
  levelColor: string | null
}

const setFallbackImage = (event: SyntheticEvent<HTMLImageElement>, fallbackSrc: string) => {
  event.currentTarget.src = fallbackSrc
}

export function LessonCard({
  lesson,
  directionName,
  levelLabel,
  teacherNames,
  teacherPhotos,
  levelColor,
}: LessonCardProps) {
  return (
    <article
      style={{ borderLeft: `4px solid ${levelColor ?? '#cbd5e1'}` }}
      className="lesson-card"
      title={`${directionName} (${lesson.time}-${lesson.endTime})`}
    >
      <p className="lesson-card__direction">{directionName}</p>
      <p className="lesson-card__level">{levelLabel}</p>
      <p className="lesson-card__time">
        {lesson.time}-{lesson.endTime}
      </p>
      {teacherPhotos.length > 0 ? (
        <>
          <div className="lesson-card__avatars">
            {teacherPhotos.slice(0, 3).map((photo, index) => (
              <img
                key={`${lesson.id}-teacher-${index}`}
                src={resolveTeacherPhotoUrl(photo)}
                alt={teacherNames}
                className="lesson-card__avatar"
                onError={(event) => setFallbackImage(event, DEFAULT_TEACHER_AVATAR)}
              />
            ))}
          </div>
          <p className="lesson-card__teachers">{teacherNames}</p>
        </>
      ) : (
        <img
          src={resolvePosterUrl(lesson.poster)}
          alt={directionName}
          className="lesson-card__poster"
          onError={(event) => setFallbackImage(event, DEFAULT_EVENT_POSTER)}
        />
      )}
    </article>
  )
}
