import { useAuthStore } from '../store/authStore';
import { AdminStaffOverview } from './dashboard/AdminStaffOverview';
import { ResidentOverview } from './dashboard/ResidentOverview';

export function Dashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome, {user?.name}</h1>
        <p className="text-sm capitalize text-slate-500">{user?.role} dashboard</p>
      </div>

      {user?.role === 'resident' ? <ResidentOverview /> : <AdminStaffOverview />}
    </div>
  );
}
