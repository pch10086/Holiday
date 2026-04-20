import { mockTrip } from '../data/mockTrip'
import { hasSupabaseEnv, supabase } from './supabase'
import { parseTravelPlan } from './parser'
import type {
  ItineraryDay,
  ItineraryItemCreateInput,
  ItineraryItemUpdateInput,
  ItineraryItem,
  NewTripInput,
  ParsedPlanResult,
  Task,
  TaskCreateInput,
  TaskUpdateInput,
  Trip,
  TripDetail,
} from '../types'

const STORAGE_KEY = 'holiday_trips_v1'
const SCHEMA_VERSION = 1

interface LocalDataShape {
  trips: Trip[]
  days: ItineraryDay[]
  itineraryItems: ItineraryItem[]
  tasks: Task[]
}

interface PersistedV1 extends LocalDataShape {
  schemaVersion: number
}

function seedLocalStorage(): void {
  const payload: PersistedV1 = {
    schemaVersion: SCHEMA_VERSION,
    trips: [mockTrip.trip],
    days: mockTrip.days,
    itineraryItems: mockTrip.itineraryItems,
    tasks: mockTrip.tasks,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

function parseStoredJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    throw new Error('本地数据已损坏（JSON 无效）。已恢复为示例旅行，建议重新导入或同步云端。')
  }
}

/** 兼容无 schemaVersion 的旧数据；日后可在此按版本迁移字段 */
function migrateToLocalShape(parsed: unknown): LocalDataShape {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('本地数据格式无效。')
  }
  const o = parsed as Record<string, unknown>
  const hasVersion = 'schemaVersion' in o
  if (hasVersion) {
    const v = o.schemaVersion
    if (v !== SCHEMA_VERSION) {
      throw new Error(`不支持的本地数据版本：${String(v)}。请清除站点数据或联系维护者。`)
    }
  }
  const trips = o.trips
  const days = o.days
  const items = o.itineraryItems
  const tasks = o.tasks
  if (!Array.isArray(trips) || !Array.isArray(days) || !Array.isArray(items) || !Array.isArray(tasks)) {
    throw new Error('本地数据缺少必要字段。')
  }
  return {
    trips: trips as Trip[],
    days: days as ItineraryDay[],
    itineraryItems: items as ItineraryItem[],
    tasks: tasks as Task[],
  }
}

function loadLocalData(): LocalDataShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      seedLocalStorage()
      return migrateToLocalShape(parseStoredJson(localStorage.getItem(STORAGE_KEY) ?? '{}'))
    }

    const parsed = parseStoredJson(raw)
    const shape = migrateToLocalShape(parsed)

    if (!(parsed as PersistedV1).schemaVersion) {
      saveLocalData(shape)
    }
    return shape
  } catch (error) {
    console.error('[holiday] localStorage load failed', error)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    seedLocalStorage()
    return migrateToLocalShape(parseStoredJson(localStorage.getItem(STORAGE_KEY) ?? '{}'))
  }
}

function saveLocalData(data: LocalDataShape) {
  const payload: PersistedV1 = { schemaVersion: SCHEMA_VERSION, ...data }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (error) {
    console.error('[holiday] localStorage save failed', error)
    throw new Error('无法写入本地存储（可能已满或处于隐私模式）。请释放空间后重试。')
  }
}

function toLocalDateStart(date: string | Date): Date {
  if (date instanceof Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function isBeforeTripStartDate(startDate: string): boolean {
  const todayStart = toLocalDateStart(new Date())
  const tripStart = toLocalDateStart(startDate)
  return todayStart < tripStart
}

function ensureTripStarted(startDate: string) {
  if (isBeforeTripStartDate(startDate)) {
    throw new Error('旅行尚未开始，暂时不能勾选任务完成。')
  }
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

export async function deleteTrip(tripId: string): Promise<void> {
  if (hasSupabaseEnv && supabase) {
    const { error } = await supabase.from('trips').delete().eq('id', tripId)
    if (error) throw error
    return
  }

  const local = loadLocalData()
  local.trips = local.trips.filter((trip) => trip.id !== tripId)
  local.days = local.days.filter((day) => day.tripId !== tripId)
  local.itineraryItems = local.itineraryItems.filter((item) => item.tripId !== tripId)
  local.tasks = local.tasks.filter((task) => task.tripId !== tripId)
  saveLocalData(local)
}

export async function createItineraryItem(input: ItineraryItemCreateInput): Promise<void> {
  const now = new Date().toISOString()
  if (hasSupabaseEnv && supabase) {
    const { error } = await supabase.from('itinerary_items').insert({
      trip_id: input.tripId,
      day_id: input.dayId,
      time: input.time,
      title: input.title,
      location: input.location ?? null,
      notes: input.notes ?? null,
      completed: false,
      assignee: input.assignee ?? null,
      updated_by: input.assignee ?? null,
      created_at: now,
      updated_at: now,
    })
    if (error) throw error
    return
  }

  const local = loadLocalData()
  local.itineraryItems.push({
    id: crypto.randomUUID(),
    tripId: input.tripId,
    dayId: input.dayId,
    time: input.time,
    title: input.title,
    location: input.location,
    notes: input.notes,
    completed: false,
    assignee: input.assignee,
    updatedBy: input.assignee,
    createdAt: now,
    updatedAt: now,
  })
  saveLocalData(local)
}

export async function updateItineraryItem(
  itemId: string,
  input: ItineraryItemUpdateInput,
): Promise<void> {
  const now = new Date().toISOString()
  if (hasSupabaseEnv && supabase) {
    const patch: Record<string, unknown> = { updated_at: now }
    if (input.dayId !== undefined) patch.day_id = input.dayId
    if (input.time !== undefined) patch.time = input.time
    if (input.title !== undefined) patch.title = input.title
    if (input.location !== undefined) patch.location = input.location
    if (input.notes !== undefined) patch.notes = input.notes
    if (input.completed !== undefined) patch.completed = input.completed
    if (input.assignee !== undefined) patch.assignee = input.assignee
    if (input.updatedBy !== undefined) patch.updated_by = input.updatedBy
    const { error } = await supabase.from('itinerary_items').update(patch).eq('id', itemId)
    if (error) throw error
    return
  }

  const local = loadLocalData()
  local.itineraryItems = local.itineraryItems.map((item) =>
    item.id === itemId
      ? {
          ...item,
          dayId: input.dayId ?? item.dayId,
          time: input.time ?? item.time,
          title: input.title ?? item.title,
          location: input.location ?? item.location,
          notes: input.notes ?? item.notes,
          completed: input.completed ?? item.completed,
          assignee: input.assignee ?? item.assignee,
          updatedBy: input.updatedBy ?? item.updatedBy,
          updatedAt: now,
        }
      : item,
  )
  saveLocalData(local)
}

export async function deleteItineraryItem(itemId: string): Promise<void> {
  if (hasSupabaseEnv && supabase) {
    const { error } = await supabase.from('itinerary_items').delete().eq('id', itemId)
    if (error) throw error
    return
  }

  const local = loadLocalData()
  local.itineraryItems = local.itineraryItems.filter((item) => item.id !== itemId)
  saveLocalData(local)
}

export async function createTask(input: TaskCreateInput): Promise<void> {
  const now = new Date().toISOString()
  if (hasSupabaseEnv && supabase) {
    const { error } = await supabase.from('tasks').insert({
      trip_id: input.tripId,
      type: input.type,
      title: input.title,
      completed: input.completed ?? false,
      assignee: input.assignee ?? null,
      notes: input.notes ?? null,
      updated_by: input.updatedBy ?? null,
      created_at: now,
      updated_at: now,
    })
    if (error) throw error
    return
  }

  const local = loadLocalData()
  local.tasks.push({
    id: crypto.randomUUID(),
    tripId: input.tripId,
    type: input.type,
    title: input.title,
    completed: input.completed ?? false,
    assignee: input.assignee,
    notes: input.notes,
    updatedBy: input.updatedBy,
    createdAt: now,
    updatedAt: now,
  })
  saveLocalData(local)
}

export async function updateTask(taskId: string, input: TaskUpdateInput): Promise<void> {
  const now = new Date().toISOString()
  if (hasSupabaseEnv && supabase) {
    const { error } = await supabase
      .from('tasks')
      .update({
        type: input.type,
        title: input.title,
        completed: input.completed,
        assignee: input.assignee,
        notes: input.notes,
        updated_by: input.updatedBy,
        updated_at: now,
      })
      .eq('id', taskId)
    if (error) throw error
    return
  }

  const local = loadLocalData()
  local.tasks = local.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          type: input.type ?? task.type,
          title: input.title ?? task.title,
          completed: input.completed ?? task.completed,
          assignee: input.assignee ?? task.assignee,
          notes: input.notes ?? task.notes,
          updatedBy: input.updatedBy ?? task.updatedBy,
          updatedAt: now,
        }
      : task,
  )
  saveLocalData(local)
}

export async function deleteTask(taskId: string): Promise<void> {
  if (hasSupabaseEnv && supabase) {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) throw error
    return
  }

  const local = loadLocalData()
  local.tasks = local.tasks.filter((task) => task.id !== taskId)
  saveLocalData(local)
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

export async function toggleTask(
  taskId: string,
  completed: boolean,
  tripStartDate: string,
  updatedBy = '旅伴',
): Promise<void> {
  ensureTripStarted(tripStartDate)

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
