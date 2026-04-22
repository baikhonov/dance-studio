import type { SyntheticEvent } from 'react'
import type { Lesson } from '../services/schedule'
import { DEFAULT_EVENT_POSTER, DEFAULT_TEACHER_AVATAR, resolvePosterUrl, resolveTeacherPhotoUrl } from '../utils/assets'
import { getLevelCardStyle } from '../utils/levelColors'

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
  const shortTeacherNames = teacherNames
    .split(',')
    .map((name) => name.trim().split(/\s+/)[0] ?? name.trim())
    .join(' и ')

  return (
    <article
      style={getLevelCardStyle(levelColor)}
      className="h-full cursor-pointer overflow-hidden rounded-lg border-l-2 p-1 text-left shadow-sm transition-all hover:brightness-[0.98] hover:shadow-md"
      title={`${directionName} (${lesson.time}-${lesson.endTime})`}
    >
      <p className="shrink-0 truncate text-xs leading-tight font-bold text-gray-900">{directionName}</p>
      <p className="mt-0 truncate text-xs font-medium text-gray-700">{levelLabel}</p>
      <p className="mt-0.5 inline-block self-start rounded bg-white/50 px-1 py-0.5 text-xs font-medium text-gray-800">
        {lesson.time}-{lesson.endTime}
      </p>
      {teacherPhotos.length > 0 ? (
        <>
          <div className="pt-0.5">
            <div className="flex shrink-0 justify-end -space-x-3 md:-space-x-2">
            {teacherPhotos.slice(0, 3).map((photo, index) => (
              <img
                key={`${lesson.id}-teacher-${index}`}
                src={resolveTeacherPhotoUrl(photo)}
                alt={teacherNames}
                className="h-7 w-7 rounded-full border border-white object-cover shadow-sm md:border-2"
                onError={(event) => setFallbackImage(event, DEFAULT_TEACHER_AVATAR)}
              />
            ))}
            </div>
            <p className="mt-0.5 truncate text-right text-[10px] leading-tight font-medium text-gray-700">
              {shortTeacherNames}
            </p>
          </div>
        </>
      ) : (
        <img
          src={resolvePosterUrl(lesson.poster)}
          alt={directionName}
          className="mt-1 h-16 w-full rounded-md border border-slate-200 object-cover shadow-sm"
          onError={(event) => setFallbackImage(event, DEFAULT_EVENT_POSTER)}
        />
      )}
    </article>
  )
}
