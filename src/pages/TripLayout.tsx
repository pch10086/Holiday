import { Outlet } from 'react-router-dom'
import { BottomNav } from '../components/layout/BottomNav'

export function TripLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}
