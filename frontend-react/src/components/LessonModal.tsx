import { useEffect } from 'react'
import type { SyntheticEvent } from 'react'
import type { Direction, Lesson, Level, Teacher } from '../services/schedule'
import { DEFAULT_EVENT_POSTER, DEFAULT_TEACHER_AVATAR, resolvePosterUrl, resolveTeacherPhotoUrl } from '../utils/assets'

type LessonModalProps = {
  lesson: Lesson | null
  isOpen: boolean
  onClose: () => void
  directions: Direction[]
  levels: Level[]
  teachers: Teacher[]
}

const setFallbackImage = (event: SyntheticEvent<HTMLImageElement>, fallbackSrc: string) => {
  event.currentTarget.src = fallbackSrc
}

export function LessonModal({ lesson, isOpen, onClose, directions, levels, teachers }: LessonModalProps) {
  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [isOpen, onClose])

  if (!isOpen || !lesson) return null

  const direction = directions.find((item) => item.id === lesson.directionId)
  const levelNames =
    lesson.levelIds.length === 0
      ? ['Для всех']
      : lesson.levelIds.map((id) => levels.find((level) => level.id === id)?.name ?? 'Для всех')
  const lessonTeachers = lesson.teacherIds
    .map((id) => teachers.find((teacher) => teacher.id === id))
    .filter((teacher): teacher is Teacher => Boolean(teacher))

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-transparent bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 8px)' }}>
              <h3 className="mb-3 pr-8 text-2xl font-bold text-gray-900">{direction?.name ?? 'Без направления'}</h3>

              <div className="mb-4 flex flex-wrap items-start gap-2 text-sm md:items-center">
                <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                  {lesson.time} - {lesson.endTime}
                </span>
                <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 md:ml-3 md:mt-0">
                  {levelNames.join(', ')}
                </span>
              </div>

              {direction?.description && (
                <p className="mb-4 whitespace-pre-line text-sm text-gray-700">{direction.description}</p>
              )}

              {lessonTeachers.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    {lessonTeachers.length > 1 ? 'Преподаватели' : 'Преподаватель'}
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {lessonTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="flex min-w-45 items-center gap-3 rounded-lg border border-transparent bg-gray-50 p-3"
                      >
                        <img
                          src={resolveTeacherPhotoUrl(teacher.photo)}
                          alt={teacher.name}
                          className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm"
                          onError={(event) => setFallbackImage(event, DEFAULT_TEACHER_AVATAR)}
                        />
                        <p className="font-semibold text-gray-800">{teacher.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lesson.poster && (
                <div>
                  <img
                    src={resolvePosterUrl(lesson.poster)}
                    alt={direction?.name ?? 'Занятие'}
                    className="mx-auto w-full rounded-lg shadow-md"
                    onError={(event) => setFallbackImage(event, DEFAULT_EVENT_POSTER)}
                  />
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="absolute top-2 right-2 cursor-pointer p-2 text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Закрыть"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
