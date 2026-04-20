import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockTrip } from '../data/mockTrip'
import { resolveCurrentTripDay } from './useToday'

describe('resolveCurrentTripDay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns beforeStart when today is before trip start', () => {
    vi.setSystemTime(new Date('2026-04-15T12:00:00'))
    const { todayDay, status } = resolveCurrentTripDay(mockTrip)
    expect(status).toBe('beforeStart')
    expect(todayDay?.dayNumber).toBe(1)
  })

  it('returns inProgress and the calendar day matching today', () => {
    vi.setSystemTime(new Date('2026-04-21T12:00:00'))
    const { todayDay, status } = resolveCurrentTripDay(mockTrip)
    expect(status).toBe('inProgress')
    expect(todayDay?.date).toBe('2026-04-21')
  })

  it('returns afterEnd when today is after trip end', () => {
    vi.setSystemTime(new Date('2026-05-01T12:00:00'))
    const { todayDay, status } = resolveCurrentTripDay(mockTrip)
    expect(status).toBe('afterEnd')
    expect(todayDay?.dayNumber).toBe(2)
  })
})
