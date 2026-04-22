import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { uploadTeacherPhoto } from '../api/uploads'
import { DEFAULT_TEACHER_AVATAR, resolveTeacherPhotoUrl } from '../utils/assets'
import { createTeacher, deleteTeacher, updateTeacher, type NewTeacher, type Teacher } from '../services/schedule'

type TeacherModalProps = {
  teacher: Teacher | null
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

type TeacherDraft = {
  id: number | null
  name: string
  photo: string
}

const setFallbackImage = (event: SyntheticEvent<HTMLImageElement>, fallbackSrc: string) => {
  event.currentTarget.src = fallbackSrc
}

const cloneTeacher = (teacher: Teacher): TeacherDraft => ({
  id: teacher.id,
  name: teacher.name,
  photo: teacher.photo,
})

const buildEmptyTeacher = (): TeacherDraft => ({
  id: null,
  name: '',
  photo: '',
})

export function TeacherModal({ teacher, isOpen, onClose, onSaved }: TeacherModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<TeacherDraft | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (teacher) {
      setDraft(cloneTeacher(teacher))
      setIsEditing(false)
    } else {
      setDraft(buildEmptyTeacher())
      setIsEditing(true)
    }
    setError(null)
  }, [teacher, isOpen])

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [isOpen, onClose])

  if (!isOpen || !draft) return null

  const handleSave = async () => {
    if (!draft.name.trim()) {
      setError('Введите имя преподавателя')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const payload: NewTeacher = {
        name: draft.name.trim(),
        photo: draft.photo,
      }
      if (draft.id === null) {
        await createTeacher(payload)
      } else {
        await updateTeacher(draft.id, payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить преподавателя')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (draft.id === null) return
    if (!window.confirm(`Вы уверены, что хотите удалить преподавателя ${draft.name}?`)) return

    setError(null)
    setIsSubmitting(true)
    try {
      await deleteTeacher(draft.id)
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить преподавателя')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setIsSubmitting(true)
    try {
      const uploaded = await uploadTeacherPhoto(file)
      setDraft((prev) => (prev ? { ...prev, photo: uploaded.path } : prev))
    } catch {
      setError('Не удалось загрузить фото')
    } finally {
      setIsSubmitting(false)
      event.target.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-transparent bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 8px)' }}>
              {!isEditing && draft.id !== null ? (
                <>
                  <h3 className="mb-4 pr-8 text-2xl font-bold text-gray-900">{draft.name}</h3>
                  <div className="mb-6 flex justify-center">
                    <img
                      src={resolveTeacherPhotoUrl(draft.photo)}
                      alt={draft.name}
                      className="h-40 w-40 rounded-lg border-2 border-gray-100 object-cover shadow-md"
                      onError={(event) => setFallbackImage(event, DEFAULT_TEACHER_AVATAR)}
                    />
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
                    >
                      Редактировать
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete()}
                      disabled={isSubmitting}
                      className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-60"
                    >
                      Удалить
                    </button>
                  </div>
                </>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void handleSave()
                  }}
                >
                  <h3 className="pr-8 text-xl font-bold text-gray-900">
                    {draft.id === null ? 'Новый преподаватель' : 'Редактирование'}
                  </h3>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Имя преподавателя</label>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(event) => setDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Фото преподавателя</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => void handlePhotoUpload(event)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-amber-400"
                    />
                    {draft.photo && (
                      <img
                        src={resolveTeacherPhotoUrl(draft.photo)}
                        alt=""
                        className="mt-2 h-24 w-24 rounded-lg border border-gray-200 object-cover"
                        onError={(event) => setFallbackImage(event, DEFAULT_TEACHER_AVATAR)}
                      />
                    )}
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 disabled:opacity-60"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (teacher) {
                          setDraft(cloneTeacher(teacher))
                          setIsEditing(false)
                        } else {
                          onClose()
                        }
                        setError(null)
                      }}
                      className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                    >
                      {draft.id === null ? 'Закрыть' : 'Отмена'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <button
              onClick={onClose}
              className="absolute top-2 right-2 cursor-pointer p-2 text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Закрыть"
              type="button"
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
