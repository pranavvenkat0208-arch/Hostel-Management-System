import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { PhoneInput } from '../ui/PhoneInput';
import { useUpdateResident } from '../../hooks/useResidents';
import { useToastStore } from '../../store/toastStore';
import { getErrorMessage } from '../../lib/utils';
import type { Resident, RoomType } from '../../types';

interface EditResidentModalProps {
  open: boolean;
  onClose: () => void;
  resident: Resident | null;
}

export function EditResidentModal({ open, onClose, resident }: EditResidentModalProps) {
  if (!resident) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Edit ${resident.name}'s details`} className="max-w-lg">
      <EditResidentForm key={resident._id} resident={resident} onClose={onClose} />
    </Modal>
  );
}

function EditResidentForm({ resident, onClose }: { resident: Resident; onClose: () => void }) {
  const updateResident = useUpdateResident();
  const showToast = useToastStore((s) => s.showToast);

  const [email, setEmail] = useState(resident.email ?? '');
  const [phone, setPhone] = useState(resident.phone ?? '');
  const [ecName, setEcName] = useState(resident.emergencyContact?.name ?? '');
  const [ecRelation, setEcRelation] = useState(resident.emergencyContact?.relation ?? '');
  const [ecPhone, setEcPhone] = useState(resident.emergencyContact?.phone ?? '');
  const [preferredRoomType, setPreferredRoomType] = useState<RoomType | ''>(resident.preferredRoomType ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateResident.mutate(
      {
        id: resident._id,
        input: {
          email,
          phone,
          emergencyContact: { name: ecName, relation: ecRelation, phone: ecPhone },
          preferredRoomType: preferredRoomType || null,
        },
      },
      {
        onSuccess: () => {
          onClose();
          showToast(`${resident.name}'s details were saved.`);
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-slate-500">Name can&apos;t be changed here.</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="residentEmail">Email</Label>
          <Input id="residentEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="residentPhone">Phone</Label>
          <PhoneInput id="residentPhone" value={phone} onChange={setPhone} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="residentPreferredRoomType">Preferred room type</Label>
        <Select
          id="residentPreferredRoomType"
          value={preferredRoomType}
          onChange={(e) => setPreferredRoomType(e.target.value as RoomType | '')}
        >
          <option value="">No preference</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="triple">Triple</option>
          <option value="dormitory">Dormitory</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Emergency contact</Label>
        <div className="grid grid-cols-3 gap-3">
          <Input placeholder="Name" value={ecName} onChange={(e) => setEcName(e.target.value)} />
          <Input placeholder="Relation" value={ecRelation} onChange={(e) => setEcRelation(e.target.value)} />
          <PhoneInput value={ecPhone} onChange={setEcPhone} placeholder="Phone" />
        </div>
      </div>

      {updateResident.isError && <p className="text-sm text-red-600">{getErrorMessage(updateResident.error)}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={updateResident.isPending}>
          {updateResident.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
