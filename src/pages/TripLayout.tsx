import { Outlet } from 'react-router-dom'
import { BottomNav } from '../components/layout/BottomNav'

export function TripLayout() {
  return (
    <div className="min-h-dvh bg-apple-gray text-apple-text antialiased">
      <Outlet />
      <BottomNav />
    </div>
  )
}
