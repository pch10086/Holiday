import { describe, expect, it } from 'vitest'
import { sampleImportText } from '../data/mockTrip'
import { parseTravelPlan } from './parser'

describe('parseTravelPlan', () => {
  it('parses sampleImportText into days with timed items and tasks', () => {
    const result = parseTravelPlan(sampleImportText)
    expect(result.days.length).toBeGreaterThanOrEqual(1)
    expect(result.days[0].items.length).toBeGreaterThan(0)
    expect(result.tasks.some((t) => t.title.includes('订机票'))).toBe(true)
    expect(result.tasks.some((t) => t.type === 'travel')).toBe(true)
  })

  it('throws on empty meaningful content', () => {
    expect(() => parseTravelPlan('   \n  ')).toThrow(/没有解析到有效内容/)
  })
})
