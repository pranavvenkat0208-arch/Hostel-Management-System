import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useUpdateMaintenanceStatus } from '../../hooks/useMaintenance';
import { getErrorMessage } from '../../lib/utils';
import type { MaintenanceStatus, MaintenanceTicket } from '../../types';

interface UpdateMaintenanceStatusModalProps {
  open: boolean;
  onClose: () => void;
  request: MaintenanceTicket | null;
}

export function UpdateMaintenanceStatusModal({ open, onClose, request }: UpdateMaintenanceStatusModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={request ? `Update status: ${request.title}` : 'Update status'}>
      {request && <UpdateStatusForm key={request._id} request={request} onClose={onClose} />}
    </Modal>
  );
}

function UpdateStatusForm({ request, onClose }: { request: MaintenanceTicket; onClose: () => void }) {
  const updateStatus = useUpdateMaintenanceStatus();
  const [status, setStatus] = useState<MaintenanceStatus>(request.status);
  const [note, setNote] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateStatus.mutate({ id: request._id, status, note: note || undefined }, { onSuccess: onClose });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          rows={3}
          placeholder="What changed, or what the resident should know…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {updateStatus.isError && <p className="text-sm text-red-600">{getErrorMessage(updateStatus.error)}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={updateStatus.isPending}>
          {updateStatus.isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
