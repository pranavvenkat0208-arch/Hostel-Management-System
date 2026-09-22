import { useMyInvoices } from '../../hooks/useInvoices';
import { Card, CardContent } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { InvoiceStatusBadge } from '../../components/billing/InvoiceStatusBadge';

export function ResidentBillingView() {
  const { data: invoices, isLoading } = useMyInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-500">Your invoices and payment history.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          {invoices?.map((inv) => (
            <Card key={inv._id}>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{inv.billingPeriod}</p>
                    <p className="text-xs text-slate-500">Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                  </div>
                  <InvoiceStatusBadge status={inv.status} />
                </div>

                <ul className="space-y-1 text-sm text-slate-600">
                  {inv.lineItems.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{item.description}</span>
                      <span>₹{item.amount}</span>
                    </li>
                  ))}
                  {inv.discount > 0 && (
                    <li className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-₹{inv.discount}</span>
                    </li>
                  )}
                  {inv.lateFee > 0 && (
                    <li className="flex justify-between text-red-600">
                      <span>Late fee</span>
                      <span>+₹{inv.lateFee}</span>
                    </li>
                  )}
                </ul>

                <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-medium text-slate-900">
                  <span>Total</span>
                  <span>₹{inv.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Paid</span>
                  <span>₹{inv.amountPaid}</span>
                </div>

                {inv.paymentHistory.length > 0 && (
                  <div className="border-t border-slate-100 pt-2">
                    <p className="mb-1 text-xs font-medium uppercase text-slate-400">Payment history</p>
                    <ul className="space-y-1 text-xs text-slate-500">
                      {inv.paymentHistory.map((p, i) => (
                        <li key={i}>
                          {new Date(p.recordedAt).toLocaleDateString()} — marked {p.status.replace('_', ' ')}
                          {p.amount ? ` · ₹${p.amount}` : ''}
                          {p.method ? ` · ${p.method.replace('_', ' ')}` : ''}
                          {p.note ? ` — ${p.note}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {invoices?.length === 0 && <p className="py-10 text-center text-sm text-slate-400">No invoices yet.</p>}
        </div>
      )}
    </div>
  );
}
