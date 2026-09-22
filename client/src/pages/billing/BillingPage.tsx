import { useAuthStore } from '../../store/authStore';
import { AdminBillingView } from './AdminBillingView';
import { ResidentBillingView } from './ResidentBillingView';

export function BillingPage() {
  const role = useAuthStore((s) => s.user?.role);
  return role === 'resident' ? <ResidentBillingView /> : <AdminBillingView />;
}
