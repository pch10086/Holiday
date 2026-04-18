import { CalendarDays, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Trip } from '../../types'

interface TripCardProps {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link
      to={`/trip/${trip.id}/today`}
      className="block rounded-[12px] bg-white p-4 text-apple-text shadow-apple-card transition hover:opacity-[0.97] active:scale-[0.99]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-[19px] font-semibold leading-tight tracking-[-0.02em]">
          {trip.coverEmoji} {trip.title}
        </h3>
        <span className="shrink-0 rounded-full bg-apple-surface px-2.5 py-1 text-[11px] font-medium text-black/55">
          打开
        </span>
      </div>
      <div className="space-y-2 text-[14px] leading-snug text-black/80">
        <p className="flex items-center gap-2">
          <MapPin size={14} className="shrink-0 text-black/48" aria-hidden />
          {trip.destination}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays size={14} className="shrink-0 text-black/48" aria-hidden />
          {trip.startDate} — {trip.endDate}
        </p>
      </div>
    </Link>
  )
}
