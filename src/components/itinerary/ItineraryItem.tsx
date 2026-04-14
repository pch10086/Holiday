import { Check, MapPin } from 'lucide-react'
import type { ItineraryItem as ItineraryItemType } from '../../types'

export type ItinerarySelectMode = 'edit' | 'delete'

interface ItineraryItemProps {
  item: ItineraryItemType
  highlight?: boolean
  onToggleComplete?: (item: ItineraryItemType, completed: boolean) => void
  /** 与清单页一致：旅行未开始等场景下禁止勾选完成 */
  disabled?: boolean
  selectMode?: ItinerarySelectMode | null
  onItemSelect?: (item: ItineraryItemType) => void
}

export function ItineraryItem({
  item,
  highlight,
  onToggleComplete,
  disabled = false,
  selectMode,
  onItemSelect,
}: ItineraryItemProps) {
  const done = item.completed
  const picking = Boolean(selectMode && onItemSelect)

  return (
    <article
      className={`flex gap-2 rounded-2xl border p-3 transition ${
        highlight && !done ? 'border-amber-300 bg-amber-50' : 'border-emerald-100 bg-white'
      } ${done ? 'opacity-90' : ''} ${
        picking
          ? selectMode === 'delete'
            ? 'cursor-pointer ring-2 ring-red-200 ring-offset-1 hover:bg-red-50/40'
            : 'cursor-pointer ring-2 ring-emerald-200 ring-offset-1 hover:bg-emerald-50/50'
          : ''
      }`}
      onClick={picking ? () => onItemSelect?.(item) : undefined}
      role={picking ? 'button' : undefined}
      onKeyDown={
        picking
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onItemSelect?.(item)
              }
            }
          : undefined
      }
      tabIndex={picking ? 0 : undefined}
    >
      {onToggleComplete ? (
        <button
          type="button"
          className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
            disabled
              ? 'cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400'
              : done
                ? 'border-emerald-900 bg-emerald-900 text-white'
                : 'border-emerald-300'
          }`}
          onClick={(e) => {
            e.stopPropagation()
            if (!disabled) onToggleComplete(item, !done)
          }}
          aria-label={done ? '标记未完成' : '标记已完成'}
          disabled={disabled}
        >
          {done ? <Check size={14} /> : null}
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-900 px-2 py-1 text-xs font-semibold text-white">
            {item.time}
          </span>
          <h4 className={`font-medium ${done ? 'text-slate-400 line-through' : 'text-emerald-950'}`}>
            {item.title}
          </h4>
        </div>
        {item.location ? (
          <p
            className={`mb-1 flex items-center gap-1 text-sm ${
              done ? 'text-slate-400' : 'text-emerald-700'
            }`}
          >
            <MapPin size={14} /> {item.location}
          </p>
        ) : null}
        {item.notes ? (
          <p className={`text-xs ${done ? 'text-slate-400' : 'text-slate-600'}`}>{item.notes}</p>
        ) : null}
      </div>
    </article>
  )
}
