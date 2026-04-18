interface TaskProgressProps {
  done: number
  total: number
}

export function TaskProgress({ done, total }: TaskProgressProps) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <section className="rounded-[12px] bg-apple-black px-4 py-5 text-white shadow-apple-card">
      <p className="text-[12px] font-medium text-white/48">任务总进度</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-apple-blue transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-3 text-[28px] font-semibold tabular-nums leading-none tracking-[-0.04em]">{percent}%</p>
      <p className="mt-1 text-[12px] text-white/48">
        {done} / {total} 已完成
      </p>
    </section>
  )
}
