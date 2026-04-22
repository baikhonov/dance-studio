import type { Direction, Lesson, Level, Teacher } from '../services/schedule'
import { LessonCard } from './LessonCard'

type ScheduleListProps = {
  lessons: Lesson[]
  directions: Direction[]
  levels: Level[]
  teachers: Teacher[]
  stickyTop?: number
  onSelectLesson?: (lesson: Lesson) => void
}

const weekDaysOrder = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
]

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0
  return hours * 60 + minutes
}

const baseTimeSlots = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
]

const SLOT_HEIGHT = 110
const COMPRESSED_SLOT_HEIGHT = 32
const LONG_LESSON_THRESHOLD_MINUTES = 90
const LONG_ONLY_SLOT_HEIGHT = Math.round(SLOT_HEIGHT * 0.5)

type TimelineSegment = {
  startMinutes: number
  endMinutes: number
  height: number
}

export function ScheduleList({
  lessons,
  directions,
  levels,
  teachers,
  stickyTop = 0,
  onSelectLesson,
}: ScheduleListProps) {
  const getDirectionNameById = (id: number) =>
    directions.find((direction) => direction.id === id)?.name ?? 'Без направления'

  const getLevelNamesByIds = (ids: number[]) => {
    if (ids.length === 0) return 'Для всех'
    return ids.map((id) => levels.find((level) => level.id === id)?.name ?? 'Для всех').join(', ')
  }

  const getTeacherNamesByIds = (ids: number[]) => {
    if (ids.length === 0) return '-'
    return ids.map((id) => teachers.find((teacher) => teacher.id === id)?.name ?? `#${id}`).join(', ')
  }

  const getTeacherPhotosByIds = (ids: number[]) =>
    ids
      .map((id) => teachers.find((teacher) => teacher.id === id)?.photo)
      .filter((value): value is string => Boolean(value))

  const getLevelColorByIds = (ids: number[]) => {
    if (ids.length === 0) return null
    return levels.find((level) => level.id === ids[0])?.color ?? null
  }

  const visibleDays = weekDaysOrder
  const timeSlotMinutes = baseTimeSlots.map(toMinutes)

  const slotDurations = timeSlotMinutes.map((slotStart, index, slots) => {
    const nextSlotStart = slots[index + 1]
    const fallbackInterval = index > 0 ? slotStart - slots[index - 1] : 60
    return (nextSlotStart ?? slotStart + fallbackInterval) - slotStart
  })

  const slotOccupancy = timeSlotMinutes.map((slotStart, index, slots) => {
    const nextSlotStart = slots[index + 1]
    const fallbackInterval = index > 0 ? slotStart - slots[index - 1] : 60
    const slotEnd = nextSlotStart ?? slotStart + fallbackInterval

    let hasAny = false
    let hasShort = false

    lessons.forEach((lesson) => {
      const lessonStart = toMinutes(lesson.time)
      const lessonEnd = lesson.crossesMidnight ? 24 * 60 : toMinutes(lesson.endTime)
      const intersects = lessonStart < slotEnd && lessonEnd > slotStart
      if (!intersects) return

      hasAny = true
      const lessonDuration = lesson.crossesMidnight
        ? 24 * 60 - lessonStart + toMinutes(lesson.endTime)
        : lessonEnd - lessonStart

      if (lessonDuration < LONG_LESSON_THRESHOLD_MINUTES) {
        hasShort = true
      }
    })

    return {
      hasAny,
      isLongOnly: hasAny && !hasShort,
    }
  })

  const timelineSegments: TimelineSegment[] = []
  let index = 0
  while (index < timeSlotMinutes.length) {
    const startMinutes = timeSlotMinutes[index]

    if (slotOccupancy[index]?.hasAny) {
      const endMinutes = startMinutes + slotDurations[index]
      timelineSegments.push({
        startMinutes,
        endMinutes,
        height: slotOccupancy[index].isLongOnly ? LONG_ONLY_SLOT_HEIGHT : SLOT_HEIGHT,
      })
      index += 1
      continue
    }

    let endIndex = index
    while (endIndex + 1 < timeSlotMinutes.length && !slotOccupancy[endIndex + 1]?.hasAny) {
      endIndex += 1
    }

    const endMinutes = timeSlotMinutes[endIndex] + slotDurations[endIndex]
    timelineSegments.push({
      startMinutes,
      endMinutes,
      height: COMPRESSED_SLOT_HEIGHT,
    })
    index = endIndex + 1
  }

  const toTimeLabel = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }

  const timeRows = timelineSegments.map((segment) => {
    const duration = segment.endMinutes - segment.startMinutes
    const label =
      duration > 60
        ? `${toTimeLabel(segment.startMinutes)}-${toTimeLabel(segment.endMinutes)}`
        : toTimeLabel(segment.startMinutes)

    return {
      key: `${segment.startMinutes}-${segment.endMinutes}`,
      label,
      height: segment.height,
    }
  })

  const totalGridHeight = timeRows.reduce((sum, row) => sum + row.height, 0)

  const getMinutesOffset = (targetMinutes: number): number => {
    if (timelineSegments.length === 0) return 0

    let offset = 0
    const lastIndex = timelineSegments.length - 1

    for (let segmentIndex = 0; segmentIndex < lastIndex; segmentIndex += 1) {
      const slotStart = timelineSegments[segmentIndex].startMinutes
      const slotEnd = timelineSegments[segmentIndex].endMinutes
      const intervalMinutes = slotEnd - slotStart
      const slotHeight = timelineSegments[segmentIndex].height

      if (targetMinutes <= slotStart) return offset

      if (targetMinutes < slotEnd) {
        const filledMinutes = targetMinutes - slotStart
        return offset + (filledMinutes / intervalMinutes) * slotHeight
      }

      offset += slotHeight
    }

    const lastSegment = timelineSegments[lastIndex]
    const lastSlotStart = lastSegment.startMinutes
    const fallbackInterval = lastSegment.endMinutes - lastSegment.startMinutes || 60
    const minutesAfterLastSlot = Math.max(targetMinutes - lastSlotStart, 0)

    return offset + (minutesAfterLastSlot / fallbackInterval) * lastSegment.height
  }

  const getLessonStyle = (lesson: Lesson) => {
    const startMinutes = toMinutes(lesson.time)
    const endMinutes = lesson.crossesMidnight ? 24 * 60 : toMinutes(lesson.endTime)
    const top = getMinutesOffset(startMinutes)
    const height = getMinutesOffset(endMinutes) - top
    return {
      top: `${top + 3}px`,
      left: '3px',
      right: '3px',
      height: `${height - 6}px`,
    }
  }

  const getLessonsForDay = (day: string) =>
    lessons
      .filter((lesson) => lesson.day === day)
      .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))

  return (
    <section className="max-h-[75dvh] overflow-x-auto overflow-y-auto md:max-h-none md:overflow-visible">
      <div className="mx-auto min-w-[870px] border-gray-300 md:min-w-0 md:max-w-[1280px]">
        <div
          className="sticky top-0 z-30 grid grid-cols-[90px_repeat(7,minmax(110px,1fr))] bg-gray-100 shadow-sm"
          style={{
            top: `${stickyTop}px`,
          }}
        >
          <div className="sticky left-0 z-20 flex items-center justify-center border border-r border-gray-300 bg-gray-200 p-2 text-center font-semibold text-gray-700 md:border-r-0 md:bg-gray-200/50 md:p-3">
            Время
          </div>
          {visibleDays.map((day) => (
            <div
              key={`head-${day}`}
              className="flex items-center justify-center border border-r-0 border-gray-300 bg-gray-200 p-2 text-center font-semibold text-gray-700 last:border-r md:bg-gray-200/50 md:p-3"
            >
              <span className="md:hidden">{day.slice(0, 11)}</span>
              <span className="hidden md:inline">{day}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[90px_repeat(7,minmax(110px,1fr))]">
          <div className="sticky left-0 z-10 bg-gray-100 md:static">
            {timeRows.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-center whitespace-nowrap border border-b-0 border-gray-300 p-2 text-center text-sm font-medium text-gray-600 last:border-b md:p-3"
                style={{ height: `${row.height}px` }}
              >
                {row.label}
              </div>
            ))}
          </div>
          {visibleDays.map((day) => (
            <div
              key={`day-${day}`}
              className="relative border border-b-0 border-r-0 border-gray-300 bg-gray-100 last:border-r"
              style={{ minHeight: `${totalGridHeight}px` }}
            >
              {timeRows.map((row) => (
                <div
                  key={`grid-${day}-${row.key}`}
                  className="border-b border-gray-300"
                  style={{ height: `${row.height}px` }}
                />
              ))}

              {getLessonsForDay(day).map((lesson) => (
                <div key={lesson.id} className="absolute z-10" style={getLessonStyle(lesson)}>
                  <LessonCard
                    lesson={lesson}
                    directionName={getDirectionNameById(lesson.directionId)}
                    levelLabel={getLevelNamesByIds(lesson.levelIds)}
                    teacherNames={getTeacherNamesByIds(lesson.teacherIds)}
                    teacherPhotos={getTeacherPhotosByIds(lesson.teacherIds)}
                    levelColor={getLevelColorByIds(lesson.levelIds)}
                    onSelect={() => onSelectLesson?.(lesson)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
