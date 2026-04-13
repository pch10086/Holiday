import type { TripDetail } from '../types'

export function useTodayView(detail: TripDetail | null) {
  if (!detail) {
    return { todayDay: null, todayItems: [], pendingTasks: [], progress: 0 }
  }

  const todayIso = new Date().toISOString().slice(0, 10)
  const todayDay =
    detail.days.find((day) => day.date === todayIso) ??
    detail.days.find((day) => day.date >= todayIso) ??
    detail.days[0] ??
    null

  const todayItems = todayDay
    ? detail.itineraryItems
        .filter((item) => item.dayId === todayDay.id)
        .sort((a, b) => a.time.localeCompare(b.time))
    : []

  const pendingTasks = detail.tasks.filter((task) => !task.completed)
  const completed = detail.tasks.filter((task) => task.completed).length
  const progress = detail.tasks.length ? Math.round((completed / detail.tasks.length) * 100) : 0

  return { todayDay, todayItems, pendingTasks, progress }
}
