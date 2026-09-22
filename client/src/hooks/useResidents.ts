import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as residentsApi from '../api/residents';
import type { ResidentUpdateInput, UpdateMyProfileInput } from '../api/residents';

export function useResidents(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['residents', params],
    queryFn: () => residentsApi.fetchResidents(params),
  });
}

export function useResident(id: string) {
  return useQuery({
    queryKey: ['residents', id],
    queryFn: () => residentsApi.fetchResident(id),
    enabled: Boolean(id),
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['residents', 'me'],
    queryFn: residentsApi.fetchMyProfile,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMyProfileInput) => residentsApi.updateMyProfile(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['residents', 'me'] }),
  });
}

export function useUpdateResident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ResidentUpdateInput }) => residentsApi.updateResident(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['residents'] }),
  });
}

export function useDeleteResident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => residentsApi.deleteResident(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['residents'] }),
  });
}
