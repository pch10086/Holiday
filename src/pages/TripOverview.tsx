import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TripStats } from '../components/trip/TripStats'
import { useTrip } from '../hooks/useTrip'

export function TripOverviewPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { tripDetail, loading, error, deleteTrip } = useTrip(id)

  if (loading && !tripDetail) {
    return (
      <div className="min-h-dvh bg-apple-gray px-4 py-8">
        <p className="text-[15px] text-black/48">加载中…</p>
      </div>
    )
  }

  if (!tripDetail) {
    return (
      <div className="min-h-dvh bg-apple-gray px-4 py-8">
        <p className="text-[15px] font-medium text-apple-text">{error ?? '旅行不存在'}</p>
      </div>
    )
  }

  const doneTasks = tripDetail.tasks.filter((task) => task.completed).length
  const removeTrip = async () => {
    const confirmed = window.confirm(`确认永久删除旅行「${tripDetail.trip.title}」吗？删除后不可恢复。`)
    if (!confirmed) return
    await deleteTrip(id)
    navigate('/')
  }

  const t = tripDetail.trip

  return (
    <div className="pb-28">
      <section className="bg-apple-black px-5 pb-20 pt-[max(0.75rem,env(safe-area-inset-top))] text-white">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-8 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.12] text-white transition hover:bg-white/[0.2]"
          aria-label="返回"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <p className="text-[12px] font-medium tracking-wide text-white/48">概览</p>
        <h1 className="mt-2 text-[clamp(1.75rem,8vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
          <span className="mr-2">{t.coverEmoji}</span>
          {t.title}
        </h1>
        <p className="mt-3 text-[17px] leading-[1.47] tracking-[-0.02em] text-white/72">{t.destination}</p>
        <p className="mt-2 text-[14px] leading-snug text-white/48">
          {t.startDate} — {t.endDate}
        </p>
        <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-white/55">
          旅伴：{t.travelers.join('、') || '未填写'}
        </p>
        <Link
          to={`/trip/${id}/today`}
          className="mt-10 inline-flex min-h-11 items-center justify-center rounded-lg bg-apple-blue px-5 text-[17px] font-normal text-white transition hover:bg-apple-blue-hover"
        >
          进入今天
        </Link>
      </section>

      <div className="relative z-[1] -mt-10 mx-auto max-w-md rounded-t-[24px] bg-apple-gray px-4 pb-8 pt-6 text-apple-text">
        <TripStats
          totalItems={tripDetail.itineraryItems.length}
          totalTasks={tripDetail.tasks.length}
          doneTasks={doneTasks}
        />

        <h2 className="mb-3 mt-8 text-[12px] font-semibold uppercase tracking-[0.08em] text-black/48">快捷入口</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to={`/trip/${id}/today`}
            className="col-span-2 flex min-h-[108px] flex-col justify-between rounded-[12px] bg-apple-blue p-4 text-white shadow-apple-card transition hover:bg-apple-blue-hover"
          >
            <span className="text-[12px] font-medium text-white/75">今日</span>
            <span className="text-[28px] font-semibold leading-none tracking-[-0.03em]">今天</span>
            <span className="text-[14px] text-white/75">行程与进度</span>
          </Link>
          <Link
            to={`/trip/${id}/itinerary`}
            className="flex min-h-[100px] flex-col justify-between rounded-[12px] bg-white p-4 shadow-apple-card transition hover:opacity-95"
          >
            <span className="text-[21px] font-semibold leading-tight tracking-[-0.02em]">行程</span>
            <span className="text-[12px] text-black/48">按天查看</span>
          </Link>
          <Link
            to={`/trip/${id}/tasks`}
            className="flex min-h-[100px] flex-col justify-between rounded-[12px] bg-white p-4 shadow-apple-card transition hover:opacity-95"
          >
            <span className="text-[21px] font-semibold leading-tight tracking-[-0.02em]">清单</span>
            <span className="text-[12px] text-black/48">任务勾选</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => void removeTrip()}
          className="mt-10 w-full text-center text-[12px] text-black/48 underline decoration-black/25 underline-offset-4 transition hover:text-apple-text"
        >
          删除本次旅行
        </button>
      </div>
    </div>
  )
}
