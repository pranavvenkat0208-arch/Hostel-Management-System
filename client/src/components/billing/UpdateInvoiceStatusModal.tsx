import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useUpdatePaymentStatus } from '../../hooks/useInvoices';
import { getErrorMessage } from '../../lib/utils';
import type { Invoice, InvoiceStatus, PaymentMethod } from '../../types';

interface UpdateInvoiceStatusModalProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function UpdateInvoiceStatusModal({ open, onClose, invoice }: UpdateInvoiceStatusModalProps) {
  const updateStatus = useUpdatePaymentStatus();
  // Default to "Partially paid" so Save never settles the full balance by accident.
  const [status, setStatus] = useState<InvoiceStatus>('partially_paid');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState('');

  function close() {
    setStatus('partially_paid');
    setAmount('');
    setMethod('cash');
    setNote('');
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!invoice) return;
    updateStatus.mutate(
      { id: invoice._id, input: { status, amount: amount ? Number(amount) : undefined, method, note } },
      { onSuccess: close }
    );
  }

  const remaining = invoice ? Math.max(0, invoice.totalAmount - invoice.amountPaid) : 0;

  return (
    <Modal open={open} onClose={close} title={`Update payment: ${invoice?.billingPeriod ?? ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {invoice && (
          <p className="text-sm text-slate-500">
            Total ₹{invoice.totalAmount} · Paid ₹{invoice.amountPaid} · <span className="font-medium text-slate-700">Outstanding ₹{remaining}</span>
          </p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="status">Mark as</Label>
          <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)}>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially paid</option>
            <option value="overdue">Overdue</option>
            <option value="unpaid">Unpaid</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="amount">
              Amount received {status === 'partially_paid' ? '' : '(optional)'}
            </Label>
            <Input
              id="amount"
              type="number"
              min={0}
              max={remaining}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required={status === 'partially_paid'}
            />
            {status === 'paid' && !amount && (
              <p className="text-xs font-medium text-amber-600">
                This will record ₹{remaining} as received.
              </p>
            )}
            {status === 'paid' && amount && (
              <p className="text-xs text-slate-400">This will record ₹{amount} as received.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="method">Payment method</Label>
            <Select id="method" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Transaction reference, remarks…"
          />
        </div>

        {updateStatus.isError && <p className="text-sm text-red-600">{getErrorMessage(updateStatus.error)}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={updateStatus.isPending}>
            {updateStatus.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
