import type { ItineraryDay, ItineraryItem } from '../../types'
import { ItineraryItem as ItemCard } from './ItineraryItem'

interface DaySectionProps {
  day: ItineraryDay
  items: ItineraryItem[]
  nextItemId?: string
}

export function DaySection({ day, items, nextItemId }: DaySectionProps) {
  return (
    <section className="space-y-3">
      <header>
        <h3 className="font-serif text-lg font-semibold text-emerald-950">{day.title}</h3>
        <p className="text-xs text-emerald-700">{day.date}</p>
      </header>
      <div className="space-y-2">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} highlight={item.id === nextItemId} />
        ))}
        {!items.length ? (
          <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">这一天还没有安排事项。</p>
        ) : null}
      </div>
    </section>
  )
}
