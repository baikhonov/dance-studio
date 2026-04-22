import { useEffect, useState } from 'react'
import { API_BASE_URL } from './config/runtime'
import { ScheduleList } from './components/ScheduleList'
import './App.css'
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
      <main>
        <h1>Dance Studio (React)</h1>
        <p>Loading schedule...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <h1>Dance Studio (React)</h1>
        <p>Error: {error}</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Dance Studio (React)</h1>
      <p>Migration in progress</p>
      <p>API: {API_BASE_URL}</p>
      <p>Lessons count: {lessons.length}</p>
      <ScheduleList lessons={lessons} directions={directions} levels={levels} teachers={teachers} />
    </main>
  )
}

export default App
