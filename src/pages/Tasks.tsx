import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { TaskItem } from '../components/tasks/TaskItem'
import { TaskProgress } from '../components/tasks/TaskProgress'
import { useTrip } from '../hooks/useTrip'
import { useTodayView } from '../hooks/useToday'
import type { Task, TaskType } from '../types'

type ManagePhase = 'idle' | 'add' | 'pickEdit' | 'edit' | 'pickDelete'

const emptyForm = { title: '', assignee: '', notes: '' }

export function TasksPage() {
  const { id = '' } = useParams()
  const { tripDetail, loading, error, toggleTaskStatus, createTask, updateTask, deleteTask } = useTrip(id)
  const { dateStatus } = useTodayView(tripDetail)
  const [tab, setTab] = useState<TaskType>('prep')
  const [managePhase, setManagePhase] = useState<ManagePhase>('idle')
  const [form, setForm] = useState(emptyForm)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const summary = useMemo(() => {
    if (!tripDetail) return { done: 0, total: 0 }
    const total = tripDetail.tasks.length
    const done = tripDetail.tasks.filter((task) => task.completed).length
    return { done, total }
  }, [tripDetail])

  const resetManage = () => {
    setManagePhase('idle')
    setEditingTask(null)
    setForm(emptyForm)
  }

  if (loading && !tripDetail) {
    return <p className="p-4 text-sm text-slate-500">加载任务中...</p>
  }
  if (!tripDetail) {
    return <p className="p-4 text-sm text-red-600">{error ?? '旅行不存在'}</p>
  }

  const beforeStart = dateStatus === 'beforeStart'
  const currentTasks = tripDetail.tasks.filter((task) => task.type === tab)

  const submitTask = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.title.trim()) return
    if (editingTask) {
      await updateTask(id, editingTask.id, {
        title: form.title.trim(),
        type: tab,
        assignee: form.assignee.trim() || undefined,
        notes: form.notes.trim() || undefined,
        updatedBy: '旅伴',
      })
    } else {
      await createTask(id, {
        title: form.title.trim(),
        type: tab,
        assignee: form.assignee.trim() || undefined,
        notes: form.notes.trim() || undefined,
        updatedBy: '旅伴',
      })
    }
    resetManage()
  }

  const onPickEditTask = (task: Task) => {
    setEditingTask(task)
    setTab(task.type)
    setForm({
      title: task.title,
      assignee: task.assignee ?? '',
      notes: task.notes ?? '',
    })
    setManagePhase('edit')
  }

  const onPickDeleteTask = async (task: Task) => {
    const confirmed = window.confirm(`确认删除任务「${task.title}」吗？`)
    if (!confirmed) return
    await deleteTask(id, task.id)
    resetManage()
  }

  const selectMode =
    managePhase === 'pickEdit' ? 'edit' : managePhase === 'pickDelete' ? 'delete' : null
  const onTaskSelect =
    managePhase === 'pickEdit'
      ? onPickEditTask
      : managePhase === 'pickDelete'
        ? (t: Task) => void onPickDeleteTask(t)
        : undefined

  const showForm = managePhase === 'add' || managePhase === 'edit'

  const toolbar =
    managePhase === 'idle' ? (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            resetManage()
            setManagePhase('add')
          }}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-900 text-sm font-medium text-white"
          aria-label="新增任务"
        >
          <Plus size={18} /> 新增
        </button>
        <button
          type="button"
          onClick={() => {
            resetManage()
            setManagePhase('pickEdit')
          }}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl border border-emerald-200 bg-white text-sm font-medium text-emerald-800"
          aria-label="编辑任务"
        >
          <Pencil size={18} /> 编辑
        </button>
        <button
          type="button"
          onClick={() => {
            resetManage()
            setManagePhase('pickDelete')
          }}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-700"
          aria-label="删除任务"
        >
          <Trash2 size={18} /> 删除
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={resetManage}
        className="min-h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700"
      >
        取消操作
      </button>
    )

  return (
    <div className="pb-24">
      <PageHeader title="任务清单" subtitle={tripDetail.trip.title} backTo={`/trip/${id}`} below={toolbar} />
      <main className="mx-auto w-full max-w-md space-y-4 bg-stone-50 px-4 py-4">
        <TaskProgress done={summary.done} total={summary.total} />

        {beforeStart ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            旅行尚未开始，当前不能勾选完成状态。你仍可以先编辑和补充计划内容。
          </p>
        ) : null}

        <section className="flex rounded-2xl bg-white p-1">
          <TabButton
            current={tab}
            value="prep"
            label="出发前准备"
            onClick={(value) => {
              setTab(value)
              if (managePhase === 'pickEdit' || managePhase === 'pickDelete') resetManage()
            }}
          />
          <TabButton
            current={tab}
            value="travel"
            label="途中任务"
            onClick={(value) => {
              setTab(value)
              if (managePhase === 'pickEdit' || managePhase === 'pickDelete') resetManage()
            }}
          />
        </section>

        {managePhase === 'pickEdit' ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            请点击下方要编辑的任务
          </p>
        ) : null}
        {managePhase === 'pickDelete' ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            请点击要删除的任务
          </p>
        ) : null}

        {showForm ? (
          <form onSubmit={submitTask} className="space-y-2 rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-sm font-medium text-emerald-950">
              {managePhase === 'edit' ? '编辑任务' : '新增任务'}
            </p>
            <label className="text-xs text-slate-600">
              任务标题
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="mt-1 min-h-11 w-full rounded-xl border border-emerald-200 px-3 text-sm"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-slate-600">
                执行人
                <input
                  value={form.assignee}
                  onChange={(event) => setForm((prev) => ({ ...prev, assignee: event.target.value }))}
                  className="mt-1 min-h-11 w-full rounded-xl border border-emerald-200 px-3 text-sm"
                />
              </label>
              <label className="text-xs text-slate-600">
                备注
                <input
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className="mt-1 min-h-11 w-full rounded-xl border border-emerald-200 px-3 text-sm"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="min-h-11 flex-1 rounded-xl bg-emerald-900 text-sm font-medium text-white">
                {managePhase === 'edit' ? '保存修改' : '保存新增'}
              </button>
              <button
                type="button"
                onClick={resetManage}
                className="min-h-11 flex-1 rounded-xl border border-emerald-200 text-sm text-emerald-800"
              >
                取消
              </button>
            </div>
          </form>
        ) : null}

        <section className="space-y-2">
          {currentTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              disabled={beforeStart}
              selectMode={selectMode}
              onTaskSelect={onTaskSelect}
              onToggle={async (currentTask, completed) => {
                try {
                  await toggleTaskStatus(id, currentTask.id, completed)
                } catch (err) {
                  window.alert(err instanceof Error ? err.message : '无法更新任务状态')
                }
              }}
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
