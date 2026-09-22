import { api } from './axios';
import type { Invoice, InvoiceStatus, PaymentMethod, LineItem } from '../types';

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
