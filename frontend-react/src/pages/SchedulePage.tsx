import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { LessonModal } from '../components/LessonModal'
import { ScheduleFilters } from '../components/ScheduleFilters'
import { ScheduleList } from '../components/ScheduleList'
import {
  getDirections,
  getLevels,
  getPublicSchedule,
  getTeachers,
  type Direction,
  type Lesson,
  type Level,
  type Teacher,
} from '../services/schedule'
import { isAuthenticated } from '../auth/session'

export function SchedulePage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [directions, setDirections] = useState<Direction[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const filtersRef = useRef<HTMLDivElement | null>(null)
  const [filtersHeight, setFiltersHeight] = useState(0)
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAuthenticated())
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'create'>('view')
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
  const [filters, setFilters] = useState<{ direction: number | null; level: number | null }>({
    direction: null,
    level: null,
  })

  const measureFiltersHeight = () => {
    setFiltersHeight(filtersRef.current?.offsetHeight ?? 0)
  }

  const loadData = () =>
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

  useEffect(() => {
    void loadData()
    const syncAuth = () => setIsAdmin(isAuthenticated())
    window.addEventListener('storage', syncAuth)
    return () => window.removeEventListener('storage', syncAuth)
  }, [])

  useEffect(() => {
    if (isLoading) return

    const updateMetrics = () => {
      setWindowWidth(window.innerWidth)
      measureFiltersHeight()
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
  }, [isLoading])

  useLayoutEffect(() => {
    if (isLoading) return

    measureFiltersHeight()
    const frameId = window.requestAnimationFrame(measureFiltersHeight)
    return () => window.cancelAnimationFrame(frameId)
  }, [isLoading, isAdmin, filters.direction, filters.level, directions.length, levels.length])

  if (isLoading) {
    return <p className="mt-3 text-slate-600 dark:text-slate-300">Loading schedule...</p>
  }

  if (error) {
    return <p className="mt-3 text-rose-600 dark:text-rose-400">Error: {error}</p>
  }

  const filteredLessons = lessons.filter((lesson) => {
    const directionMatch = filters.direction === null || lesson.directionId === filters.direction
    const levelMatch =
      filters.level === null || lesson.levelIds.length === 0 || lesson.levelIds.includes(filters.level)
    return directionMatch && levelMatch
  })

  const openLessonModal = (lesson: Lesson) => {
    setModalMode('view')
    setSelectedLesson(lesson)
    setIsLessonModalOpen(true)
  }

  const openCreateLessonModal = () => {
    setModalMode('create')
    setSelectedLesson(null)
    setIsLessonModalOpen(true)
  }

  return (
    <>
      <div ref={filtersRef} className="z-40 bg-gray-100 py-2 md:sticky md:top-0 dark:bg-slate-900">
        <div className="mb-2 max-md:mb-0 md:flex md:items-start md:gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={openCreateLessonModal}
              className="mb-2 w-full rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 md:mb-0 md:w-auto md:shrink-0 dark:bg-amber-700 dark:text-amber-50 dark:hover:bg-amber-800"
            >
              Добавить занятие
            </button>
          )}
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
              <div className="hidden shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-center text-sm text-gray-600 md:block dark:bg-slate-800 dark:text-slate-300">
                Найдено: {filteredLessons.length}
              </div>
            )}
          </div>
        </div>
      </div>
      <ScheduleList
        lessons={filteredLessons}
        directions={directions}
        levels={levels}
        teachers={teachers}
        stickyTop={windowWidth >= 768 ? Math.max(filtersHeight - 1, 0) : 0}
        onSelectLesson={openLessonModal}
      />

      <LessonModal
        lesson={selectedLesson}
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        directions={directions}
        levels={levels}
        teachers={teachers}
        isAdmin={isAdmin}
        mode={modalMode}
        onSaved={() => void loadData()}
      />
    </>
  )
}
