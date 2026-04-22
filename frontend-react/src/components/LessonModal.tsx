import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, SyntheticEvent } from 'react'
import { uploadPoster } from '../api/uploads'
import { createLesson, deleteLesson, updateLesson, type Direction, type Lesson, type Level, type NewLesson, type Teacher } from '../services/schedule'
import { DEFAULT_EVENT_POSTER, DEFAULT_TEACHER_AVATAR, resolvePosterUrl, resolveTeacherPhotoUrl } from '../utils/assets'

type LessonModalProps = {
  lesson: Lesson | null
  mode: 'view' | 'create'
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  directions: Direction[]
  levels: Level[]
  teachers: Teacher[]
  isAdmin: boolean
}

const setFallbackImage = (event: SyntheticEvent<HTMLImageElement>, fallbackSrc: string) => {
  event.currentTarget.src = fallbackSrc
}

const weekDays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

const cloneLesson = (lesson: NewLesson): NewLesson => ({
  day: lesson.day,
  time: lesson.time,
  endTime: lesson.endTime,
  crossesMidnight: lesson.crossesMidnight,
  directionId: lesson.directionId,
  levelIds: [...lesson.levelIds],
  teacherIds: [...lesson.teacherIds],
  poster: lesson.poster,
})

const buildEmptyDraft = (directions: Direction[]): NewLesson => ({
  day: weekDays[0],
  time: '19:00',
  endTime: '20:00',
  crossesMidnight: false,
  directionId: directions[0]?.id ?? 0,
  levelIds: [],
  teacherIds: [],
  poster: null,
})

export function LessonModal({ lesson, mode, isOpen, onClose, onSaved, directions, levels, teachers, isAdmin }: LessonModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<NewLesson | null>(lesson ? cloneLesson(lesson) : null)
  const sortedDirections = useMemo(() => [...directions].sort((a, b) => a.name.localeCompare(b.name)), [directions])
  const sortedLevels = useMemo(() => [...levels].sort((a, b) => a.name.localeCompare(b.name)), [levels])

  useEffect(() => {
    if (mode === 'create') {
      setDraft(buildEmptyDraft(directions))
      setIsEditing(true)
      setError(null)
      return
    }

    if (lesson) {
      setDraft(cloneLesson(lesson))
      setIsEditing(false)
      setError(null)
    }
  }, [lesson, isOpen, mode, directions])

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [isOpen, onClose])

  if (!isOpen || !draft) return null
  if (mode === 'view' && !lesson) return null

  const direction = directions.find((item) => item.id === (mode === 'view' && lesson ? lesson.directionId : draft.directionId))
  const levelNames =
    (mode === 'view' && lesson ? lesson.levelIds : draft.levelIds).length === 0
      ? ['Для всех']
      : (mode === 'view' && lesson ? lesson.levelIds : draft.levelIds).map(
          (id) => levels.find((level) => level.id === id)?.name ?? 'Для всех',
        )
  const lessonTeachers = (mode === 'view' && lesson ? lesson.teacherIds : draft.teacherIds)
    .map((id) => teachers.find((teacher) => teacher.id === id))
    .filter((teacher): teacher is Teacher => Boolean(teacher))

  const canSave =
    draft.day.trim() !== '' &&
    draft.time.trim() !== '' &&
    draft.endTime.trim() !== '' &&
    Number.isFinite(draft.directionId) &&
    draft.directionId > 0

  const onToggleLevel = (levelId: number, checked: boolean) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            levelIds: checked ? [...new Set([...prev.levelIds, levelId])] : prev.levelIds.filter((id) => id !== levelId),
          }
        : prev,
    )
  }

  const onToggleTeacher = (teacherId: number, checked: boolean) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            teacherIds: checked ? [...new Set([...prev.teacherIds, teacherId])] : prev.teacherIds.filter((id) => id !== teacherId),
          }
        : prev,
    )
  }

  const handlePosterUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)
    setIsSubmitting(true)
    try {
      const uploaded = await uploadPoster(file)
      setDraft((prev) => (prev ? { ...prev, poster: uploaded.path } : prev))
    } catch {
      setError('Не удалось загрузить постер')
    } finally {
      setIsSubmitting(false)
      event.target.value = ''
    }
  }

  const removePoster = () => {
    setDraft((prev) => (prev ? { ...prev, poster: null } : prev))
  }

  const handleSave = async () => {
    if (!draft || !canSave) return
    setError(null)
    setIsSubmitting(true)
    try {
      const payload: NewLesson = cloneLesson(draft)
      if (mode === 'create') {
        await createLesson(payload)
      } else if (lesson) {
        await updateLesson(lesson.id, payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить занятие')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!lesson) return
    const confirmDelete = window.confirm('Удалить занятие?')
    if (!confirmDelete) return
    setError(null)
    setIsSubmitting(true)
    try {
      await deleteLesson(lesson.id)
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить занятие')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-transparent bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 8px)' }}>
              {!isEditing ? (
                <>
                  <h3 className="mb-3 pr-8 text-2xl font-bold text-gray-900 dark:text-slate-300">
                    {direction?.name ?? 'Без направления'}
                  </h3>

                  <div className="mb-4 flex flex-wrap items-start gap-2 text-sm md:items-center">
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700 dark:bg-slate-800/60 dark:text-slate-400">
                      {lesson?.time} - {lesson?.endTime}
                    </span>
                    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 md:ml-3 md:mt-0 dark:bg-amber-900/20 dark:text-amber-400/90">
                      {levelNames.join(', ')}
                    </span>
                  </div>

                  {direction?.description && (
                    <p className="mb-4 whitespace-pre-line text-sm text-gray-700 dark:text-slate-400">{direction.description}</p>
                  )}

                  {lessonTeachers.length > 0 && (
                    <div className="mb-6">
                      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-500">
                        {lessonTeachers.length > 1 ? 'Преподаватели' : 'Преподаватель'}
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        {lessonTeachers.map((teacher) => (
                          <div
                            key={teacher.id}
                            className="flex min-w-45 items-center gap-3 rounded-lg border border-transparent bg-gray-50 p-3 dark:border-slate-600 dark:bg-slate-700/70"
                          >
                            <img
                              src={resolveTeacherPhotoUrl(teacher.photo)}
                              alt={teacher.name}
                              className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm dark:border-slate-500"
                              onError={(event) => setFallbackImage(event, DEFAULT_TEACHER_AVATAR)}
                            />
                            <p className="font-semibold text-gray-800 dark:text-slate-300">{teacher.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {lesson?.poster && (
                    <div>
                      <img
                        src={resolvePosterUrl(lesson.poster)}
                        alt={direction?.name ?? 'Занятие'}
                        className="w-full mx-auto rounded-lg shadow-md"
                        onError={(event) => setFallbackImage(event, DEFAULT_EVENT_POSTER)}
                      />
                    </div>
                  )}

                  {isAdmin && (
                    <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4 dark:border-slate-700">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 dark:bg-amber-700 dark:text-amber-100 dark:hover:bg-amber-800"
                        type="button"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={handleDelete}
                        className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-60 dark:bg-red-700 dark:text-red-200 dark:hover:bg-red-800"
                        type="button"
                        disabled={isSubmitting}
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void handleSave()
                  }}
                >
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-400">Направление</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400"
                      value={draft.directionId}
                      onChange={(event) =>
                        setDraft((prev) => (prev ? { ...prev, directionId: Number(event.target.value) } : prev))
                      }
                    >
                      {sortedDirections.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-400">Уровни</label>
                    <div className="max-h-32 space-y-2 overflow-y-auto rounded-lg border border-gray-300 p-3 dark:border-slate-600">
                      {sortedLevels.map((level) => (
                        <label key={level.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={draft.levelIds.includes(level.id)}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => onToggleLevel(level.id, event.target.checked)}
                          />
                          <span className="text-sm text-gray-700 dark:text-slate-400">{level.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-400">Время начала</label>
                      <input
                        type="time"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400"
                        value={draft.time}
                        onChange={(event) => setDraft((prev) => (prev ? { ...prev, time: event.target.value } : prev))}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-400">Время окончания</label>
                      <input
                        type="time"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400"
                        value={draft.endTime}
                        onChange={(event) => setDraft((prev) => (prev ? { ...prev, endTime: event.target.value } : prev))}
                      />
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={draft.crossesMidnight}
                      onChange={(event) =>
                        setDraft((prev) => (prev ? { ...prev, crossesMidnight: event.target.checked } : prev))
                      }
                    />
                    Переходит за полночь
                  </label>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-400">День недели</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400"
                      value={draft.day}
                      onChange={(event) => setDraft((prev) => (prev ? { ...prev, day: event.target.value } : prev))}
                    >
                      <option value="">Выберите день</option>
                      {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map(
                        (day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-400">Преподаватели</label>
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-gray-300 p-3 dark:border-slate-600">
                      {teachers.map((teacher) => (
                        <label key={teacher.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={draft.teacherIds.includes(teacher.id)}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              onToggleTeacher(teacher.id, event.target.checked)
                            }
                          />
                          <img src={resolveTeacherPhotoUrl(teacher.photo)} alt={teacher.name} className="h-6 w-6 rounded-full object-cover" />
                          <span className="text-sm text-gray-700 dark:text-slate-400">{teacher.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">Постер</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => void handlePosterUpload(event)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400"
                    />
                    <div className="flex items-center gap-2">
                      {draft.poster ? (
                        <img
                          src={resolvePosterUrl(draft.poster)}
                          alt=""
                          className="mt-2 w-32 object-cover rounded"
                          onError={(event) => setFallbackImage(event, DEFAULT_EVENT_POSTER)}
                        />
                      ) : null}
                      {draft.poster ? (
                        <button
                          type="button"
                          onClick={removePoster}
                          className="mt-2 mb-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                        >
                          Удалить текущий постер
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 disabled:opacity-60 dark:bg-amber-700 dark:text-amber-100 dark:hover:bg-amber-800"
                      disabled={isSubmitting || !canSave}
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (mode === 'create') {
                          onClose()
                          return
                        }
                        if (lesson) {
                          setDraft(cloneLesson(lesson))
                          setIsEditing(false)
                        }
                        setError(null)
                      }}
                      className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
                    >
                      {mode === 'create' ? 'Закрыть' : 'Отмена'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <button
              onClick={onClose}
              className="absolute top-2 right-2 cursor-pointer p-2 text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-400"
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
