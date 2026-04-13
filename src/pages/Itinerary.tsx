import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DaySection } from '../components/itinerary/DaySection'
import { PageHeader } from '../components/layout/PageHeader'
import { useTrip } from '../hooks/useTrip'

export function ItineraryPage() {
  const { id = '' } = useParams()
  const { tripDetail, loading, error } = useTrip(id)
  const [activeDayId, setActiveDayId] = useState<string>('')

  const nextItemId = useMemo(() => {
    if (!tripDetail) return undefined
    const now = new Date().toTimeString().slice(0, 5)
    const upcoming = tripDetail.itineraryItems.find((item) => item.time >= now)
    return upcoming?.id
  }, [tripDetail])

  if (loading && !tripDetail) {
    return <p className="p-4 text-sm text-slate-500">加载行程中...</p>
  }
  if (!tripDetail) {
    return <p className="p-4 text-sm text-red-600">{error ?? '旅行不存在'}</p>
  }

  const days = tripDetail.days
  const selectedDayId = activeDayId || days[0]?.id
  const selectedDay = days.find((item) => item.id === selectedDayId) ?? days[0]
  const items = tripDetail.itineraryItems.filter((item) => item.dayId === selectedDay?.id)

  return (
    <div className="pb-24">
      <PageHeader title="行程安排" subtitle={tripDetail.trip.title} backTo={`/trip/${id}`} />
      <main className="mx-auto w-full max-w-md bg-stone-50 px-4 py-4">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {days.map((day) => (
            <button
              type="button"
              key={day.id}
              onClick={() => setActiveDayId(day.id)}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm ${
                day.id === selectedDayId ? 'bg-emerald-900 text-white' : 'bg-white text-emerald-800'
              }`}
            >
              D{day.dayNumber}
            </button>
          ))}
        </div>

        {selectedDay ? <DaySection day={selectedDay} items={items} nextItemId={nextItemId} /> : null}
      </main>
    </div>
  )
}
