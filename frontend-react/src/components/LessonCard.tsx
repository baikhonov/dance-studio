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
      className="h-full overflow-hidden rounded-lg border border-slate-200 bg-white/90 p-1 text-left shadow-sm transition hover:brightness-95"
      title={`${directionName} (${lesson.time}-${lesson.endTime})`}
    >
      <p className="truncate text-xs font-bold leading-tight text-gray-900">{directionName}</p>
      <p className="mt-0.5 truncate text-xs font-medium text-gray-700">{levelLabel}</p>
      <p className="mt-1 inline-block rounded bg-white/80 px-1 py-0.5 text-[11px] font-medium text-gray-800">
        {lesson.time}-{lesson.endTime}
      </p>
      {teacherPhotos.length > 0 ? (
        <>
          <div className="mt-1 flex justify-end -space-x-2">
            {teacherPhotos.slice(0, 3).map((photo, index) => (
              <img
                key={`${lesson.id}-teacher-${index}`}
                src={resolveTeacherPhotoUrl(photo)}
                alt={teacherNames}
                className="h-6 w-6 rounded-full border border-white object-cover shadow-sm"
                onError={(event) => setFallbackImage(event, DEFAULT_TEACHER_AVATAR)}
              />
            ))}
          </div>
          <p className="mt-0.5 truncate text-[10px] text-gray-600">{teacherNames}</p>
        </>
      ) : (
        <img
          src={resolvePosterUrl(lesson.poster)}
          alt={directionName}
          className="mt-1 h-16 w-full rounded border border-slate-200 object-cover"
          onError={(event) => setFallbackImage(event, DEFAULT_EVENT_POSTER)}
        />
      )}
    </article>
  )
}
