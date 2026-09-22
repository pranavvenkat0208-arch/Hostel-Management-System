import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as invoicesApi from '../api/invoices';
import type { CreateInvoiceInput, UpdatePaymentStatusInput } from '../api/invoices';

export function useInvoices(params?: { status?: string; residentId?: string }) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoicesApi.fetchInvoices(params),
  });
}

export function useMyInvoices() {
  return useQuery({
    queryKey: ['invoices', 'my'],
    queryFn: invoicesApi.fetchMyInvoices,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => invoicesApi.createInvoice(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useUpdatePaymentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePaymentStatusInput }) =>
      invoicesApi.updatePaymentStatus(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}
