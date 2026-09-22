import { useState } from 'react';
import { CreditCard, Check, Clock } from 'lucide-react';
import { useMyInvoices, useCreatePaymentOrder, useVerifyPayment } from '../../hooks/useInvoices';
import { useAuthStore } from '../../store/authStore';
import { loadRazorpayScript } from '../../lib/razorpay';
import type { RazorpayPaymentResponse } from '../../lib/razorpay';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { InvoiceStatusBadge } from '../../components/billing/InvoiceStatusBadge';
import { getErrorMessage } from '../../lib/utils';
import type { Invoice } from '../../types';

export function ResidentBillingView() {
  const { data: invoices, isLoading } = useMyInvoices();
  const user = useAuthStore((s) => s.user);
  const createOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyPayment();

  const [payingId, setPayingId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  async function handlePay(invoice: Invoice) {
    setPayError(null);
    setPayingId(invoice._id);
    try {
      await loadRazorpayScript();
      const order = await createOrder.mutateAsync(invoice._id);

      const RazorpayCheckout = window.Razorpay;
      if (!RazorpayCheckout) throw new Error('Payment window could not be loaded.');

      const checkout = new RazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Wayne Towers Hostel',
        description: `Invoice ${invoice.billingPeriod}`,
        order_id: order.orderId,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#2a78d6' },
        handler: (response: RazorpayPaymentResponse) => {
          verifyPayment.mutate(
            { id: invoice._id, input: response },
            {
              onError: (err) => setPayError(getErrorMessage(err)),
              onSettled: () => setPayingId(null),
            }
          );
        },
        modal: {
          ondismiss: () => setPayingId(null),
        },
        // Show UPI as its own block. Other methods still appear.
        config: {
          display: {
            blocks: {
              upi: { name: 'Pay by UPI', instruments: [{ method: 'upi' }] },
            },
            sequence: ['block.upi', 'card', 'netbanking', 'wallet'],
            preferences: { show_default_blocks: true },
          },
        },
      });

      checkout.on('payment.failed', () => {
        setPayError('Payment failed. Please try again.');
        setPayingId(null);
      });

      checkout.open();
    } catch (err) {
      setPayError(getErrorMessage(err));
      setPayingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-500">Your invoices, payment history, and online payments.</p>
      </div>

      {payError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{payError}</div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          {invoices?.map((inv) => {
            const outstanding = inv.totalAmount - inv.amountPaid;
            const isPaying = payingId === inv._id;
            return (
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

                  {inv.installments.length > 0 && (
                    <div className="border-t border-slate-100 pt-2">
                      <p className="mb-1 text-xs font-medium uppercase text-slate-400">Payment plan</p>
                      <ul className="space-y-1 text-sm">
                        {inv.installments.map((inst, i) => (
                          <li key={i} className="flex items-center justify-between">
                            <span className="text-slate-600">
                              ₹{inst.amount} · due {new Date(inst.dueDate).toLocaleDateString()}
                            </span>
                            {inst.status === 'paid' ? (
                              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                                <Check className="h-3.5 w-3.5" /> Paid
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                                <Clock className="h-3.5 w-3.5" /> Pending
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {inv.status !== 'paid' && outstanding > 0 && (
                    <div className="flex justify-end border-t border-slate-100 pt-3">
                      <Button variant="primary" size="sm" onClick={() => handlePay(inv)} disabled={isPaying}>
                        <CreditCard className="h-4 w-4" />
                        {isPaying ? 'Opening payment…' : `Pay ₹${inv.installments.length > 0 ? (inv.installments.find((i) => i.status === 'pending')?.amount ?? outstanding) : outstanding} now`}
                      </Button>
                    </div>
                  )}

                  {inv.paymentHistory.length > 0 && (
                    <div className="border-t border-slate-100 pt-2">
                      <p className="mb-1 text-xs font-medium uppercase text-slate-400">Payment history</p>
                      <ul className="space-y-1 text-xs text-slate-500">
                        {inv.paymentHistory.map((p, i) => (
                          <li key={i}>
                            {new Date(p.recordedAt).toLocaleDateString()}: marked {p.status.replace('_', ' ')}
                            {p.amount ? ` · ₹${p.amount}` : ''}
                            {p.method ? ` · ${p.method.replace('_', ' ')}` : ''}
                            {p.note ? ` · ${p.note}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {invoices?.length === 0 && <p className="py-10 text-center text-sm text-slate-400">No invoices yet.</p>}
        </div>
      )}
    </div>
  );
}
