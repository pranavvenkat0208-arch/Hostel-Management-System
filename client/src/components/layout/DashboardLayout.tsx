import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Spinner } from '../ui/Spinner';
import { useSyncCurrentUser } from '../../hooks/useAuth';

export function DashboardLayout() {
  useSyncCurrentUser();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense
            fallback={
              <div className="flex justify-center py-16">
                <Spinner className="h-6 w-6" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
