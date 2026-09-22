import { History } from 'lucide-react';
import { useAllocationHistory } from '../../hooks/useAllocations';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';
import type { AllocationRef } from '../../types';

interface AllocationHistoryModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  // Pass one of residentId / roomId.
  residentId?: string;
  roomId?: string;
}

function asRef(value: AllocationRef | string | undefined): AllocationRef | null {
  return value && typeof value === 'object' ? value : null;
}

export function AllocationHistoryModal({ open, onClose, title, residentId, roomId }: AllocationHistoryModalProps) {
  const { data: allocations, isLoading } = useAllocationHistory({ residentId, roomId }, { enabled: open });

  const showResident = Boolean(roomId);
  const showRoom = Boolean(residentId);

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-lg">
      {isLoading ? (
        <div className="flex justify-center p-6">
          <Spinner />
        </div>
      ) : allocations && allocations.length > 0 ? (
        <ul className="max-h-96 space-y-3 overflow-y-auto">
          {allocations.map((a) => {
            const resident = asRef(a.resident);
            const room = asRef(a.room);
            const allocatedBy = asRef(a.allocatedBy);
            return (
              <li key={a._id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {showRoom && <p className="font-medium text-slate-900">Room {room?.roomNumber ?? '—'}</p>}
                    {showResident && <p className="font-medium text-slate-900">{resident?.name ?? '—'}</p>}
                    <p className="text-xs text-slate-500">
                      {new Date(a.checkInDate).toLocaleDateString()}
                      {' → '}
                      {a.checkOutDate ? new Date(a.checkOutDate).toLocaleDateString() : 'present'}
                    </p>
                  </div>
                  <Badge variant={a.status === 'active' ? 'success' : 'default'}>
                    {a.status === 'active' ? 'Current' : 'Ended'}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Allocated by {allocatedBy?.name ?? '—'}
                  {a.notes ? ` · ${a.notes}` : ''}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-slate-400">
          <History className="h-5 w-5" />
          No allocation history yet.
        </div>
      )}
    </Modal>
  );
}
