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
    <section className="mb-5 rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid min-w-[220px] grow gap-1">
          <span className="text-xs text-slate-500">Направление</span>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-violet-200 transition focus:ring-2"
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

        <label className="grid min-w-[220px] grow gap-1">
          <span className="text-xs text-slate-500">Уровень</span>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-violet-200 transition focus:ring-2"
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
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50"
            onClick={resetFilters}
          >
            Сбросить
          </button>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-600">Найдено занятий: {filteredCount}</p>
    </section>
  )
}
