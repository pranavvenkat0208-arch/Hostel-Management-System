import { useAuthStore } from '../../store/authStore';
import { ResidentMaintenanceView } from './ResidentMaintenanceView';
import { StaffMaintenanceView } from './StaffMaintenanceView';

export function MaintenancePage() {
  const role = useAuthStore((s) => s.user?.role);
  return role === 'resident' ? <ResidentMaintenanceView /> : <StaffMaintenanceView />;
}
