import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as invoicesApi from '../api/invoices';
import type {
  CreateInvoiceInput,
  UpdatePaymentStatusInput,
  UpdateInvoiceAdjustmentsInput,
  InstallmentInput,
  PayInstallmentInput,
  VerifyPaymentInput,
} from '../api/invoices';

export function useInvoices(params?: { status?: string; residentId?: string }) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoicesApi.fetchInvoices(params),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMyInvoices() {
  return useQuery({
    queryKey: ['invoices', 'my'],
    queryFn: invoicesApi.fetchMyInvoices,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
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

export function useUpdateInvoiceAdjustments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateInvoiceAdjustmentsInput }) =>
      invoicesApi.updateInvoiceAdjustments(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useCreateInstallmentPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, installments }: { id: string; installments: InstallmentInput[] }) =>
      invoicesApi.createInstallmentPlan(id, installments),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function usePayInstallmentManually() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, index, input }: { id: string; index: number; input: PayInstallmentInput }) =>
      invoicesApi.payInstallmentManually(id, index, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: (id: string) => invoicesApi.createPaymentOrder(id),
  });
}

export function useVerifyPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VerifyPaymentInput }) => invoicesApi.verifyPayment(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
