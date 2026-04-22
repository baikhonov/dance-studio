import { useEffect } from 'react'

type ConfirmModalProps = {
  isOpen: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({
  isOpen,
  title = 'Подтверждение',
  message,
  confirmText = 'Да',
  cancelText = 'Отмена',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-transparent bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-slate-300">{title}</h3>
            <p className="text-gray-600 dark:text-slate-400">{message}</p>
          </div>
          <div className="flex gap-3 p-6 pt-0">
            <button
              type="button"
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-white transition-colors hover:bg-amber-600 dark:bg-amber-700 dark:text-amber-100 dark:hover:bg-amber-800"
            >
              {confirmText}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
            >
              {cancelText}
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 p-2 text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-400"
            aria-label="Закрыть"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
