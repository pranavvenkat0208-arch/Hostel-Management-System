import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { useResidents } from '../../hooks/useResidents';
import { useCreateInvoice } from '../../hooks/useInvoices';
import { getErrorMessage } from '../../lib/utils';
import type { LineItem } from '../../types';

interface CreateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
}

const emptyLineItems: LineItem[] = [{ description: 'Room fee', amount: 0 }];

export function CreateInvoiceModal({ open, onClose }: CreateInvoiceModalProps) {
  const { data: residents } = useResidents({ status: 'active' });
  const createInvoice = useCreateInvoice();

  const [residentId, setResidentId] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>(emptyLineItems);
  const [discount, setDiscount] = useState('0');
  const [lateFee, setLateFee] = useState('0');
  const [dueDate, setDueDate] = useState('');

  function close() {
    setResidentId('');
    setBillingPeriod('');
    setLineItems(emptyLineItems);
    setDiscount('0');
    setLateFee('0');
    setDueDate('');
    onClose();
  }

  function updateLineItem(index: number, field: keyof LineItem, value: string) {
    setLineItems((items) =>
      items.map((item, i) => (i === index ? { ...item, [field]: field === 'amount' ? Number(value) : value } : item))
    );
  }

  function addLineItem() {
    setLineItems((items) => [...items, { description: '', amount: 0 }]);
  }

  function removeLineItem(index: number) {
    setLineItems((items) => items.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createInvoice.mutate(
      { residentId, billingPeriod, lineItems, discount: Number(discount), lateFee: Number(lateFee), dueDate },
      { onSuccess: close }
    );
  }

  const total =
    lineItems.reduce((sum, item) => sum + (item.amount || 0), 0) - Number(discount || 0) + Number(lateFee || 0);

  return (
    <Modal open={open} onClose={close} title="Create invoice" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="resident">Resident</Label>
            <Select id="resident" value={residentId} onChange={(e) => setResidentId(e.target.value)} required>
              <option value="">Select a resident…</option>
              {residents?.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} {r.currentRoom ? `(${r.currentRoom.roomNumber})` : ''}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="billingPeriod">Billing period</Label>
            {/* A billing period is a whole month (rent is billed monthly), so a
                month picker — not a day-level date — is the right input here.
                Its value is already the "YYYY-MM" string the backend expects. */}
            <Input
              id="billingPeriod"
              type="month"
              value={billingPeriod}
              onChange={(e) => setBillingPeriod(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Line items</Label>
          {lineItems.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Description (e.g. Room fee)"
                value={item.description}
                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                required
              />
              <Input
                type="number"
                min={0}
                placeholder="Amount"
                className="w-32"
                value={item.amount || ''}
                onChange={(e) => updateLineItem(index, 'amount', e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLineItem(index)}
                disabled={lineItems.length === 1}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="h-4 w-4" /> Add line item
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="discount">Discount</Label>
            <Input id="discount" type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lateFee">Late fee</Label>
            <Input id="lateFee" type="number" min={0} value={lateFee} onChange={(e) => setLateFee(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>
        </div>

        <p className="text-sm font-medium text-slate-700">Total: ₹{total.toFixed(2)}</p>

        {createInvoice.isError && <p className="text-sm text-red-600">{getErrorMessage(createInvoice.error)}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={createInvoice.isPending}>
            {createInvoice.isPending ? 'Creating…' : 'Create invoice'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
