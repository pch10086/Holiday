import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { TaskItem } from '../components/tasks/TaskItem'
import { TaskProgress } from '../components/tasks/TaskProgress'
import { useTrip } from '../hooks/useTrip'
import type { TaskType } from '../types'

export function TasksPage() {
  const { id = '' } = useParams()
  const { tripDetail, loading, error, toggleTaskStatus } = useTrip(id)
  const [tab, setTab] = useState<TaskType>('prep')

  const summary = useMemo(() => {
    if (!tripDetail) return { done: 0, total: 0 }
    const total = tripDetail.tasks.length
    const done = tripDetail.tasks.filter((task) => task.completed).length
    return { done, total }
  }, [tripDetail])

  if (loading && !tripDetail) {
    return <p className="p-4 text-sm text-slate-500">加载任务中...</p>
  }
  if (!tripDetail) {
    return <p className="p-4 text-sm text-red-600">{error ?? '旅行不存在'}</p>
  }

  const currentTasks = tripDetail.tasks.filter((task) => task.type === tab)

  return (
    <div className="pb-24">
      <PageHeader title="任务清单" subtitle={tripDetail.trip.title} backTo={`/trip/${id}`} />
      <main className="mx-auto w-full max-w-md space-y-4 bg-stone-50 px-4 py-4">
        <TaskProgress done={summary.done} total={summary.total} />

        <section className="flex rounded-2xl bg-white p-1">
          <TabButton current={tab} value="prep" label="出发前准备" onClick={setTab} />
          <TabButton current={tab} value="travel" label="途中任务" onClick={setTab} />
        </section>

        <section className="space-y-2">
          {currentTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={(currentTask, completed) => void toggleTaskStatus(id, currentTask.id, completed)}
            />
          ))}
          {!currentTasks.length ? (
            <p className="rounded-xl bg-white p-4 text-sm text-slate-600">该分类暂无任务。</p>
          ) : null}
        </section>
      </main>
    </div>
  )
}

interface TabButtonProps {
  current: TaskType
  value: TaskType
  label: string
  onClick: (value: TaskType) => void
}

function TabButton({ current, value, label, onClick }: TabButtonProps) {
  const active = current === value
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`min-h-11 flex-1 rounded-xl text-sm ${active ? 'bg-emerald-900 text-white' : 'text-emerald-800'}`}
    >
      {label}
    </button>
  )
}
