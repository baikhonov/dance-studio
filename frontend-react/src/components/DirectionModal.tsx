import { useEffect, useMemo, useState } from 'react'
import {
  createDirection,
  deleteDirection,
  updateDirection,
  type Direction,
  type NewDirection,
} from '../services/schedule'
import { ConfirmModal } from './ConfirmModal'

type DirectionModalProps = {
  direction: Direction | null
  allDirections: Direction[]
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

type DirectionDraft = {
  id: number | null
  name: string
  description: string | null
}

const cloneDirection = (direction: Direction): DirectionDraft => ({
  id: direction.id,
  name: direction.name,
  description: direction.description,
})

const buildEmptyDirection = (): DirectionDraft => ({
  id: null,
  name: '',
  description: null,
})

export function DirectionModal({ direction, allDirections, isOpen, onClose, onSaved }: DirectionModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<DirectionDraft | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (direction) {
      setDraft(cloneDirection(direction))
      setIsEditing(false)
    } else {
      setDraft(buildEmptyDirection())
      setIsEditing(true)
    }
    setError(null)
  }, [direction, isOpen])

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !isOpen) return
      if (isDeleteConfirmOpen) return
      onClose()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [isOpen, onClose, isDeleteConfirmOpen])

  const existingNames = useMemo(() => {
    if (!draft) return new Set<string>()
    return new Set(
      allDirections
        .filter((item) => item.id !== draft.id)
        .map((item) => item.name.trim().toLowerCase())
        .filter(Boolean),
    )
  }, [allDirections, draft])

  if (!isOpen || !draft) return null

  const handleSave = async () => {
    const normalizedName = draft.name.trim()
    if (!normalizedName) {
      setError('Введите название направления')
      return
    }
    if (existingNames.has(normalizedName.toLowerCase())) {
      setError('Такое направление уже существует')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const payload: NewDirection = {
        name: normalizedName,
        description: draft.description?.trim() || null,
      }
      if (draft.id === null) {
        await createDirection(payload)
      } else {
        await updateDirection(draft.id, payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить направление')
    } finally {
      setIsSubmitting(false)
    }
  }

  const runDelete = async () => {
    if (draft.id === null) return
    setError(null)
    setIsSubmitting(true)
    try {
      await deleteDirection(draft.id)
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить направление')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Удалить направление?"
        message={`Вы уверены, что хотите удалить направление «${draft.name}»? Связанные занятия будут удалены.`}
        confirmText="Удалить"
        onConfirm={() => void runDelete()}
        onClose={() => setIsDeleteConfirmOpen(false)}
      />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-transparent bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 8px)' }}>
              {!isEditing && draft.id !== null ? (
                <>
                  <h3 className="mb-4 pr-8 text-2xl font-bold text-gray-900 dark:text-slate-100">{draft.name}</h3>
                  {draft.description && (
                    <div className="mb-4">
                      <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-slate-400">
                        Описание
                      </p>
                      <p className="text-sm whitespace-pre-line text-gray-700 dark:text-slate-300">{draft.description}</p>
                    </div>
                  )}
                  <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-700/50 dark:bg-amber-900/20">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Внимание</p>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-300/90">
                      При удалении направления все связанные занятия будут удалены из расписания без возможности
                      восстановления.
                    </p>
                  </div>
                  <div className="mt-2 flex gap-2 border-t border-gray-200 pt-4 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 dark:bg-amber-700 dark:text-amber-50 dark:hover:bg-amber-800"
                    >
                      Редактировать
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      disabled={isSubmitting}
                      className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-60 dark:bg-red-700 dark:text-red-50 dark:hover:bg-red-800"
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
                  <h3 className="pr-8 text-xl font-bold text-gray-900 dark:text-slate-100">
                    {draft.id === null ? 'Новое направление' : 'Редактирование'}
                  </h3>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Название направления</label>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(event) => setDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Описание направления</label>
                    <textarea
                      rows={4}
                      value={draft.description ?? ''}
                      placeholder="Для кого это направление, что изучается на занятии и т.п."
                      onChange={(event) =>
                        setDraft((prev) => (prev ? { ...prev, description: event.target.value || null } : prev))
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 disabled:opacity-60 dark:bg-amber-700 dark:text-amber-50 dark:hover:bg-amber-800"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (direction) {
                          setDraft(cloneDirection(direction))
                          setIsEditing(false)
                        } else {
                          onClose()
                        }
                        setError(null)
                      }}
                      className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                      {draft.id === null ? 'Закрыть' : 'Отмена'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <button
              onClick={onClose}
              className="absolute top-2 right-2 cursor-pointer p-2 text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
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
