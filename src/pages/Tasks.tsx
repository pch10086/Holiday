import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { TaskItem } from '../components/tasks/TaskItem'
import { TaskProgress } from '../components/tasks/TaskProgress'
import { useConfirm } from '../hooks/useConfirm'
import { useToast } from '../hooks/useToast'
import { useTrip } from '../hooks/useTrip'
import { useTodayView } from '../hooks/useToday'
import type { Task, TaskType } from '../types'

type ManagePhase = 'idle' | 'add' | 'pickEdit' | 'edit' | 'pickDelete'

const emptyForm = { title: '', assignee: '', notes: '' }

const field =
  'mt-1 min-h-11 w-full rounded-[11px] border-[3px] border-black/[0.04] bg-apple-surface px-3 text-[15px] text-apple-text outline-none transition focus-visible:border-apple-blue'

export function TasksPage() {
  const { id = '' } = useParams()
  const confirm = useConfirm()
  const toast = useToast()
  const pickHintRef = useRef<HTMLParagraphElement>(null)
  const { tripDetail, loading, error, toggleTaskStatus, createTask, updateTask, deleteTask } = useTrip(id)
  const { dateStatus } = useTodayView(tripDetail)
  const [tab, setTab] = useState<TaskType>('prep')
  const [managePhase, setManagePhase] = useState<ManagePhase>('idle')
  const [form, setForm] = useState(emptyForm)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    if (managePhase === 'pickEdit' || managePhase === 'pickDelete') {
      pickHintRef.current?.focus()
    }
  }, [managePhase])

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
    return <p className="p-4 text-[15px] text-black/48">加载任务中…</p>
  }
  if (!tripDetail) {
    return <p className="p-4 text-[15px] font-medium text-apple-text">{error ?? '旅行不存在'}</p>
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
    const confirmed = await confirm({
      title: '删除任务',
      message: `确认删除任务「${task.title}」吗？`,
      confirmLabel: '删除',
      cancelLabel: '取消',
    })
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
        ? (t: Task) => {
            void onPickDeleteTask(t)
          }
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
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg bg-apple-blue text-[14px] font-normal text-white transition hover:bg-apple-blue-hover"
          aria-label="新增任务"
        >
          <Plus size={17} strokeWidth={2} /> 新增
        </button>
        <button
          type="button"
          onClick={() => {
            resetManage()
            setManagePhase('pickEdit')
          }}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg border-[3px] border-black/[0.04] bg-apple-surface text-[14px] font-normal text-apple-text transition hover:bg-black/[0.03]"
          aria-label="编辑任务"
        >
          <Pencil size={17} strokeWidth={2} /> 编辑
        </button>
        <button
          type="button"
          onClick={() => {
            resetManage()
            setManagePhase('pickDelete')
          }}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg bg-apple-text text-[14px] font-normal text-white transition hover:opacity-90"
          aria-label="删除任务"
        >
          <Trash2 size={17} strokeWidth={2} /> 删除
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={resetManage}
        className="min-h-11 w-full rounded-lg bg-white text-[15px] font-normal text-apple-text shadow-apple-card transition hover:bg-apple-surface"
      >
        取消操作
      </button>
    )

  return (
    <div className="pb-28">
      <PageHeader title="任务清单" subtitle={tripDetail.trip.title} backTo={`/trip/${id}`} below={toolbar} />
      <main className="mx-auto w-full max-w-md space-y-4 px-4 py-4">
        <TaskProgress done={summary.done} total={summary.total} />

        {beforeStart ? (
          <p className="rounded-[12px] bg-white px-4 py-3 text-[14px] leading-relaxed text-black/80 shadow-apple-card">
            旅行尚未开始，当前不能勾选完成状态。你仍可以先编辑和补充计划内容。
          </p>
        ) : null}

        <section className="flex rounded-[12px] bg-white p-1 shadow-apple-card">
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

        {managePhase === 'pickEdit' || managePhase === 'pickDelete' ? (
          <p
            ref={pickHintRef}
            tabIndex={-1}
            aria-live="polite"
            className={`rounded-lg px-4 py-3 text-[14px] leading-relaxed shadow-apple-card outline-none focus-visible:ring-2 focus-visible:ring-apple-blue ${
              managePhase === 'pickDelete'
                ? 'bg-apple-dark-1 text-white/85'
                : 'bg-white text-black/80'
            }`}
          >
            {managePhase === 'pickEdit' ? '请点击下方要编辑的任务' : '请点击要删除的任务'}
          </p>
        ) : null}

        {showForm ? (
          <form onSubmit={submitTask} className="space-y-3 rounded-[12px] bg-white p-4 shadow-apple-card">
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-apple-text">
              {managePhase === 'edit' ? '编辑任务' : '新增任务'}
            </p>
            <label className="text-[11px] font-medium uppercase tracking-wide text-black/48">
              任务标题
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className={field}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-[11px] font-medium uppercase tracking-wide text-black/48">
                执行人
                <input
                  value={form.assignee}
                  onChange={(event) => setForm((prev) => ({ ...prev, assignee: event.target.value }))}
                  className={field}
                />
              </label>
              <label className="text-[11px] font-medium uppercase tracking-wide text-black/48">
                备注
                <input
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className={field}
                />
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="min-h-11 flex-1 rounded-lg bg-apple-blue text-[15px] font-normal text-white transition hover:bg-apple-blue-hover"
              >
                {managePhase === 'edit' ? '保存' : '保存'}
              </button>
              <button
                type="button"
                onClick={resetManage}
                className="min-h-11 flex-1 rounded-lg border-[3px] border-black/[0.04] bg-apple-surface text-[15px] font-normal text-apple-text transition hover:bg-black/[0.03]"
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
                  toast(err instanceof Error ? err.message : '无法更新任务状态')
                }
              }}
            />
          ))}
          {!currentTasks.length ? (
            <p className="rounded-[12px] bg-white px-4 py-5 text-[14px] leading-relaxed text-black/55 shadow-apple-card">
              该分类暂无任务。
            </p>
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
      className={`min-h-10 flex-1 rounded-[10px] text-[13px] font-medium tracking-[-0.01em] transition ${
        active ? 'bg-apple-text text-white' : 'text-black/55 hover:bg-black/[0.04] hover:text-apple-text'
      }`}
    >
      {label}
    </button>
  )
}
