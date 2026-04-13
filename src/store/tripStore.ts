import { create } from 'zustand'
import type { Trip, TripDetail } from '../types'
import {
  createTrip,
  getTripDetail,
  importTripPlan,
  listTrips,
  toggleTask,
} from '../lib/tripService'

interface TripStore {
  trips: Trip[]
  tripDetail: TripDetail | null
  loading: boolean
  error: string | null
  fetchTrips: () => Promise<void>
  fetchTripDetail: (tripId: string) => Promise<void>
  createTrip: Parameters<typeof createTrip>[0] extends infer T
    ? (input: T) => Promise<Trip>
    : never
  importPlan: (tripId: string, text: string) => Promise<string[]>
  toggleTaskStatus: (tripId: string, taskId: string, completed: boolean) => Promise<void>
}

export const useTripStore = create<TripStore>((set) => ({
  trips: [],
  tripDetail: null,
  loading: false,
  error: null,
  fetchTrips: async () => {
    set({ loading: true, error: null })
    try {
      const trips = await listTrips()
      set({ trips, loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : '加载旅行列表失败' })
    }
  },
  fetchTripDetail: async (tripId) => {
    set({ loading: true, error: null })
    try {
      const detail = await getTripDetail(tripId)
      if (!detail) {
        set({ loading: false, error: '旅行不存在', tripDetail: null })
        return
      }
      set({ tripDetail: detail, loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : '加载旅行详情失败' })
    }
  },
  createTrip: async (input) => {
    const trip = await createTrip(input)
    set((state) => ({ trips: [trip, ...state.trips] }))
    return trip
  },
  importPlan: async (tripId, text) => {
    const { result } = await importTripPlan(tripId, text)
    const detail = await getTripDetail(tripId)
    set({ tripDetail: detail })
    return result.warnings
  },
  toggleTaskStatus: async (tripId, taskId, completed) => {
    await toggleTask(taskId, completed)
    const detail = await getTripDetail(tripId)
    set({ tripDetail: detail })
  },
}))
