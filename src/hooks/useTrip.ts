import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useTripStore } from '../store/tripStore'

type Store = ReturnType<typeof useTripStore.getState>

const tripActionSelectors = (s: Store) => ({
  toggleTaskStatus: s.toggleTaskStatus,
  deleteTrip: s.deleteTrip,
  createItineraryItem: s.createItineraryItem,
  updateItineraryItem: s.updateItineraryItem,
  toggleItineraryItemComplete: s.toggleItineraryItemComplete,
  deleteItineraryItem: s.deleteItineraryItem,
  createTask: s.createTask,
  updateTask: s.updateTask,
  deleteTask: s.deleteTask,
})

/**
 * 旅行详情页用：细粒度订阅 tripDetail / detailLoading / error，动作为稳定引用（useShallow）。
 * `loading` 为 `detailLoading` 别名，保持页面代码兼容。
 */
export function useTrip(tripId?: string) {
  const tripDetail = useTripStore((s) => s.tripDetail)
  const detailLoading = useTripStore((s) => s.detailLoading)
  const error = useTripStore((s) => s.error)
  const fetchTripDetail = useTripStore((s) => s.fetchTripDetail)
  const actions = useTripStore(useShallow(tripActionSelectors))

  useEffect(() => {
    if (!tripId) return
    void fetchTripDetail(tripId)
  }, [tripId, fetchTripDetail])

  return useMemo(
    () => ({
      tripDetail,
      loading: detailLoading,
      detailLoading,
      error,
      fetchTripDetail,
      ...actions,
    }),
    [tripDetail, detailLoading, error, fetchTripDetail, actions],
  )
}
