import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { TripCard } from '../components/trip/TripCard'
import { useTripStore } from '../store/tripStore'

export function HomePage() {
  const trips = useTripStore((s) => s.trips)
  const tripsLoading = useTripStore((s) => s.tripsLoading)
  const error = useTripStore((s) => s.error)
  const fetchTrips = useTripStore((s) => s.fetchTrips)

  useEffect(() => {
    void fetchTrips()
  }, [fetchTrips])

  return (
    <div className="min-h-dvh bg-apple-black text-white antialiased">
      <section className="mx-auto max-w-md px-5 pb-12 pt-[max(2.5rem,env(safe-area-inset-top))]">
        <p className="text-[12px] font-medium tracking-[0.06em] text-white/48">HOLIDAY</p>
        <h1 className="mt-2 text-[clamp(2rem,9vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
          我的旅行
        </h1>
        <p className="mt-4 max-w-[22rem] text-[17px] leading-[1.47] tracking-[-0.02em] text-white/75">
          行程、清单与今天，在一处完成。
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/trip/new"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-apple-blue px-5 text-[17px] font-normal text-white transition hover:bg-apple-blue-hover"
          >
            <Plus size={18} className="mr-2 opacity-95" strokeWidth={2} />
            创建新旅行
          </Link>
          {trips.length ? (
            <Link
              to={`/trip/${trips[0].id}/today`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/35 bg-transparent px-5 text-[14px] font-normal tracking-[-0.01em] text-apple-link-bright transition hover:bg-white/10"
            >
              继续上次
            </Link>
          ) : null}
        </div>
      </section>

      <div className="relative z-[1] -mt-6 min-h-[45vh] rounded-t-[28px] bg-apple-gray px-4 pb-28 pt-8 text-apple-text">
        {tripsLoading ? <p className="text-[15px] text-black/48">正在加载旅行列表…</p> : null}
        {error ? (
          <p className="mb-4 rounded-lg bg-apple-surface px-4 py-3 text-[14px] leading-relaxed text-apple-text">
            {error}
          </p>
        ) : null}

        <div className="mb-2 flex items-end justify-between gap-3">
          <h2 className="text-[21px] font-semibold leading-tight tracking-[-0.02em] text-apple-text">全部旅行</h2>
          <span className="text-[12px] text-black/48">{trips.length} 次</span>
        </div>

        <section className="space-y-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </section>

        {!tripsLoading && trips.length === 0 ? (
          <p className="mt-6 rounded-lg bg-white px-4 py-5 text-[15px] leading-[1.47] text-black/80 shadow-apple-card">
            还没有旅行。点上方「创建新旅行」开始。
          </p>
        ) : null}
      </div>
    </div>
  )
}
