import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { TripCard } from '../components/trip/TripCard'
import { useTripStore } from '../store/tripStore'

export function HomePage() {
  const { trips, loading, error, fetchTrips } = useTripStore()

  useEffect(() => {
    void fetchTrips()
  }, [fetchTrips])

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-4 pb-24 pt-8">
      <header className="mb-6">
        <p className="text-sm text-emerald-700">Holiday · 旅行执行面板</p>
        <h1 className="font-serif text-3xl font-semibold text-emerald-950">我的旅行</h1>
      </header>

      <Link
        to="/trip/new"
        className="mb-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-900 px-4 py-3 text-sm font-medium text-white"
      >
        <Plus size={18} className="mr-2" /> 创建新旅行
      </Link>

      {loading ? <p className="text-sm text-slate-500">正在加载旅行列表...</p> : null}
      {error ? <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <section className="space-y-3">
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
        {!loading && trips.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-sm text-slate-600">还没有旅行，点击上方按钮创建一个。</p>
        ) : null}
      </section>
    </main>
  )
}
