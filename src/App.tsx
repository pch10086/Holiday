import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const HomePage = lazy(() => import('./pages/Home').then((m) => ({ default: m.HomePage })))
const ImportPage = lazy(() => import('./pages/Import').then((m) => ({ default: m.ImportPage })))
const TripLayout = lazy(() => import('./pages/TripLayout').then((m) => ({ default: m.TripLayout })))
const TripOverviewPage = lazy(() => import('./pages/TripOverview').then((m) => ({ default: m.TripOverviewPage })))
const TodayPage = lazy(() => import('./pages/Today').then((m) => ({ default: m.TodayPage })))
const ItineraryPage = lazy(() => import('./pages/Itinerary').then((m) => ({ default: m.ItineraryPage })))
const TasksPage = lazy(() => import('./pages/Tasks').then((m) => ({ default: m.TasksPage })))

function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-apple-gray text-[15px] text-black/48">
      加载中…
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trip/new" element={<ImportPage />} />
        <Route path="/trip/:id" element={<TripLayout />}>
          <Route index element={<TripOverviewPage />} />
          <Route path="today" element={<TodayPage />} />
          <Route path="itinerary" element={<ItineraryPage />} />
          <Route path="tasks" element={<TasksPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
