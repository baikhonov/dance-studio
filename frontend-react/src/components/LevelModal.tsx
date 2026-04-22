import { useEffect, useMemo, useState } from 'react'
import { createLevel, deleteLevel, updateLevel, type Level, type NewLevel } from '../services/schedule'

const FOR_ALL_ALIASES = ['для всех', 'все уровни']

type LevelModalProps = {
  level: Level | null
  allLevels: Level[]
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

type LevelDraft = {
  id: number | null
  name: string
  color: string
}

const cloneLevel = (level: Level): LevelDraft => ({
  id: level.id,
  name: level.name,
  color: level.color,
})

const buildEmptyLevel = (): LevelDraft => ({
  id: null,
  name: '',
  color: '#f59e0b',
})

export function LevelModal({ level, allLevels, isOpen, onClose, onSaved }: LevelModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<LevelDraft | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (level) {
      setDraft(cloneLevel(level))
      setIsEditing(false)
    } else {
      setDraft(buildEmptyLevel())
      setIsEditing(true)
    }
    setError(null)
  }, [level, isOpen])

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [isOpen, onClose])

  const existingNames = useMemo(() => {
    if (!draft) return new Set<string>()
    return new Set(
      allLevels
        .filter((item) => item.id !== draft.id)
        .map((item) => item.name.trim().toLowerCase())
        .filter(Boolean),
    )
  }, [allLevels, draft])

  if (!isOpen || !draft) return null

  const handleSave = async () => {
    const normalizedName = draft.name.trim()
    const normalizedColor = draft.color.trim()
    if (!normalizedName) {
      setError('Введите название уровня')
      return
    }
    if (FOR_ALL_ALIASES.includes(normalizedName.toLowerCase())) {
      setError('Уровень «Для всех» системный и не редактируется в справочнике')
      return
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(normalizedColor)) {
      setError('Цвет должен быть в формате HEX, например #f59e0b')
      return
    }
    if (existingNames.has(normalizedName.toLowerCase())) {
      setError('Такой уровень уже существует')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const payload: NewLevel = { name: normalizedName, color: normalizedColor }
      if (draft.id === null) {
        await createLevel(payload)
      } else {
        await updateLevel(draft.id, payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить уровень')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (draft.id === null) return
    if (!window.confirm(`Вы уверены, что хотите удалить уровень ${draft.name}? У связанных занятий уровень будет очищен.`)) {
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await deleteLevel(draft.id)
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить уровень')
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
              {!isEditing && draft.id !== null ? (
                <>
                  <h3 className="mb-4 pr-8 text-2xl font-bold text-gray-900 dark:text-slate-100">{draft.name}</h3>
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <span
                      className="h-3 w-3 rounded-full border border-gray-300 dark:border-slate-600"
                      style={{ backgroundColor: draft.color }}
                    />
                    <span>{draft.color}</span>
                  </div>
                  <p className="mb-6 text-sm text-gray-600 dark:text-slate-300">
                    При удалении уровня у связанных занятий поле уровня будет очищено.
                  </p>
                  <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 dark:bg-amber-700 dark:text-amber-50 dark:hover:bg-amber-800"
                    >
                      Редактировать
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete()}
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
                    {draft.id === null ? 'Новый уровень' : 'Редактирование'}
                  </h3>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Название уровня</label>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(event) => setDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Цвет уровня</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={/^#[0-9A-Fa-f]{6}$/.test(draft.color) ? draft.color : '#f59e0b'}
                        onChange={(event) => setDraft((prev) => (prev ? { ...prev, color: event.target.value } : prev))}
                        className="h-10 w-14 rounded border border-gray-300 bg-white px-1 py-1 dark:border-slate-600 dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        value={draft.color}
                        onChange={(event) => setDraft((prev) => (prev ? { ...prev, color: event.target.value } : prev))}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-amber-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
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
                        if (level) {
                          setDraft(cloneLevel(level))
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
