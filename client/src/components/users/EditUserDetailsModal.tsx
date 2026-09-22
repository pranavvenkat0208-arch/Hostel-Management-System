import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { PhoneInput } from '../ui/PhoneInput';
import { useUpdateUserDetails } from '../../hooks/useUsers';
import { useToastStore } from '../../store/toastStore';
import { getErrorMessage } from '../../lib/utils';
import type { User } from '../../types';

interface EditUserDetailsModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function EditUserDetailsModal({ open, onClose, user }: EditUserDetailsModalProps) {
  if (!user) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Edit ${user.name}'s account`} className="max-w-md">
      <EditUserDetailsForm key={user.id} user={user} onClose={onClose} />
    </Modal>
  );
}

function EditUserDetailsForm({ user, onClose }: { user: User; onClose: () => void }) {
  const updateUserDetails = useUpdateUserDetails();
  const showToast = useToastStore((s) => s.showToast);

  const [email, setEmail] = useState(user.email ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateUserDetails.mutate(
      { id: user.id, input: { email, phone } },
      {
        onSuccess: () => {
          onClose();
          showToast(`${user.name}'s account was updated.`);
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-slate-500">Name can&apos;t be changed here.</p>

      <div className="space-y-1.5">
        <Label htmlFor="userEmail">Email</Label>
        <Input id="userEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="userPhone">Phone</Label>
        <PhoneInput id="userPhone" value={phone} onChange={setPhone} />
      </div>

      {updateUserDetails.isError && (
        <p className="text-sm text-red-600">{getErrorMessage(updateUserDetails.error)}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={updateUserDetails.isPending}>
          {updateUserDetails.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
