import type { Direction, Level } from '../services/schedule'

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
  const onDirectionChange = (rawValue: string) => {
    onChange({
      ...value,
      direction: rawValue ? Number(rawValue) : null,
    })
  }

  const onLevelChange = (rawValue: string) => {
    onChange({
      ...value,
      level: rawValue ? Number(rawValue) : null,
    })
  }

  const resetFilters = () => onChange({ direction: null, level: null })

  return (
    <section className="mb-2 md:flex md:items-start md:gap-2">
      <div className="flex w-full flex-row flex-nowrap items-center gap-2">
        <label className="grid min-w-0 flex-1 gap-1 md:max-w-[220px] md:flex-none">
          <span className="sr-only">Направление</span>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm outline-none ring-amber-200 transition focus:ring-2"
            value={value.direction ?? ''}
            onChange={(event) => onDirectionChange(event.target.value)}
          >
            <option value="">Все направления</option>
            {directions.map((direction) => (
              <option key={direction.id} value={direction.id}>
                {direction.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid min-w-0 flex-1 gap-1 md:max-w-[220px] md:flex-none">
          <span className="sr-only">Уровень</span>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm outline-none ring-amber-200 transition focus:ring-2"
            value={value.level ?? ''}
            onChange={(event) => onLevelChange(event.target.value)}
          >
            <option value="">Все уровни</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </label>

        {(value.direction !== null || value.level !== null) && (
          <button
            type="button"
            className="hidden shrink-0 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 md:inline-flex"
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
            className="rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            onClick={resetFilters}
          >
            ✕ Сбросить
          </button>
          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-center text-sm text-gray-600">
            Найдено: {filteredCount}
          </span>
        </div>
      )}
    </section>
  )
}
