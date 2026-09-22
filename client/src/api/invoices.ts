import { api } from './axios';
import type { Invoice, InvoiceStatus, PaymentMethod, LineItem, RazorpayOrder } from '../types';

export interface CreateInvoiceInput {
  residentId: string;
  billingPeriod: string;
  lineItems: LineItem[];
  discount?: number;
  lateFee?: number;
  dueDate: string;
}

export interface UpdatePaymentStatusInput {
  status: InvoiceStatus;
  amount?: number;
  method?: PaymentMethod;
  note?: string;
}

export interface UpdateInvoiceAdjustmentsInput {
  discount?: number;
  lateFee?: number;
}

export interface InstallmentInput {
  amount: number;
  dueDate: string;
}

export interface PayInstallmentInput {
  method: PaymentMethod;
  note?: string;
}

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function fetchInvoices(params?: { status?: string; residentId?: string }) {
  const res = await api.get<{ invoices: Invoice[] }>('/invoices', { params });
  return res.data.invoices;
}

export async function fetchMyInvoices() {
  const res = await api.get<{ invoices: Invoice[] }>('/invoices/my');
  return res.data.invoices;
}

export async function fetchInvoice(id: string) {
  const res = await api.get<{ invoice: Invoice }>(`/invoices/${id}`);
  return res.data.invoice;
}

export async function createInvoice(input: CreateInvoiceInput) {
  const res = await api.post<{ invoice: Invoice }>('/invoices', input);
  return res.data.invoice;
}

export async function updatePaymentStatus(id: string, input: UpdatePaymentStatusInput) {
  const res = await api.patch<{ invoice: Invoice }>(`/invoices/${id}/payment-status`, input);
  return res.data.invoice;
}

export async function updateInvoiceAdjustments(id: string, input: UpdateInvoiceAdjustmentsInput) {
  const res = await api.patch<{ invoice: Invoice }>(`/invoices/${id}/adjustments`, input);
  return res.data.invoice;
}

export async function createInstallmentPlan(id: string, installments: InstallmentInput[]) {
  const res = await api.post<{ invoice: Invoice }>(`/invoices/${id}/installments`, { installments });
  return res.data.invoice;
}

export async function payInstallmentManually(id: string, index: number, input: PayInstallmentInput) {
  const res = await api.patch<{ invoice: Invoice }>(`/invoices/${id}/installments/${index}/pay`, input);
  return res.data.invoice;
}

export async function createPaymentOrder(id: string) {
  const res = await api.post<{ order: RazorpayOrder }>(`/invoices/${id}/pay/order`);
  return res.data.order;
}

export async function verifyPayment(id: string, input: VerifyPaymentInput) {
  const res = await api.post<{ invoice: Invoice }>(`/invoices/${id}/pay/verify`, input);
  return res.data.invoice;
}
