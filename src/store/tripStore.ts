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

/** 同一路由内短时间切换子页时不重复请求详情 */
const DETAIL_STALE_MS = 30_000

function markDetailFresh(
  set: (partial: Partial<TripStore>) => void,
  detail: TripDetail | null,
  tripId: string | null,
) {
  set({
    tripDetail: detail,
    detailFetchedAt: detail ? Date.now() : null,
    detailFetchedTripId: detail ? tripId : null,
  })
}

interface TripStore {
  trips: Trip[]
  tripDetail: TripDetail | null
  tripsLoading: boolean
  detailLoading: boolean
  error: string | null
  detailFetchedAt: number | null
  detailFetchedTripId: string | null
  fetchTrips: () => Promise<void>
  fetchTripDetail: (tripId: string, options?: { force?: boolean }) => Promise<void>
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

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  tripDetail: null,
  tripsLoading: false,
  detailLoading: false,
  error: null,
  detailFetchedAt: null,
  detailFetchedTripId: null,

  fetchTrips: async () => {
    set({ tripsLoading: true, error: null })
    try {
      const trips = await listTrips()
      set({ trips, tripsLoading: false })
    } catch (error) {
      set({
        tripsLoading: false,
        error: error instanceof Error ? error.message : '加载旅行列表失败',
      })
    }
  },

  fetchTripDetail: async (tripId, options) => {
    const force = options?.force ?? false
    const { tripDetail, detailFetchedAt, detailFetchedTripId } = get()
    if (
      !force &&
      tripDetail &&
      tripDetail.trip.id === tripId &&
      detailFetchedTripId === tripId &&
      detailFetchedAt != null &&
      Date.now() - detailFetchedAt < DETAIL_STALE_MS
    ) {
      return
    }

    set({ detailLoading: true, error: null })
    try {
      const detail = await getTripDetail(tripId)
      if (!detail) {
        set({
          detailLoading: false,
          error: '旅行不存在',
          tripDetail: null,
          detailFetchedAt: null,
          detailFetchedTripId: null,
        })
        return
      }
      set({
        tripDetail: detail,
        detailLoading: false,
        detailFetchedAt: Date.now(),
        detailFetchedTripId: tripId,
      })
    } catch (error) {
      set({
        detailLoading: false,
        error: error instanceof Error ? error.message : '加载旅行详情失败',
      })
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
    markDetailFresh(set, detail, detail ? tripId : null)
    return result.warnings
  },

  toggleTaskStatus: async (tripId, taskId, completed) => {
    const detail = await getTripDetail(tripId)
    if (!detail) {
      throw new Error('旅行不存在')
    }
    await toggleTask(taskId, completed, detail.trip.startDate)
    const updatedDetail = await getTripDetail(tripId)
    markDetailFresh(set, updatedDetail, tripId)
  },

  deleteTrip: async (tripId) => {
    await deleteTrip(tripId)
    const trips = await listTrips()
    set({
      trips,
      tripDetail: null,
      detailFetchedAt: null,
      detailFetchedTripId: null,
    })
  },

  createItineraryItem: async (tripId, input) => {
    await createItineraryItem({ ...input, tripId })
    const detail = await getTripDetail(tripId)
    markDetailFresh(set, detail, tripId)
  },

  updateItineraryItem: async (tripId, itemId, input) => {
    await updateItineraryItem(itemId, input)
    const detail = await getTripDetail(tripId)
    markDetailFresh(set, detail, tripId)
  },

  toggleItineraryItemComplete: async (tripId, itemId, completed) => {
    await updateItineraryItem(itemId, { completed, updatedBy: '旅伴' })
    const detail = await getTripDetail(tripId)
    markDetailFresh(set, detail, tripId)
  },

  deleteItineraryItem: async (tripId, itemId) => {
    await deleteItineraryItem(itemId)
    const detail = await getTripDetail(tripId)
    markDetailFresh(set, detail, tripId)
  },

  createTask: async (tripId, input) => {
    await createTask({ ...input, tripId })
    const detail = await getTripDetail(tripId)
    markDetailFresh(set, detail, tripId)
  },

  updateTask: async (tripId, taskId, input) => {
    await updateTask(taskId, input)
    const detail = await getTripDetail(tripId)
    markDetailFresh(set, detail, tripId)
  },

  deleteTask: async (tripId, taskId) => {
    await deleteTask(taskId)
    const detail = await getTripDetail(tripId)
    markDetailFresh(set, detail, tripId)
  },
}))
