import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import PublicOnlyRoute from '@/components/common/PublicOnlyRoute'
import AppShell from '@/components/common/AppShell'
import RootRedirect from '@/pages/RootRedirect'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ExplorePage from '@/pages/commuter/ExplorePage'
import PredictPage from '@/pages/commuter/PredictPage'
import CommuterAddRoutePage from '@/pages/commuter/AddRoutePage'
import EditCommuterRoutePage from '@/pages/commuter/EditRoutePage'
import DriverHomePage from '@/pages/driver/DriverHomePage'
import DriverAddRoutePage from '@/pages/driver/AddRoutePage'
import EditRoutePage from '@/pages/driver/EditRoutePage'
import ProfilePage from '@/pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/login"  element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />

        {/* ── Commuter ─────────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute requiredRole="commuter"><AppShell /></ProtectedRoute>}>
          <Route path="/explore"            element={<ExplorePage />} />
          <Route path="/predict"            element={<PredictPage />} />
          <Route path="/commuter/add-route" element={<CommuterAddRoutePage />} />
          <Route path="/commuter/edit-route/:id" element={<EditCommuterRoutePage />} />
          <Route path="/profile"            element={<ProfilePage />} />
        </Route>

        {/* ── Driver ───────────────────────────────────────────────────── */}
        {/* Profile lives at /driver/profile to avoid colliding with      */}
        {/* the commuter /profile route guard above.                       */}
        <Route element={<ProtectedRoute requiredRole="driver"><AppShell /></ProtectedRoute>}>
          <Route path="/driver"                    element={<DriverHomePage />} />
          <Route path="/driver/add-route"          element={<DriverAddRoutePage />} />
          <Route path="/driver/edit-route/:id"     element={<EditRoutePage />} />
          <Route path="/driver/profile"            element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
