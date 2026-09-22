import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Unauthorized } from './pages/Unauthorized';
import { Toaster } from './components/ui/Toaster';

// Lazy-loaded pages (they use named exports, hence the .then).
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const RoomsPage = lazy(() => import('./pages/admin/RoomsPage').then((m) => ({ default: m.RoomsPage })));
const ResidentsPage = lazy(() => import('./pages/admin/ResidentsPage').then((m) => ({ default: m.ResidentsPage })));
const UsersPage = lazy(() => import('./pages/admin/UsersPage').then((m) => ({ default: m.UsersPage })));
const ExpensesPage = lazy(() => import('./pages/admin/ExpensesPage').then((m) => ({ default: m.ExpensesPage })));
const MyRoomPage = lazy(() => import('./pages/resident/MyRoomPage').then((m) => ({ default: m.MyRoomPage })));
const MaintenancePage = lazy(() =>
  import('./pages/maintenance/MaintenancePage').then((m) => ({ default: m.MaintenancePage }))
);
const BillingPage = lazy(() => import('./pages/billing/BillingPage').then((m) => ({ default: m.BillingPage })));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const NotificationsPage = lazy(() =>
  import('./pages/notifications/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);

function App() {
  return (
    <>
      <Toaster />
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
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <ExpensesPage />
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
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
