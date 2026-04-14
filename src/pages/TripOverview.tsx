import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { TripStats } from '../components/trip/TripStats'
import { useTrip } from '../hooks/useTrip'

export function TripOverviewPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { tripDetail, loading, error, deleteTrip } = useTrip(id)

  if (loading && !tripDetail) {
    return <p className="p-4 text-sm text-slate-500">加载中...</p>
  }

  if (!tripDetail) {
    return <p className="p-4 text-sm text-red-600">{error ?? '旅行不存在'}</p>
  }

  const doneTasks = tripDetail.tasks.filter((task) => task.completed).length
  const removeTrip = async () => {
    const confirmed = window.confirm(`确认永久删除旅行「${tripDetail.trip.title}」吗？删除后不可恢复。`)
    if (!confirmed) return
    await deleteTrip(id)
    navigate('/')
  }

  return (
    <div className="pb-24">
      <PageHeader title={tripDetail.trip.title} subtitle={tripDetail.trip.destination} backTo="/" />
      <main className="mx-auto w-full max-w-md space-y-4 bg-stone-50 px-4 py-4">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-emerald-700">{tripDetail.trip.destination}</p>
          <h2 className="mt-1 font-serif text-2xl text-emerald-950">
            {tripDetail.trip.coverEmoji} {tripDetail.trip.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {tripDetail.trip.startDate} ~ {tripDetail.trip.endDate}
          </p>
          <p className="mt-1 text-sm text-slate-600">旅伴：{tripDetail.trip.travelers.join('、') || '未填写'}</p>
          <button
            type="button"
            onClick={() => void removeTrip()}
            className="mt-4 min-h-11 w-full rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-700"
          >
            删除本次旅行
          </button>
        </section>

        <TripStats
          totalItems={tripDetail.itineraryItems.length}
          totalTasks={tripDetail.tasks.length}
          doneTasks={doneTasks}
        />

        <section className="grid grid-cols-3 gap-3">
          <QuickEntry to={`/trip/${id}/today`} title="今天" subtitle="快速执行" />
          <QuickEntry to={`/trip/${id}/itinerary`} title="行程" subtitle="按天查看" />
          <QuickEntry to={`/trip/${id}/tasks`} title="清单" subtitle="勾选任务" />
        </section>
      </main>
    </div>
  )
}

interface QuickEntryProps {
  to: string
  title: string
  subtitle: string
}

function QuickEntry({ to, title, subtitle }: QuickEntryProps) {
  return (
    <Link to={to} className="rounded-2xl bg-white p-3 text-center shadow-sm">
      <p className="font-semibold text-emerald-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </Link>
  )
}
