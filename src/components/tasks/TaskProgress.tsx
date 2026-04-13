interface TaskProgressProps {
  done: number
  total: number
}

export function TaskProgress({ done, total }: TaskProgressProps) {
  const percent = total ? Math.round((done / total) * 100) : 0
  return (
    <section className="rounded-2xl bg-emerald-950 p-4 text-white">
      <div className="mb-2 flex items-center justify-between text-sm">
        <p>任务进度</p>
        <p>
          {done}/{total}
        </p>
      </div>
      <div className="h-2 rounded-full bg-white/20">
        <div className="h-2 rounded-full bg-amber-300 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-emerald-100">已完成 {percent}%</p>
    </section>
  )
}
