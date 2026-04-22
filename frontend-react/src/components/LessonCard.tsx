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
      className="rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm"
      title={`${directionName} (${lesson.time}-${lesson.endTime})`}
    >
      <p className="truncate text-sm font-semibold text-slate-900">{directionName}</p>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{levelLabel}</p>
      <p className="mt-2 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
        {lesson.time}-{lesson.endTime}
      </p>
      {teacherPhotos.length > 0 ? (
        <>
          <div className="mt-2 flex gap-1.5">
            {teacherPhotos.slice(0, 3).map((photo, index) => (
              <img
                key={`${lesson.id}-teacher-${index}`}
                src={resolveTeacherPhotoUrl(photo)}
                alt={teacherNames}
                className="h-7 w-7 rounded-full border border-slate-200 object-cover"
                onError={(event) => setFallbackImage(event, DEFAULT_TEACHER_AVATAR)}
              />
            ))}
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">{teacherNames}</p>
        </>
      ) : (
        <img
          src={resolvePosterUrl(lesson.poster)}
          alt={directionName}
          className="mt-2 h-24 w-full rounded-lg border border-slate-200 object-cover"
          onError={(event) => setFallbackImage(event, DEFAULT_EVENT_POSTER)}
        />
      )}
    </article>
  )
}
