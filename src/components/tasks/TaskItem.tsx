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
      className={`flex items-start gap-3 rounded-[12px] bg-white p-3 shadow-apple-card transition ${
        picking
          ? selectMode === 'delete'
            ? 'cursor-pointer ring-2 ring-apple-text/20 ring-offset-2 ring-offset-apple-gray'
            : 'cursor-pointer ring-2 ring-apple-blue/30 ring-offset-2 ring-offset-apple-gray'
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
        className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[2px] ${
          disabled
            ? 'cursor-not-allowed border-black/[0.08] bg-apple-surface text-black/35'
            : task.completed
              ? 'border-apple-blue bg-apple-blue text-white'
              : 'border-black/[0.12] bg-white text-transparent'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled) onToggle(task, !task.completed)
        }}
        aria-label={task.completed ? '标记未完成' : '标记完成'}
        disabled={disabled}
      >
        {task.completed ? <Check size={13} strokeWidth={2.5} /> : null}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={`text-[15px] font-semibold leading-snug tracking-[-0.02em] ${
            task.completed ? 'text-black/45 line-through' : 'text-apple-text'
          }`}
        >
          {task.title}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed tracking-[-0.01em] text-black/48">
          {task.assignee ? `执行人：${task.assignee}` : '未指定执行人'}
          {task.updatedBy ? ` · ${task.updatedBy}` : ''}
        </p>
      </div>
    </article>
  )
}
