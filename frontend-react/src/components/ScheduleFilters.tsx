import { useEffect, useMemo, useRef, useState } from 'react'
import type { Direction, Level } from '../services/schedule'
import { DEFAULT_LEVEL_COLOR, getLevelDotStyle } from '../utils/levelColors'

type ScheduleFiltersValue = {
  direction: number | null
  level: number | null
}

type ScheduleFiltersProps = {
  directions: Direction[]
  levels: Level[]
  value: ScheduleFiltersValue
  onChange: (value: ScheduleFiltersValue) => void
  filteredCount: number
}

export function ScheduleFilters({ directions, levels, value, onChange, filteredCount }: ScheduleFiltersProps) {
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false)
  const [isLevelsOpen, setIsLevelsOpen] = useState(false)
  const directionsMenuRef = useRef<HTMLDivElement | null>(null)
  const levelsMenuRef = useRef<HTMLDivElement | null>(null)

  const selectedDirectionLabel = useMemo(() => {
    if (value.direction === null) return 'Все направления'
    return directions.find((direction) => direction.id === value.direction)?.name ?? 'Все направления'
  }, [directions, value.direction])

  const selectedLevelLabel = useMemo(() => {
    if (value.level === null) return 'Все уровни'
    return levels.find((level) => level.id === value.level)?.name ?? 'Все уровни'
  }, [levels, value.level])

  const selectedLevelColor = useMemo(() => {
    if (value.level === null) return null
    return levels.find((level) => level.id === value.level)?.color ?? null
  }, [levels, value.level])

  const selectDirection = (next: number | null) => {
    onChange({
      ...value,
      direction: next,
    })
    setIsDirectionsOpen(false)
  }

  const selectLevel = (next: number | null) => {
    onChange({
      ...value,
      level: next,
    })
    setIsLevelsOpen(false)
  }

  const resetFilters = () => {
    onChange({ direction: null, level: null })
    setIsDirectionsOpen(false)
    setIsLevelsOpen(false)
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return

      if (!levelsMenuRef.current?.contains(target)) {
        setIsLevelsOpen(false)
      }
      if (!directionsMenuRef.current?.contains(target)) {
        setIsDirectionsOpen(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [])

  return (
    <div className="filters w-full md:w-auto">
      <div className="flex w-full flex-row flex-nowrap items-center gap-2 md:w-auto">
        <div ref={directionsMenuRef} className="relative z-50 min-w-0 flex-1 md:flex-none md:w-auto md:max-w-[200px]">
          <button
            type="button"
            className="w-full border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm rounded-lg cursor-pointer inline-flex items-center justify-between gap-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            onClick={(event) => {
              event.stopPropagation()
              setIsDirectionsOpen((prev) => !prev)
              setIsLevelsOpen(false)
            }}
          >
            <span className="truncate">{selectedDirectionLabel}</span>
            <span
              className={`text-xs text-gray-500 transition-transform duration-200 ease-in-out dark:text-slate-400 ${
                isDirectionsOpen ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>
          {isDirectionsOpen && (
            <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800">
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-700"
                onClick={() => selectDirection(null)}
              >
                Все направления
              </button>
              {directions.map((direction) => (
                <button
                  key={direction.id}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() => selectDirection(direction.id)}
                >
                  {direction.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={levelsMenuRef} className="relative z-50 min-w-0 flex-1 md:flex-none md:w-auto md:max-w-[220px]">
          <button
            type="button"
            className="w-full border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm rounded-lg cursor-pointer inline-flex items-center justify-between gap-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            onClick={(event) => {
              event.stopPropagation()
              setIsLevelsOpen((prev) => !prev)
              setIsDirectionsOpen(false)
            }}
          >
            <span className="inline-flex items-center gap-2 truncate">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={getLevelDotStyle(selectedLevelColor)} />
              <span className="truncate">{selectedLevelLabel}</span>
            </span>
            <span
              className={`text-xs text-gray-500 transition-transform duration-200 ease-in-out dark:text-slate-400 ${
                isLevelsOpen ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>
          {isLevelsOpen && (
            <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800">
              <button
                type="button"
                className="inline-flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-700"
                onClick={() => selectLevel(null)}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={getLevelDotStyle(DEFAULT_LEVEL_COLOR)} />
                <span>Все уровни</span>
              </button>
              {levels.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  className="inline-flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() => selectLevel(level.id)}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={getLevelDotStyle(level.color)} />
                  <span>{level.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {(value.direction !== null || value.level !== null) && (
          <button
            type="button"
            className="hidden shrink-0 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 md:inline-flex dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            onClick={resetFilters}
          >
            ✕ Сбросить
          </button>
        )}
      </div>
      {(value.direction !== null || value.level !== null) && (
        <div className="mt-2 flex items-center justify-between gap-2 md:hidden">
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            onClick={resetFilters}
          >
            ✕ Сбросить
          </button>
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-center text-sm text-gray-600 dark:bg-slate-700 dark:text-slate-300">
            Найдено: {filteredCount}
          </span>
        </div>
      )}
    </div>
  )
}
