import type { ItineraryDay, TripDateStatus, TripDetail } from '../types'

function toLocalDateStart(date: string | Date): Date {
  if (date instanceof Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function resolveCurrentTripDay(detail: TripDetail, currentDate = new Date()) {
  const today = toLocalDateStart(currentDate)
  const tripStart = toLocalDateStart(detail.trip.startDate)
  const tripEnd = toLocalDateStart(detail.trip.endDate)
  const daysSorted = [...detail.days].sort((a, b) => a.date.localeCompare(b.date))
  const firstDay = daysSorted[0] ?? null
  const lastDay = daysSorted[daysSorted.length - 1] ?? null

  let status: TripDateStatus = 'inProgress'
  let day: ItineraryDay | null = null

  if (today < tripStart) {
    status = 'beforeStart'
    day = firstDay
  } else if (today > tripEnd) {
    status = 'afterEnd'
    day = lastDay
  } else {
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`
    day = daysSorted.find((item) => item.date === todayIso) ?? daysSorted.find((item) => item.date >= todayIso) ?? lastDay
  }

  return { todayDay: day, status }
}

export function useTodayView(detail: TripDetail | null) {
  if (!detail) {
    return {
      todayDay: null,
      todayItems: [],
      pendingTasks: [],
      progress: 0,
      dateStatus: 'inProgress' as TripDateStatus,
    }
  }

  const { todayDay, status } = resolveCurrentTripDay(detail)

  const todayItems = todayDay
    ? detail.itineraryItems
        .filter((item) => item.dayId === todayDay.id)
        .sort((a, b) => a.time.localeCompare(b.time))
    : []

  const pendingTasks = detail.tasks.filter((task) => !task.completed)
  const completed = detail.tasks.filter((task) => task.completed).length
  const progress = detail.tasks.length ? Math.round((completed / detail.tasks.length) * 100) : 0

  return { todayDay, todayItems, pendingTasks, progress, dateStatus: status }
}
