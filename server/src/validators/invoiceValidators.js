const { z } = require('zod');

const lineItemSchema = z.object({
  description: z.string().min(1, 'Line item description is required'),
  amount: z.coerce.number().min(0, 'Amount cannot be negative'),
});

const createInvoiceSchema = z.object({
  residentId: z.string().min(1, 'residentId is required'),
  billingPeriod: z.string().min(1, 'billingPeriod is required (e.g. "2026-09")'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  discount: z.coerce.number().min(0).optional(),
  lateFee: z.coerce.number().min(0).optional(),
  dueDate: z.coerce.date(),
});

const updatePaymentStatusSchema = z.object({
  status: z.enum(['unpaid', 'partially_paid', 'paid', 'overdue']),
  amount: z.coerce.number().min(0).optional(),
  method: z.enum(['cash', 'upi', 'bank_transfer', 'card', 'other']).optional(),
  note: z.string().optional(),
});

// At least one of discount / lateFee is required.
const updateInvoiceAdjustmentsSchema = z
  .object({
    discount: z.coerce.number().min(0).optional(),
    lateFee: z.coerce.number().min(0).optional(),
  })
  .refine((data) => data.discount !== undefined || data.lateFee !== undefined, {
    message: 'Provide a discount or a late fee to update',
  });

const installmentInputSchema = z.object({
  amount: z.coerce.number().positive('Installment amount must be greater than 0'),
  dueDate: z.coerce.date(),
});

const createInstallmentPlanSchema = z.object({
  installments: z.array(installmentInputSchema).min(2, 'A payment plan needs at least 2 installments'),
});

const payInstallmentSchema = z.object({
  method: z.enum(['cash', 'upi', 'bank_transfer', 'card', 'other']),
  note: z.string().optional(),
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

module.exports = {
  lineItemSchema,
  createInvoiceSchema,
  updatePaymentStatusSchema,
  updateInvoiceAdjustmentsSchema,
  createInstallmentPlanSchema,
  payInstallmentSchema,
  verifyPaymentSchema,
};
