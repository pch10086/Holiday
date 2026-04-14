import { create } from 'zustand'
import type {
  ItineraryItemCreateInput,
  ItineraryItemUpdateInput,
  TaskCreateInput,
  TaskUpdateInput,
  Trip,
  TripDetail,
} from '../types'
import {
  createItineraryItem,
  createTask,
  createTrip,
  deleteItineraryItem,
  deleteTask,
  deleteTrip,
  getTripDetail,
  importTripPlan,
  listTrips,
  toggleTask,
  updateItineraryItem,
  updateTask,
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
  deleteTrip: (tripId: string) => Promise<void>
  createItineraryItem: (
    tripId: string,
    input: Omit<ItineraryItemCreateInput, 'tripId'>,
  ) => Promise<void>
  updateItineraryItem: (tripId: string, itemId: string, input: ItineraryItemUpdateInput) => Promise<void>
  toggleItineraryItemComplete: (tripId: string, itemId: string, completed: boolean) => Promise<void>
  deleteItineraryItem: (tripId: string, itemId: string) => Promise<void>
  createTask: (tripId: string, input: Omit<TaskCreateInput, 'tripId'>) => Promise<void>
  updateTask: (tripId: string, taskId: string, input: TaskUpdateInput) => Promise<void>
  deleteTask: (tripId: string, taskId: string) => Promise<void>
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
    const detail = await getTripDetail(tripId)
    if (!detail) {
      throw new Error('旅行不存在')
    }
    await toggleTask(taskId, completed, detail.trip.startDate)
    const updatedDetail = await getTripDetail(tripId)
    set({ tripDetail: updatedDetail })
  },
  deleteTrip: async (tripId) => {
    await deleteTrip(tripId)
    const trips = await listTrips()
    set({ trips, tripDetail: null })
  },
  createItineraryItem: async (tripId, input) => {
    await createItineraryItem({ ...input, tripId })
    const detail = await getTripDetail(tripId)
    set({ tripDetail: detail })
  },
  updateItineraryItem: async (tripId, itemId, input) => {
    await updateItineraryItem(itemId, input)
    const detail = await getTripDetail(tripId)
    set({ tripDetail: detail })
  },
  toggleItineraryItemComplete: async (tripId, itemId, completed) => {
    await updateItineraryItem(itemId, { completed, updatedBy: '旅伴' })
    const detail = await getTripDetail(tripId)
    set({ tripDetail: detail })
  },
  deleteItineraryItem: async (tripId, itemId) => {
    await deleteItineraryItem(itemId)
    const detail = await getTripDetail(tripId)
    set({ tripDetail: detail })
  },
  createTask: async (tripId, input) => {
    await createTask({ ...input, tripId })
    const detail = await getTripDetail(tripId)
    set({ tripDetail: detail })
  },
  updateTask: async (tripId, taskId, input) => {
    await updateTask(taskId, input)
    const detail = await getTripDetail(tripId)
    set({ tripDetail: detail })
  },
  deleteTask: async (tripId, taskId) => {
    await deleteTask(taskId)
    const detail = await getTripDetail(tripId)
    set({ tripDetail: detail })
  },
}))
