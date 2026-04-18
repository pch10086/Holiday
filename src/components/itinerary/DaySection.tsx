import type { ItineraryDay, ItineraryItem } from '../../types'
import { ItineraryItem as ItemCard, type ItinerarySelectMode } from './ItineraryItem'

interface DaySectionProps {
  day: ItineraryDay
  items: ItineraryItem[]
  nextItemId?: string
  onToggleItemComplete?: (item: ItineraryItem, completed: boolean) => void
  selectMode?: ItinerarySelectMode | null
  onItemSelect?: (item: ItineraryItem) => void
}

export function DaySection({
  day,
  items,
  nextItemId,
  onToggleItemComplete,
  selectMode,
  onItemSelect,
}: DaySectionProps) {
  return (
    <section className="space-y-4">
      <header>
        <h3 className="text-[21px] font-semibold leading-tight tracking-[-0.02em] text-apple-text">{day.title}</h3>
        <p className="mt-1 text-[12px] text-black/48">{day.date}</p>
      </header>
      <div className="space-y-2">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            highlight={item.id === nextItemId && !selectMode}
            onToggleComplete={onToggleItemComplete}
            selectMode={selectMode}
            onItemSelect={onItemSelect}
          />
        ))}
        {!items.length ? (
          <p className="rounded-lg bg-white px-4 py-4 text-[14px] leading-relaxed text-black/55 shadow-apple-card">
            这一天还没有安排事项。
          </p>
        ) : null}
      </div>
    </section>
  )
}
