import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useMyMaintenanceRequests } from '../../hooks/useMaintenance';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { PriorityBadge, MaintenanceStatusBadge } from '../../components/maintenance/StatusBadges';
import { NewMaintenanceRequestModal } from '../../components/maintenance/NewMaintenanceRequestModal';

export function ResidentMaintenanceView() {
  const { data: requests, isLoading } = useMyMaintenanceRequests();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Maintenance requests</h1>
          <p className="text-sm text-slate-500">Report issues with your room and track their progress.</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> New request
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {requests?.map((r) => (
            <Card key={r._id}>
              <CardContent className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-900">{r.title}</p>
                  <MaintenanceStatusBadge status={r.status} />
                </div>
                <p className="text-sm text-slate-500">{r.description}</p>
                <div className="flex items-center gap-2 pt-1">
                  <PriorityBadge priority={r.priority} />
                  <span className="text-xs capitalize text-slate-400">{r.category}</span>
                </div>
                <p className="text-xs text-slate-400">Submitted {new Date(r.createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
          {requests?.length === 0 && (
            <p className="col-span-2 py-10 text-center text-sm text-slate-400">No maintenance requests yet.</p>
          )}
        </div>
      )}

      <NewMaintenanceRequestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
