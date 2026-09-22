import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { PriorityBadge, MaintenanceStatusBadge } from './StatusBadges';
import { useMaintenanceRequest } from '../../hooks/useMaintenance';
import type { PopulatedRef, StatusEvent } from '../../types';

interface MaintenanceDetailModalProps {
  open: boolean;
  onClose: () => void;
  requestId: string | undefined;
}

function asRef(value: PopulatedRef | string | null | undefined): PopulatedRef | null {
  return value && typeof value === 'object' ? value : null;
}

function timelineEntryLabel(event: StatusEvent): string {
  const labels: Record<StatusEvent['status'], string> = {
    open: 'Opened',
    in_progress: 'Marked in progress',
    resolved: 'Marked resolved',
    closed: 'Closed',
  };
  return labels[event.status] ?? event.status;
}

// Resident's read-only view of a request and its timeline.
export function MaintenanceDetailModal({ open, onClose, requestId }: MaintenanceDetailModalProps) {
  const { data: request, isLoading } = useMaintenanceRequest(open ? requestId : undefined);
  const assignedTo = asRef(request?.assignedTo);

  return (
    <Modal open={open} onClose={onClose} title={request?.title ?? 'Maintenance request'} className="max-w-lg">
      {isLoading || !request ? (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MaintenanceStatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
            <span className="text-xs capitalize text-slate-400">{request.category}</span>
          </div>

          <p className="text-sm text-slate-600">{request.description}</p>

          <p className="text-xs text-slate-500">
            Assigned to: <span className="font-medium text-slate-700">{assignedTo?.name ?? 'Not yet assigned'}</span>
          </p>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Timeline</p>
            <ol className="space-y-3">
              {[...request.statusHistory]
                .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
                .map((event, index) => {
                  const changedBy = asRef(event.changedBy);
                  return (
                    <li key={index} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-900">{timelineEntryLabel(event)}</span>
                        <span className="text-xs text-slate-400">{new Date(event.changedAt).toLocaleString()}</span>
                      </div>
                      {event.note && <p className="mt-0.5 text-slate-600">{event.note}</p>}
                      <p className="mt-0.5 text-xs text-slate-400">by {changedBy?.name ?? 'System'}</p>
                    </li>
                  );
                })}
            </ol>
          </div>
        </div>
      )}
    </Modal>
  );
}
