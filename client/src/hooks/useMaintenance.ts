import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as maintenanceApi from '../api/maintenance';
import type { CreateMaintenanceInput } from '../api/maintenance';
import type { MaintenanceStatus } from '../types';

export function useMyMaintenanceRequests() {
  return useQuery({
    queryKey: ['maintenance', 'my'],
    queryFn: maintenanceApi.fetchMyMaintenanceRequests,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useAllMaintenanceRequests(params?: { status?: string; priority?: string; assignedTo?: string }) {
  return useQuery({
    queryKey: ['maintenance', 'all', params],
    queryFn: () => maintenanceApi.fetchAllMaintenanceRequests(params),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMaintenanceRequest(id: string | undefined) {
  return useQuery({
    queryKey: ['maintenance', 'detail', id],
    queryFn: () => maintenanceApi.fetchMaintenanceRequest(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateMaintenanceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMaintenanceInput) => maintenanceApi.createMaintenanceRequest(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  });
}

export function useAssignMaintenanceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) =>
      maintenanceApi.assignMaintenanceRequest(id, assignedTo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  });
}

export function useUpdateMaintenanceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: MaintenanceStatus; note?: string }) =>
      maintenanceApi.updateMaintenanceStatus(id, status, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  });
}
