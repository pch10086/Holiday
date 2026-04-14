import { Check } from 'lucide-react'
import type { Task } from '../../types'

export type TaskSelectMode = 'edit' | 'delete'

interface TaskItemProps {
  task: Task
  onToggle: (task: Task, completed: boolean) => void
  disabled?: boolean
  selectMode?: TaskSelectMode | null
  onTaskSelect?: (task: Task) => void
}

export function TaskItem({ task, onToggle, disabled, selectMode, onTaskSelect }: TaskItemProps) {
  const picking = Boolean(selectMode && onTaskSelect)

  return (
    <article
      className={`flex items-start gap-3 rounded-2xl border border-emerald-100 bg-white p-3 transition ${
        picking
          ? selectMode === 'delete'
            ? 'cursor-pointer ring-2 ring-red-200 ring-offset-1 hover:bg-red-50/40'
            : 'cursor-pointer ring-2 ring-emerald-200 ring-offset-1 hover:bg-emerald-50/50'
          : ''
      }`}
      onClick={picking ? () => onTaskSelect?.(task) : undefined}
      role={picking ? 'button' : undefined}
      onKeyDown={
        picking
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onTaskSelect?.(task)
              }
            }
          : undefined
      }
      tabIndex={picking ? 0 : undefined}
    >
      <button
        type="button"
        className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          disabled
            ? 'cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400'
            : task.completed
              ? 'border-emerald-900 bg-emerald-900 text-white'
              : 'border-emerald-300'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled) onToggle(task, !task.completed)
        }}
        aria-label={task.completed ? '标记未完成' : '标记完成'}
        disabled={disabled}
      >
        {task.completed ? <Check size={14} /> : null}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`${task.completed ? 'text-slate-400 line-through' : 'text-emerald-950'} text-sm`}>
          {task.title}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {task.assignee ? `执行人：${task.assignee}` : '未指定执行人'}
          {task.updatedBy ? ` · 更新者：${task.updatedBy}` : ''}
        </p>
      </div>
    </article>
  )
}
