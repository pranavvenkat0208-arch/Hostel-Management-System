import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { useUpdateInvoiceAdjustments } from '../../hooks/useInvoices';
import { getErrorMessage } from '../../lib/utils';
import type { Invoice } from '../../types';

interface EditInvoiceAdjustmentsModalProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function EditInvoiceAdjustmentsModal({ open, onClose, invoice }: EditInvoiceAdjustmentsModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit discount & late fee">
      {invoice && <AdjustmentsForm key={invoice._id} invoice={invoice} onClose={onClose} />}
    </Modal>
  );
}

function AdjustmentsForm({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const updateAdjustments = useUpdateInvoiceAdjustments();
  const [discount, setDiscount] = useState(String(invoice.discount));
  const [lateFee, setLateFee] = useState(String(invoice.lateFee));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateAdjustments.mutate(
      { id: invoice._id, input: { discount: Number(discount), lateFee: Number(lateFee) } },
      { onSuccess: onClose }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-discount">Discount</Label>
          <Input
            id="edit-discount"
            type="number"
            min={0}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edit-lateFee">Late fee</Label>
          <Input id="edit-lateFee" type="number" min={0} value={lateFee} onChange={(e) => setLateFee(e.target.value)} />
        </div>
      </div>

      <p className="text-xs text-slate-500">
        ₹{invoice.amountPaid.toFixed(2)} already paid on this invoice. The new total can't be lower than that.
      </p>

      {updateAdjustments.isError && (
        <p className="text-sm text-red-600">{getErrorMessage(updateAdjustments.error)}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={updateAdjustments.isPending}>
          {updateAdjustments.isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
