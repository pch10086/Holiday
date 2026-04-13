import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/Home'
import { ImportPage } from './pages/Import'
import { ItineraryPage } from './pages/Itinerary'
import { TodayPage } from './pages/Today'
import { TripLayout } from './pages/TripLayout'
import { TripOverviewPage } from './pages/TripOverview'
import { TasksPage } from './pages/Tasks'

function App() {
  return (
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
  )
}

export default App
