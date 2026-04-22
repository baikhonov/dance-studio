import { useEffect, useRef, useState } from 'react'
import { ScheduleFilters } from './components/ScheduleFilters'
import { ScheduleList } from './components/ScheduleList'
import {
  getDirections,
  getLevels,
  getPublicSchedule,
  getTeachers,
  type Direction,
  type Lesson,
  type Level,
  type Teacher,
} from './services/schedule'

function App() {
  const schoolName = 'Dance Studio'
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [directions, setDirections] = useState<Direction[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const filtersRef = useRef<HTMLDivElement | null>(null)
  const [filtersHeight, setFiltersHeight] = useState(0)
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)
  const [filters, setFilters] = useState<{ direction: number | null; level: number | null }>({
    direction: null,
    level: null,
  })

  useEffect(() => {
    Promise.all([getPublicSchedule(), getDirections(), getLevels(), getTeachers()])
      .then(([lessonsData, directionsData, levelsData, teachersData]) => {
        setLessons(lessonsData)
        setDirections(directionsData)
        setLevels(levelsData)
        setTeachers(teachersData)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unknown error')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    const updateMetrics = () => {
      setWindowWidth(window.innerWidth)
      setFiltersHeight(filtersRef.current?.offsetHeight ?? 0)
    }

    updateMetrics()
    window.addEventListener('resize', updateMetrics)

    const observer = new ResizeObserver(updateMetrics)
    if (filtersRef.current) {
      observer.observe(filtersRef.current)
    }

    return () => {
      window.removeEventListener('resize', updateMetrics)
      observer.disconnect()
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen px-3 py-3 md:px-4">
        <main className="mx-auto max-w-[1800px]">
          <p className="mt-3 text-slate-600">Loading schedule...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen px-3 py-3 md:px-4">
        <main className="mx-auto max-w-[1800px]">
          <p className="mt-3 text-rose-600">Error: {error}</p>
        </main>
      </div>
    )
  }

  const filteredLessons = lessons.filter((lesson) => {
    const directionMatch = filters.direction === null || lesson.directionId === filters.direction
    const levelMatch =
      filters.level === null || lesson.levelIds.length === 0 || lesson.levelIds.includes(filters.level)
    return directionMatch && levelMatch
  })

  return (
    <div className="min-h-screen text-slate-900">
      <header className="mx-auto mb-3 grid w-full max-w-[1800px] grid-cols-[1fr_auto] gap-2 border-b border-gray-200 pb-2 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="min-w-0">
          <a href="#" className="inline-flex items-center">
            <h1 className="truncate text-base font-semibold text-gray-800 md:text-lg">{schoolName}</h1>
          </a>
        </div>

        <div className="flex items-center gap-3 justify-self-end md:justify-self-end">
          <a href="#" className="text-sm text-amber-600 hover:text-amber-700">
            Войти
          </a>
        </div>

        <div className="col-span-2 flex justify-center md:col-span-1 md:col-start-2 md:row-start-1">
          <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Расписание занятий</h2>
        </div>
      </header>

      <main className="mx-auto mb-4 w-full max-w-[1800px]">
        <div ref={filtersRef} className="mb-2 max-md:mb-0 md:flex md:items-start md:gap-2">
          <div className="flex flex-row flex-nowrap items-center gap-2 pb-1 md:flex-1 md:justify-end md:pb-0">
            <div className="min-w-0 flex-1 md:flex-none">
              <ScheduleFilters
                directions={directions}
                levels={levels}
                value={filters}
                onChange={setFilters}
                filteredCount={filteredLessons.length}
              />
            </div>
            {(filters.direction !== null || filters.level !== null) && (
              <div className="hidden shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-center text-sm text-gray-600 md:block">
                Найдено: {filteredLessons.length}
              </div>
            )}
          </div>
        </div>
        <ScheduleList
          lessons={filteredLessons}
          directions={directions}
          levels={levels}
          teachers={teachers}
          stickyTop={windowWidth >= 768 ? Math.max(filtersHeight - 1, 0) : 0}
        />
      </main>

      <footer className="my-6 text-center text-gray-600">© 2026 {schoolName}. Все права защищены.</footer>
    </div>
  )
}

export default App
