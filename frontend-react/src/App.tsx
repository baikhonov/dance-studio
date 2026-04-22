import { useEffect, useState } from 'react'
import { API_BASE_URL } from './config/runtime'
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
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [directions, setDirections] = useState<Direction[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Dance Studio (React)</h1>
        <p className="mt-3 text-slate-600">Loading schedule...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Dance Studio (React)</h1>
        <p className="mt-3 text-rose-600">Error: {error}</p>
      </main>
    )
  }

  const filteredLessons = lessons.filter((lesson) => {
    const directionMatch = filters.direction === null || lesson.directionId === filters.direction
    const levelMatch =
      filters.level === null || lesson.levelIds.length === 0 || lesson.levelIds.includes(filters.level)
    return directionMatch && levelMatch
  })

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">Dance Studio (React)</h1>
      <p className="mt-2 text-sm text-slate-600">Migration in progress</p>
      <p className="mt-1 text-xs text-slate-500">API: {API_BASE_URL}</p>
      <ScheduleFilters
        directions={directions}
        levels={levels}
        value={filters}
        onChange={setFilters}
        filteredCount={filteredLessons.length}
      />
      <p className="mb-4 text-sm text-slate-600">Lessons count: {filteredLessons.length}</p>
      <ScheduleList lessons={filteredLessons} directions={directions} levels={levels} teachers={teachers} />
    </main>
  )
}

export default App
