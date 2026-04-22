import { useEffect, useState } from 'react'
import { API_BASE_URL } from './config/runtime'
import { ScheduleList } from './components/ScheduleList'
import { getPublicSchedule, type Lesson } from './services/schedule'

function App() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPublicSchedule()
      .then((data) => {
        setLessons(data)
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
      <ScheduleList lessons={lessons} />
    </main>
  )
}

export default App
