import { useMemo } from 'react'
import { Clock4 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { ItineraryItem } from '../components/itinerary/ItineraryItem'
import { PageHeader } from '../components/layout/PageHeader'
import { useTrip } from '../hooks/useTrip'
import { useTodayView } from '../hooks/useToday'

export function TodayPage() {
  const { id = '' } = useParams()
  const { tripDetail, loading, error, toggleItineraryItemComplete } = useTrip(id)
  const { todayDay, todayItems, pendingTasks, progress, dateStatus } = useTodayView(tripDetail)

  const nextItemId = useMemo(() => {
    const now = new Date().toTimeString().slice(0, 5)
    return todayItems.find((item) => !item.completed && item.time >= now)?.id
  }, [todayItems])

  if (loading && !tripDetail) {
    return <p className="p-4 text-sm text-slate-500">加载今天数据...</p>
  }
  if (!tripDetail) {
    return <p className="p-4 text-sm text-red-600">{error ?? '旅行不存在'}</p>
  }

  const beforeStart = dateStatus === 'beforeStart'

  return (
    <div className="pb-24">
      <PageHeader title="今天" subtitle={tripDetail.trip.title} backTo={`/trip/${id}`} />
      <main className="mx-auto w-full max-w-md space-y-4 bg-stone-50 px-4 py-4">
        {beforeStart ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            旅行尚未开始（出发日 {tripDetail.trip.startDate}）。当前展示第一天预览；今日行程与清单均暂不可勾选完成，可在「行程」「清单」页继续编辑计划。
          </p>
        ) : null}
        {dateStatus === 'afterEnd' ? (
          <p className="rounded-xl border border-slate-200 bg-slate-100 p-3 text-sm text-slate-700">
            本次旅行已结束（结束日 {tripDetail.trip.endDate}）。当前展示最后一天行程回顾。
          </p>
        ) : null}
        <section className="rounded-2xl bg-emerald-900 p-4 text-white shadow-sm">
          <p className="text-sm text-emerald-100">{todayDay?.title ?? '未匹配到今天行程'}</p>
          <h2 className="mt-1 text-xl font-semibold">今日进度 {progress}%</h2>
          <p className="mt-2 text-xs text-emerald-100">还有 {pendingTasks.length} 项任务待完成</p>
        </section>

        <section className="rounded-2xl bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 font-medium text-emerald-950">
            <Clock4 size={16} /> 今天的行程
          </h3>
          <div className="space-y-2">
            {todayItems.map((item) => (
              <ItineraryItem
                key={item.id}
                item={item}
                highlight={item.id === nextItemId}
                disabled={beforeStart}
                onToggleComplete={(it, completed) => void toggleItineraryItemComplete(id, it.id, completed)}
              />
            ))}
            {!todayItems.length ? <p className="text-sm text-slate-600">今天暂无行程安排。</p> : null}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4">
          <h3 className="mb-2 font-medium text-emerald-950">今天未完成任务</h3>
          <div className="space-y-2">
            {pendingTasks.slice(0, 5).map((task) => (
              <p key={task.id} className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                {task.title}
              </p>
            ))}
            {!pendingTasks.length ? <p className="text-sm text-emerald-700">太棒了，全部任务已完成。</p> : null}
          </div>
        </section>
      </main>
    </div>
  )
}
