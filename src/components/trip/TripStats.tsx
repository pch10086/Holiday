interface TripStatsProps {
  totalItems: number
  totalTasks: number
  doneTasks: number
}

export function TripStats({ totalItems, totalTasks, doneTasks }: TripStatsProps) {
  const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <section className="grid grid-cols-3 gap-3">
      <article className="rounded-2xl bg-emerald-50 p-3 text-center">
        <p className="text-xs text-emerald-700">行程事项</p>
        <p className="mt-1 text-xl font-semibold text-emerald-950">{totalItems}</p>
      </article>
      <article className="rounded-2xl bg-amber-50 p-3 text-center">
        <p className="text-xs text-amber-700">任务完成</p>
        <p className="mt-1 text-xl font-semibold text-amber-900">
          {doneTasks}/{totalTasks}
        </p>
      </article>
      <article className="rounded-2xl bg-slate-100 p-3 text-center">
        <p className="text-xs text-slate-600">总进度</p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{progress}%</p>
      </article>
    </section>
  )
}
