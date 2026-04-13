import { useEffect } from 'react'
import { useTripStore } from '../store/tripStore'

export function useTrip(tripId?: string) {
  const store = useTripStore()
  const fetchTripDetail = useTripStore((state) => state.fetchTripDetail)

  useEffect(() => {
    if (!tripId) return
    void fetchTripDetail(tripId)
  }, [tripId, fetchTripDetail])

  return store
}
