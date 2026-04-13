import { ClipboardList, Compass, Home, Sun } from 'lucide-react'
import { NavLink, useParams } from 'react-router-dom'

const baseClass =
  'flex min-h-12 flex-1 items-center justify-center rounded-xl text-sm font-medium transition'

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
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md border-t border-emerald-100 bg-white p-3">
      <div className="flex gap-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${baseClass} ${isActive ? 'bg-emerald-900 text-white' : 'bg-emerald-50 text-emerald-800'}`
            }
          >
            <item.icon size={16} className="mr-1.5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
