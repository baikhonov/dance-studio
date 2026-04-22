import type { SyntheticEvent } from 'react'
import type { Lesson } from '../services/schedule'
import { DEFAULT_EVENT_POSTER, DEFAULT_TEACHER_AVATAR, resolvePosterUrl, resolveTeacherPhotoUrl } from '../utils/assets'

type LessonCardProps = {
  lesson: Lesson
  directionName: string
  levelLabel: string
  teacherNames: string
  teacherPhotos: string[]
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
}: LessonCardProps) {
  const shortTeacherNames = teacherNames
    .split(',')
    .map((name) => name.trim().split(/\s+/)[0] ?? name.trim())
    .join(' и ')

  return (
    <div className="lesson-card-content relative z-10 flex h-full flex-col overflow-hidden p-1 text-[10px]">
      <p className="lesson-card-direction-title shrink-0 truncate text-xs font-bold leading-tight text-gray-900 dark:text-slate-300">
        {directionName}
      </p>
      <p className="mt-0 truncate text-xs font-medium text-gray-700 dark:text-slate-400">{levelLabel}</p>
      <div className="mt-0.5 inline-block self-start rounded bg-white/50 px-1 py-0.5 text-xs font-medium text-gray-700 dark:bg-slate-800/50 dark:text-slate-400">
        {lesson.time}—{lesson.endTime}
      </div>

      {teacherPhotos.length > 0 ? (
        <div className="pt-0.5">
          <div className="flex shrink-0 justify-end -space-x-3 md:-space-x-2">
            {teacherPhotos.slice(0, 3).map((photo, index) => (
              <img
                key={`${lesson.id}-teacher-${index}`}
                src={resolveTeacherPhotoUrl(photo)}
                alt={teacherNames}
                className={[
                  'h-7 w-7 rounded-full border border-white shadow-sm md:border-2',
                  index === 0 && teacherPhotos.length > 1 ? 'relative z-10' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onError={(event) => setFallbackImage(event, DEFAULT_TEACHER_AVATAR)}
              />
            ))}
          </div>
          <p className="mt-0.5 truncate text-right text-[10px] font-medium leading-tight text-gray-700 dark:text-slate-400">
            {shortTeacherNames}
          </p>
        </div>
      ) : lesson.poster ? (
        <div className="mt-0.5 min-h-0 pt-0.5">
          <img
            src={resolvePosterUrl(lesson.poster)}
            alt={directionName}
            className="h-full w-full rounded-md object-cover shadow-sm"
            onError={(event) => setFallbackImage(event, DEFAULT_EVENT_POSTER)}
          />
        </div>
      ) : null}
    </div>
  )
}
