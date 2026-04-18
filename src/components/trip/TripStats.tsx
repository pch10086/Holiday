interface TripStatsProps {
  totalItems: number
  doneTasks: number
  totalTasks: number
}

export function TripStats({ totalItems, doneTasks, totalTasks }: TripStatsProps) {
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)
  return (
    <div className="grid grid-cols-3 gap-2">
      <article className="rounded-lg bg-white p-3 text-center shadow-apple-card">
        <p className="text-[11px] font-medium text-black/48">行程项</p>
        <p className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.03em] text-apple-text">{totalItems}</p>
      </article>
      <article className="rounded-lg bg-white p-3 text-center shadow-apple-card">
        <p className="text-[11px] font-medium text-black/48">任务</p>
        <p className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.03em] text-apple-blue">
          {doneTasks}/{totalTasks}
        </p>
      </article>
      <article className="rounded-lg bg-white p-3 text-center shadow-apple-card">
        <p className="text-[11px] font-medium text-black/48">完成度</p>
        <p className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.03em] text-apple-text">{progress}%</p>
      </article>
    </div>
  )
}
