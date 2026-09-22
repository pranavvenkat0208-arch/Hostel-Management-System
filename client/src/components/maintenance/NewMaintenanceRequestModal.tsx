import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useCreateMaintenanceRequest } from '../../hooks/useMaintenance';
import { getErrorMessage } from '../../lib/utils';
import type { MaintenanceCategory, MaintenancePriority } from '../../types';

interface NewMaintenanceRequestModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewMaintenanceRequestModal({ open, onClose }: NewMaintenanceRequestModalProps) {
  const create = useCreateMaintenanceRequest();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MaintenanceCategory>('other');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');

  function close() {
    setTitle('');
    setDescription('');
    setCategory('other');
    setPriority('medium');
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate({ title, description, category, priority }, { onSuccess: close });
  }

  return (
    <Modal open={open} onClose={close} title="Submit a maintenance request">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select id="category" value={category} onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="furniture">Furniture</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="internet">Internet</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priority">Priority</Label>
            <Select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as MaintenancePriority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </div>
        </div>

        {create.isError && <p className="text-sm text-red-600">{getErrorMessage(create.error)}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={create.isPending}>
            {create.isPending ? 'Submitting…' : 'Submit request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
