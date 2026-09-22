import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as allocationsApi from '../api/allocations';

function invalidateAfterAllocationChange(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['rooms'] });
  qc.invalidateQueries({ queryKey: ['residents'] });
  qc.invalidateQueries({ queryKey: ['allocations'] });
}

export function useAllocateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: allocationsApi.allocateRoom,
    onSuccess: () => invalidateAfterAllocationChange(qc),
  });
}

export function useCheckOutResident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: allocationsApi.checkOutResident,
    onSuccess: () => invalidateAfterAllocationChange(qc),
  });
}

export function useChangeRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: allocationsApi.changeRoom,
    onSuccess: () => invalidateAfterAllocationChange(qc),
  });
}

// Pass enabled: open from modals so it doesn't fetch while hidden.
export function useAllocationHistory(params?: { residentId?: string; roomId?: string }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['allocations', params],
    queryFn: () => allocationsApi.fetchAllocationHistory(params),
    enabled: options?.enabled ?? true,
  });
}
