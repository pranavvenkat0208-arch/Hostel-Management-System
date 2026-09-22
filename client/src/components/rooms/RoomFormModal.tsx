import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { useCreateRoom, useUpdateRoom } from '../../hooks/useRooms';
import { getErrorMessage } from '../../lib/utils';
import type { Room, RoomType } from '../../types';

interface RoomFormModalProps {
  open: boolean;
  onClose: () => void;
  room?: Room | null;
}

const DEFAULT_CAPACITY: Record<RoomType, number | null> = {
  single: 1,
  double: 2,
  triple: 3,
  dormitory: null,
};

export function RoomFormModal({ open, onClose, room }: RoomFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={room ? 'Edit room' : 'Add room'}>
      <RoomForm key={room?._id ?? 'new'} room={room} onClose={onClose} />
    </Modal>
  );
}

function RoomForm({ room, onClose }: { room?: Room | null; onClose: () => void }) {
  const isEdit = Boolean(room);
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();

  const [roomNumber, setRoomNumber] = useState(room?.roomNumber ?? '');
  const [type, setType] = useState<RoomType>(room?.type ?? 'single');
  const [floor, setFloor] = useState(room?.floor?.toString() ?? '');
  const [capacity, setCapacity] = useState(room?.capacity.toString() ?? '1');
  const [monthlyRent, setMonthlyRent] = useState(room?.monthlyRent.toString() ?? '');
  const [amenities, setAmenities] = useState(room?.amenities.join(', ') ?? '');

  const mutation = isEdit ? updateRoom : createRoom;

  function handleTypeChange(newType: RoomType) {
    setType(newType);
    const defaultCapacity = DEFAULT_CAPACITY[newType];
    if (defaultCapacity !== null) {
      setCapacity(defaultCapacity.toString());
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amenitiesList = amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const input = {
      roomNumber,
      type,
      floor: floor ? Number(floor) : undefined,
      capacity: Number(capacity),
      monthlyRent: Number(monthlyRent),
      amenities: amenitiesList,
    };

    if (isEdit && room) {
      updateRoom.mutate({ id: room._id, input }, { onSuccess: onClose });
    } else {
      createRoom.mutate(input, { onSuccess: onClose });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="roomNumber">Room number</Label>
          <Input
            id="roomNumber"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            disabled={isEdit}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <Select id="type" value={type} onChange={(e) => handleTypeChange(e.target.value as RoomType)}>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="dormitory">Dormitory</option>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="floor">Floor</Label>
          <Input
            id="floor"
            type="number"
            min={0}
            max={12}
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
          <p className="text-xs text-slate-400">Auto-fills from type, dormitories can vary</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="monthlyRent">Rent (₹/mo)</Label>
          <Input
            id="monthlyRent"
            type="number"
            min={0}
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="amenities">Amenities (comma separated)</Label>
        <Input
          id="amenities"
          value={amenities}
          onChange={(e) => setAmenities(e.target.value)}
          placeholder="Wi-Fi, Attached bathroom"
        />
      </div>

      {mutation.isError && <p className="text-sm text-red-600">{getErrorMessage(mutation.error)}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add room'}
        </Button>
      </div>
    </form>
  );
}
