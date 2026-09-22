import { useState } from 'react';
import { Plus, CreditCard } from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { InvoiceStatusBadge } from '../../components/billing/InvoiceStatusBadge';
import { CreateInvoiceModal } from '../../components/billing/CreateInvoiceModal';
import { UpdateInvoiceStatusModal } from '../../components/billing/UpdateInvoiceStatusModal';
import type { Invoice, PopulatedRef } from '../../types';

function asRef(value: PopulatedRef | string | null | undefined): PopulatedRef | null {
  return value && typeof value === 'object' ? value : null;
}

export function AdminBillingView() {
  const { data: invoices, isLoading } = useInvoices();
  const [createOpen, setCreateOpen] = useState(false);
  const [statusInvoice, setStatusInvoice] = useState<Invoice | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
          <p className="text-sm text-slate-500">Create invoices and track resident payments.</p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create invoice
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <Spinner />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Resident</th>
                  <th className="px-5 py-3">Room</th>
                  <th className="px-5 py-3">Period</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Paid</th>
                  <th className="px-5 py-3">Due date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices?.map((inv) => {
                  const resident = asRef(inv.resident);
                  const room = asRef(inv.room);
                  return (
                    <tr key={inv._id} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-3 font-medium text-slate-900">{resident?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-600">{room?.roomNumber ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-600">{inv.billingPeriod}</td>
                      <td className="px-5 py-3 text-slate-600">₹{inv.totalAmount}</td>
                      <td className="px-5 py-3 text-slate-600">₹{inv.amountPaid}</td>
                      <td className="px-5 py-3 text-slate-600">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <InvoiceStatusBadge status={inv.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setStatusInvoice(inv)}
                          title="Update payment status"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {invoices?.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                      No invoices yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <CreateInvoiceModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <UpdateInvoiceStatusModal
        open={Boolean(statusInvoice)}
        onClose={() => setStatusInvoice(null)}
        invoice={statusInvoice}
      />
    </div>
  );
}
