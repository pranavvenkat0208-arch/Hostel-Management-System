import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Label } from '../ui/Label';
import { useRooms } from '../../hooks/useRooms';
import { useAllocateRoom, useChangeRoom } from '../../hooks/useAllocations';
import { getErrorMessage } from '../../lib/utils';
import type { Resident } from '../../types';

interface AllocateRoomModalProps {
  open: boolean;
  onClose: () => void;
  resident: Resident | null;
  mode: 'allocate' | 'change';
}

export function AllocateRoomModal({ open, onClose, resident, mode }: AllocateRoomModalProps) {
  const { data: rooms } = useRooms({ availability: 'available' });
  const allocate = useAllocateRoom();
  const change = useChangeRoom();
  const [roomId, setRoomId] = useState('');

  const mutation = mode === 'allocate' ? allocate : change;
  const availableRooms = (rooms ?? []).filter((r) => r._id !== resident?.currentRoom?._id);

  function close() {
    setRoomId('');
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!resident || !roomId) return;

    if (mode === 'allocate') {
      allocate.mutate({ residentId: resident._id, roomId }, { onSuccess: close });
    } else {
      change.mutate({ residentId: resident._id, newRoomId: roomId }, { onSuccess: close });
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={mode === 'allocate' ? `Allocate a room to ${resident?.name}` : `Move ${resident?.name} to a new room`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {resident?.preferredRoomType && (
          <p className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
            {resident.name} said they'd prefer a <span className="font-medium capitalize">{resident.preferredRoomType}</span> room.
          </p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="room">Available room</Label>
          <Select id="room" value={roomId} onChange={(e) => setRoomId(e.target.value)} required>
            <option value="">Select a room…</option>
            {availableRooms.map((r) => (
              <option key={r._id} value={r._id}>
                {r.roomNumber} · {r.type} · {r.occupied}/{r.capacity} occupied · ₹{r.monthlyRent}/mo
                {r.type === resident?.preferredRoomType ? ' · matches preference' : ''}
              </option>
            ))}
          </Select>
          {availableRooms.length === 0 && <p className="text-xs text-slate-500">No available rooms right now.</p>}
        </div>

        {mutation.isError && <p className="text-sm text-red-600">{getErrorMessage(mutation.error)}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={mutation.isPending || !roomId}>
            {mutation.isPending ? 'Saving…' : mode === 'allocate' ? 'Allocate' : 'Move'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
