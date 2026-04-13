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
      className="block rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-emerald-950">
          {trip.coverEmoji} {trip.title}
        </h3>
        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">查看</span>
      </div>
      <div className="space-y-2 text-sm text-emerald-800">
        <p className="flex items-center gap-2">
          <MapPin size={14} />
          {trip.destination}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays size={14} />
          {trip.startDate} ~ {trip.endDate}
        </p>
      </div>
    </Link>
  )
}
