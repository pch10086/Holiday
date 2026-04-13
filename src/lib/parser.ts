import type { ParsedPlanResult, TaskType } from '../types'

const DAY_HEADER_REGEX = /^(第[一二三四五六七八九十百\d]+天|day\s*\d+|\d{1,2}月\d{1,2}日)/i
const TIME_LINE_REGEX = /^([01]?\d|2[0-3]):([0-5]\d)\s+(.+)$/
const PREP_HEADER_REGEX = /(准备事项|出发前|待办|准备清单)/
const TRAVEL_TASK_HEADER_REGEX = /(途中|旅途中|行程中|当日任务)/
const LOCATION_SPLIT_REGEX = /\s+[-|｜]\s+/

export function parseTravelPlan(text: string): ParsedPlanResult {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const warnings: string[] = []
  const days: ParsedPlanResult['days'] = []
  const tasks: ParsedPlanResult['tasks'] = []

  let currentDay: ParsedPlanResult['days'][number] | null = null
  let taskMode: TaskType | null = null

  const ensureDefaultDay = () => {
    if (!currentDay) {
      currentDay = { title: '第1天', dayNumber: 1, items: [] }
      days.push(currentDay)
      warnings.push('未识别到明确天数标题，已将时间事项归入“第1天”。')
    }
  }

  for (const line of lines) {
    if (DAY_HEADER_REGEX.test(line)) {
      const dayNumber = extractDayNumber(line, days.length + 1)
      currentDay = { title: line, dayNumber, items: [] }
      days.push(currentDay)
      taskMode = null
      continue
    }

    if (PREP_HEADER_REGEX.test(line)) {
      taskMode = 'prep'
      continue
    }

    if (TRAVEL_TASK_HEADER_REGEX.test(line)) {
      taskMode = 'travel'
      continue
    }

    const timeMatch = line.match(TIME_LINE_REGEX)
    if (timeMatch) {
      const time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`
      const content = timeMatch[3].trim()
      const [title, location] = splitTitleAndLocation(content)

      ensureDefaultDay()
      currentDay!.items.push({ time, title, location })
      taskMode = null
      continue
    }

    if (taskMode) {
      const cleaned = cleanListPrefix(line)
      if (cleaned) {
        tasks.push({ type: taskMode, title: cleaned })
      }
      continue
    }

    const maybeTask = cleanListPrefix(line)
    if (maybeTask) {
      tasks.push({ type: 'prep', title: maybeTask })
      continue
    }

    warnings.push(`未识别内容：${line}`)
  }

  if (!days.length && !tasks.length) {
    throw new Error(
      '没有解析到有效内容。请至少提供“第X天 + 时间事项”或“准备事项列表”。',
    )
  }

  if (!days.length) {
    warnings.push('未解析到行程天数，仅导入了任务清单。')
  }

  return { days, tasks, warnings }
}

function extractDayNumber(title: string, fallback: number): number {
  const numberMatch = title.match(/\d+/)
  if (numberMatch) {
    return Number(numberMatch[0])
  }

  const chineseMap: Record<string, number> = {
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
  }

  const chineseMatch = title.match(/第([一二三四五六七八九十]+)天/)
  if (!chineseMatch) {
    return fallback
  }

  const value = chineseMatch[1]
  if (value === '十') {
    return 10
  }
  if (value.startsWith('十')) {
    return 10 + (chineseMap[value[1]] ?? 0)
  }
  if (value.endsWith('十')) {
    return (chineseMap[value[0]] ?? 1) * 10
  }

  return chineseMap[value] ?? fallback
}

function splitTitleAndLocation(content: string): [string, string | undefined] {
  const chunks = content.split(LOCATION_SPLIT_REGEX)
  if (chunks.length > 1) {
    return [chunks[0].trim(), chunks.slice(1).join(' - ').trim()]
  }
  return [content, undefined]
}

function cleanListPrefix(line: string): string {
  return line.replace(/^[-•·*]\s*/, '').trim()
}
