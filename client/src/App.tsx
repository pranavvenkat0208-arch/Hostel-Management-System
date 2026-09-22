import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { RoomsPage } from './pages/admin/RoomsPage';
import { ResidentsPage } from './pages/admin/ResidentsPage';
import { MyRoomPage } from './pages/resident/MyRoomPage';
import { MaintenancePage } from './pages/maintenance/MaintenancePage';
import { BillingPage } from './pages/billing/BillingPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />

        <Route
          path="/rooms"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <RoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/residents"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <ResidentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-room"
          element={
            <ProtectedRoute allowedRoles={['resident']}>
              <MyRoomPage />
            </ProtectedRoute>
          }
        />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      <Route
        path="/unauthorized"
        element={<div className="p-8 text-slate-600">You don't have access to this page.</div>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
