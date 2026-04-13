import { MapPin } from 'lucide-react'
import type { ItineraryItem as ItineraryItemType } from '../../types'

interface ItineraryItemProps {
  item: ItineraryItemType
  highlight?: boolean
}

export function ItineraryItem({ item, highlight }: ItineraryItemProps) {
  return (
    <article
      className={`rounded-2xl border p-3 ${
        highlight ? 'border-amber-300 bg-amber-50' : 'border-emerald-100 bg-white'
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded-full bg-emerald-900 px-2 py-1 text-xs font-semibold text-white">
          {item.time}
        </span>
        <h4 className="font-medium text-emerald-950">{item.title}</h4>
      </div>
      {item.location ? (
        <p className="mb-1 flex items-center gap-1 text-sm text-emerald-700">
          <MapPin size={14} /> {item.location}
        </p>
      ) : null}
      {item.notes ? <p className="text-xs text-slate-600">{item.notes}</p> : null}
    </article>
  )
}
