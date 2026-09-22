import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { useCreateInstallmentPlan, usePayInstallmentManually } from '../../hooks/useInvoices';
import { getErrorMessage } from '../../lib/utils';
import type { Invoice, PaymentMethod } from '../../types';

interface InstallmentPlanModalProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

interface Row {
  amount: string;
  dueDate: string;
}

const MANUAL_METHODS: PaymentMethod[] = ['cash', 'upi', 'bank_transfer', 'card', 'other'];
const emptyRows: Row[] = [
  { amount: '', dueDate: '' },
  { amount: '', dueDate: '' },
];

export function InstallmentPlanModal({ open, onClose, invoice }: InstallmentPlanModalProps) {
  const createPlan = useCreateInstallmentPlan();
  const payInstallment = usePayInstallmentManually();

  const [rows, setRows] = useState<Row[]>(emptyRows);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [payingIndex, setPayingIndex] = useState<number | null>(null);

  if (!invoice) return null;

  const invoiceId = invoice._id;
  const outstanding = invoice.totalAmount - invoice.amountPaid;
  const hasPlan = invoice.installments.length > 0;
  const rowsSum = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const sumMatches = Math.abs(rowsSum - outstanding) <= 0.01;

  function close() {
    setRows(emptyRows);
    onClose();
  }

  function updateRow(index: number, field: keyof Row, value: string) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((r) => [...r, { amount: '', dueDate: '' }]);
  }

  function removeRow(index: number) {
    setRows((r) => r.filter((_, i) => i !== index));
  }

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    createPlan.mutate(
      { id: invoiceId, installments: rows.map((r) => ({ amount: Number(r.amount), dueDate: r.dueDate })) },
      { onSuccess: close }
    );
  }

  function handleMarkPaid(index: number) {
    setPayingIndex(index);
    payInstallment.mutate(
      { id: invoiceId, index, input: { method } },
      { onSettled: () => setPayingIndex(null) }
    );
  }

  return (
    <Modal open={open} onClose={close} title="Payment plan" className="max-w-xl">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          {invoice.billingPeriod} · Outstanding ₹{outstanding.toFixed(2)}
        </p>

        {hasPlan ? (
          <div className="space-y-3">
            <ul className="space-y-2">
              {invoice.installments.map((inst, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">₹{inst.amount}</p>
                    <p className="text-xs text-slate-500">Due {new Date(inst.dueDate).toLocaleDateString()}</p>
                  </div>
                  {inst.status === 'paid' ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <Check className="h-3.5 w-3.5" /> Paid{inst.method ? ` · ${inst.method.replace('_', ' ')}` : ''}
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkPaid(i)}
                      disabled={payInstallment.isPending && payingIndex === i}
                    >
                      {payInstallment.isPending && payingIndex === i ? 'Marking…' : 'Mark paid manually'}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <Label htmlFor="manualMethod" className="whitespace-nowrap text-xs">
                Method for manual marks
              </Label>
              <Select
                id="manualMethod"
                className="h-9 w-40 text-xs"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              >
                {MANUAL_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m.replace('_', ' ')}
                  </option>
                ))}
              </Select>
            </div>
            {payInstallment.isError && <p className="text-sm text-red-600">{getErrorMessage(payInstallment.error)}</p>}
            <p className="text-xs text-slate-400">
              Residents can also pay any pending installment themselves online, from their Billing page.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-3">
            <p className="text-xs text-slate-500">
              Split the outstanding ₹{outstanding.toFixed(2)} into installments. The resident can then pay each one
              online, or staff can record manual (cash/UPI/etc.) payments here.
            </p>
            {rows.map((row, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="Amount"
                  className="w-32"
                  value={row.amount}
                  onChange={(e) => updateRow(i, 'amount', e.target.value)}
                  required
                />
                <Input
                  type="date"
                  value={row.dueDate}
                  onChange={(e) => updateRow(i, 'dueDate', e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(i)}
                  disabled={rows.length === 2}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus className="h-4 w-4" /> Add installment
            </Button>
            <p className={`text-sm font-medium ${sumMatches ? 'text-emerald-600' : 'text-red-600'}`}>
              Total: ₹{rowsSum.toFixed(2)} (must equal ₹{outstanding.toFixed(2)})
            </p>

            {createPlan.isError && <p className="text-sm text-red-600">{getErrorMessage(createPlan.error)}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={createPlan.isPending || !sumMatches}>
                {createPlan.isPending ? 'Saving…' : 'Save plan'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
