export type TaskType = 'prep' | 'travel'

export interface Trip {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  travelers: string[]
  coverEmoji: string
  createdAt: string
  updatedAt: string
}

export interface ItineraryDay {
  id: string
  tripId: string
  date: string
  dayNumber: number
  title: string
}

export interface ItineraryItem {
  id: string
  tripId: string
  dayId: string
  time: string
  title: string
  location?: string
  notes?: string
  completed: boolean
  assignee?: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  tripId: string
  type: TaskType
  title: string
  completed: boolean
  assignee?: string
  notes?: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
}

export interface TripDetail {
  trip: Trip
  days: ItineraryDay[]
  itineraryItems: ItineraryItem[]
  tasks: Task[]
}

export interface NewTripInput {
  title: string
  destination: string
  startDate: string
  endDate: string
  travelers: string[]
  coverEmoji?: string
}

export interface ParsedPlanDay {
  title: string
  dayNumber: number
  items: Array<{
    time: string
    title: string
    location?: string
    notes?: string
  }>
}

export interface ParsedPlanTask {
  type: TaskType
  title: string
  notes?: string
}

export interface ParsedPlanResult {
  days: ParsedPlanDay[]
  tasks: ParsedPlanTask[]
  warnings: string[]
}
