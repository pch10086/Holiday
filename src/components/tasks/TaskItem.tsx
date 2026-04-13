import { Check } from 'lucide-react'
import type { Task } from '../../types'

interface TaskItemProps {
  task: Task
  onToggle: (task: Task, completed: boolean) => void
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <article className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-white p-3">
      <button
        type="button"
        className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          task.completed ? 'border-emerald-900 bg-emerald-900 text-white' : 'border-emerald-300'
        }`}
        onClick={() => onToggle(task, !task.completed)}
        aria-label={task.completed ? '标记未完成' : '标记完成'}
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
