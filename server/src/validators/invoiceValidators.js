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

module.exports = { lineItemSchema, createInvoiceSchema, updatePaymentStatusSchema };
