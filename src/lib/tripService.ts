import { mockTrip } from '../data/mockTrip'
import { hasSupabaseEnv, supabase } from './supabase'
import { parseTravelPlan } from './parser'
import type {
  ItineraryDay,
  ItineraryItem,
  NewTripInput,
  ParsedPlanResult,
  Task,
  Trip,
  TripDetail,
} from '../types'

const STORAGE_KEY = 'holiday_trips_v1'

interface LocalDataShape {
  trips: Trip[]
  days: ItineraryDay[]
  itineraryItems: ItineraryItem[]
  tasks: Task[]
}

function loadLocalData(): LocalDataShape {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        trips: [mockTrip.trip],
        days: mockTrip.days,
        itineraryItems: mockTrip.itineraryItems,
        tasks: mockTrip.tasks,
      }),
    )
    return loadLocalData()
  }

  return JSON.parse(raw) as LocalDataShape
}

function saveLocalData(data: LocalDataShape) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function mapTrip(row: Record<string, unknown>): Trip {
  return {
    id: row.id as string,
    title: row.title as string,
    destination: row.destination as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    travelers: (row.travelers as string[]) ?? [],
    coverEmoji: (row.cover_emoji as string) ?? '🧭',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapDay(row: Record<string, unknown>): ItineraryDay {
  return {
    id: row.id as string,
    tripId: row.trip_id as string,
    date: row.date as string,
    dayNumber: row.day_number as number,
    title: row.title as string,
  }
}

function mapItineraryItem(row: Record<string, unknown>): ItineraryItem {
  return {
    id: row.id as string,
    tripId: row.trip_id as string,
    dayId: row.day_id as string,
    time: row.time as string,
    title: row.title as string,
    location: row.location as string | undefined,
    notes: row.notes as string | undefined,
    completed: row.completed as boolean,
    assignee: row.assignee as string | undefined,
    updatedBy: row.updated_by as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    tripId: row.trip_id as string,
    type: row.type as Task['type'],
    title: row.title as string,
    completed: row.completed as boolean,
    assignee: row.assignee as string | undefined,
    notes: row.notes as string | undefined,
    updatedBy: row.updated_by as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function listTrips(): Promise<Trip[]> {
  if (hasSupabaseEnv && supabase) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('start_date', { ascending: false })
    if (error) {
      throw error
    }
    return (data ?? []).map((row) => mapTrip(row as Record<string, unknown>))
  }

  return loadLocalData().trips.sort((a, b) => b.startDate.localeCompare(a.startDate))
}

export async function getTripDetail(tripId: string): Promise<TripDetail | null> {
  if (hasSupabaseEnv && supabase) {
    const [{ data: trip }, { data: days }, { data: items }, { data: tasks }] = await Promise.all([
      supabase.from('trips').select('*').eq('id', tripId).maybeSingle(),
      supabase.from('itinerary_days').select('*').eq('trip_id', tripId).order('day_number'),
      supabase
        .from('itinerary_items')
        .select('*')
        .eq('trip_id', tripId)
        .order('time', { ascending: true }),
      supabase.from('tasks').select('*').eq('trip_id', tripId).order('created_at'),
    ])

    if (!trip) {
      return null
    }

    return {
      trip: mapTrip(trip as unknown as Record<string, unknown>),
      days: (days ?? []).map((row) => mapDay(row as Record<string, unknown>)),
      itineraryItems: (items ?? []).map((row) => mapItineraryItem(row as Record<string, unknown>)),
      tasks: (tasks ?? []).map((row) => mapTask(row as Record<string, unknown>)),
    }
  }

  const local = loadLocalData()
  const trip = local.trips.find((item) => item.id === tripId)
  if (!trip) {
    return null
  }

  return {
    trip,
    days: local.days.filter((item) => item.tripId === tripId),
    itineraryItems: local.itineraryItems.filter((item) => item.tripId === tripId),
    tasks: local.tasks.filter((item) => item.tripId === tripId),
  }
}

export async function createTrip(input: NewTripInput): Promise<Trip> {
  if (hasSupabaseEnv && supabase) {
    const { data, error } = await supabase
      .from('trips')
      .insert({
        title: input.title,
        destination: input.destination,
        start_date: input.startDate,
        end_date: input.endDate,
        travelers: input.travelers,
        cover_emoji: input.coverEmoji ?? '🧭',
      })
      .select('*')
      .single()

    if (error) {
      throw error
    }
    return mapTrip(data as unknown as Record<string, unknown>)
  }

  const local = loadLocalData()
  const now = new Date().toISOString()
  const trip: Trip = {
    id: crypto.randomUUID(),
    title: input.title,
    destination: input.destination,
    startDate: input.startDate,
    endDate: input.endDate,
    travelers: input.travelers,
    coverEmoji: input.coverEmoji ?? '🧭',
    createdAt: now,
    updatedAt: now,
  }

  local.trips.unshift(trip)
  saveLocalData(local)
  return trip
}

export async function importTripPlan(
  tripId: string,
  text: string,
): Promise<{ result: ParsedPlanResult }> {
  const result = parseTravelPlan(text)
  const tripDetail = await getTripDetail(tripId)
  if (!tripDetail) {
    throw new Error('旅行不存在，无法导入计划。')
  }

  const startDate = new Date(tripDetail.trip.startDate)
  const dayRows = result.days.map((day, index) => {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + index)
    return {
      id: crypto.randomUUID(),
      trip_id: tripId,
      date: currentDate.toISOString().slice(0, 10),
      day_number: day.dayNumber,
      title: day.title,
    }
  })

  const itineraryRows = result.days.flatMap((day, index) => {
    const dayId = dayRows[index].id
    return day.items.map((item) => ({
      trip_id: tripId,
      day_id: dayId,
      time: item.time,
      title: item.title,
      location: item.location ?? null,
      notes: item.notes ?? null,
      completed: false,
      assignee: null,
      updated_by: null,
    }))
  })

  const taskRows = result.tasks.map((task) => ({
    trip_id: tripId,
    type: task.type,
    title: task.title,
    completed: false,
    assignee: null,
    notes: task.notes ?? null,
    updated_by: null,
  }))

  if (hasSupabaseEnv && supabase) {
    const { error: clearDaysErr } = await supabase.from('itinerary_days').delete().eq('trip_id', tripId)
    if (clearDaysErr) throw clearDaysErr
    const { error: clearItemsErr } = await supabase
      .from('itinerary_items')
      .delete()
      .eq('trip_id', tripId)
    if (clearItemsErr) throw clearItemsErr
    const { error: clearTasksErr } = await supabase.from('tasks').delete().eq('trip_id', tripId)
    if (clearTasksErr) throw clearTasksErr

    if (dayRows.length) {
      const { error } = await supabase.from('itinerary_days').insert(dayRows)
      if (error) throw error
    }
    if (itineraryRows.length) {
      const { error } = await supabase.from('itinerary_items').insert(itineraryRows)
      if (error) throw error
    }
    if (taskRows.length) {
      const { error } = await supabase.from('tasks').insert(taskRows)
      if (error) throw error
    }
  } else {
    const local = loadLocalData()
    local.days = local.days.filter((item) => item.tripId !== tripId)
    local.itineraryItems = local.itineraryItems.filter((item) => item.tripId !== tripId)
    local.tasks = local.tasks.filter((item) => item.tripId !== tripId)

    const now = new Date().toISOString()
    local.days.push(
      ...dayRows.map((row) => ({
        id: row.id,
        tripId,
        date: row.date,
        dayNumber: row.day_number,
        title: row.title,
      })),
    )
    local.itineraryItems.push(
      ...itineraryRows.map((row) => ({
        id: crypto.randomUUID(),
        tripId,
        dayId: row.day_id,
        time: row.time,
        title: row.title,
        location: row.location ?? undefined,
        notes: row.notes ?? undefined,
        completed: false,
        assignee: undefined,
        updatedBy: undefined,
        createdAt: now,
        updatedAt: now,
      })),
    )
    local.tasks.push(
      ...taskRows.map((row) => ({
        id: crypto.randomUUID(),
        tripId,
        type: row.type,
        title: row.title,
        completed: false,
        assignee: undefined,
        notes: row.notes ?? undefined,
        updatedBy: undefined,
        createdAt: now,
        updatedAt: now,
      })),
    )
    saveLocalData(local)
  }

  return { result }
}

export async function toggleTask(taskId: string, completed: boolean, updatedBy = '旅伴'): Promise<void> {
  if (hasSupabaseEnv && supabase) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed, updated_by: updatedBy, updated_at: new Date().toISOString() })
      .eq('id', taskId)
    if (error) throw error
    return
  }

  const local = loadLocalData()
  local.tasks = local.tasks.map((item) =>
    item.id === taskId ? { ...item, completed, updatedBy, updatedAt: new Date().toISOString() } : item,
  )
  saveLocalData(local)
}
