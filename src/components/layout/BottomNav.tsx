import { ClipboardList, Compass, Home, Sun } from 'lucide-react'
import { NavLink, useParams } from 'react-router-dom'

const itemBase =
  'flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-2 text-[11px] font-medium leading-none tracking-[-0.02em] transition-colors sm:flex-row sm:gap-1 sm:text-xs'

export function BottomNav() {
  const { id } = useParams()
  if (!id) return null

  const items = [
    { to: `/trip/${id}`, label: '总览', icon: Home },
    { to: `/trip/${id}/today`, label: '今天', icon: Sun },
    { to: `/trip/${id}/itinerary`, label: '行程', icon: Compass },
    { to: `/trip/${id}/tasks`, label: '清单', icon: ClipboardList },
  ]

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="行程主导航"
    >
      <div
        className="pointer-events-auto flex w-full max-w-md items-stretch gap-0.5 rounded-full bg-black/80 px-1.5 py-1.5 shadow-apple-card backdrop-blur-xl backdrop-saturate-180 supports-[backdrop-filter]:bg-black/72"
        style={{ WebkitBackdropFilter: 'saturate(180%) blur(20px)' }}
      >
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${itemBase} ${
                isActive
                  ? 'bg-apple-blue text-white'
                  : 'text-white/55 hover:bg-white/[0.08] hover:text-white/90'
              }`
            }
          >
            <item.icon size={17} strokeWidth={1.75} className="shrink-0 opacity-95" aria-hidden />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
