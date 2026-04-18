import { Check, MapPin } from 'lucide-react'
import type { ItineraryItem as ItineraryItemType } from '../../types'

export type ItinerarySelectMode = 'edit' | 'delete'

interface ItineraryItemProps {
  item: ItineraryItemType
  highlight?: boolean
  onToggleComplete?: (item: ItineraryItemType, completed: boolean) => void
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
      className={`flex gap-3 rounded-[12px] bg-white p-3 shadow-apple-card transition ${
        highlight && !done ? 'ring-2 ring-apple-blue/35 ring-offset-2 ring-offset-apple-gray' : ''
      } ${done ? 'opacity-[0.92]' : ''} ${
        picking
          ? selectMode === 'delete'
            ? 'cursor-pointer ring-2 ring-apple-text/20 ring-offset-2 ring-offset-apple-gray'
            : 'cursor-pointer ring-2 ring-apple-blue/30 ring-offset-2 ring-offset-apple-gray'
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
          className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[2px] ${
            disabled
              ? 'cursor-not-allowed border-black/[0.08] bg-apple-surface text-black/35'
              : done
                ? 'border-apple-blue bg-apple-blue text-white'
                : 'border-black/[0.12] bg-white text-transparent'
          }`}
          onClick={(e) => {
            e.stopPropagation()
            if (!disabled) onToggleComplete(item, !done)
          }}
          aria-label={done ? '标记未完成' : '标记已完成'}
          disabled={disabled}
        >
          {done ? <Check size={14} strokeWidth={2.5} /> : null}
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-apple-text px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">
            {item.time}
          </span>
          <h4
            className={`text-[15px] font-semibold leading-snug tracking-[-0.02em] ${
              done ? 'text-black/45 line-through' : 'text-apple-text'
            }`}
          >
            {item.title}
          </h4>
        </div>
        {item.location ? (
          <p className={`mb-1 flex items-center gap-1 text-[14px] leading-snug ${done ? 'text-black/40' : 'text-black/70'}`}>
            <MapPin size={14} className="shrink-0 opacity-60" aria-hidden /> {item.location}
          </p>
        ) : null}
        {item.notes ? (
          <p className={`text-[12px] leading-relaxed tracking-[-0.01em] ${done ? 'text-black/40' : 'text-black/48'}`}>
            {item.notes}
          </p>
        ) : null}
      </div>
    </article>
  )
}
