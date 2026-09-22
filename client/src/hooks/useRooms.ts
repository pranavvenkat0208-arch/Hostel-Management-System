import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as roomsApi from '../api/rooms';
import type { RoomInput, RoomUpdateInput } from '../api/rooms';

export function useRooms(params?: { type?: string; availability?: string; search?: string }) {
  return useQuery({
    queryKey: ['rooms', params],
    queryFn: () => roomsApi.fetchRooms(params),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useOccupancySummary() {
  return useQuery({
    queryKey: ['rooms', 'occupancy-summary'],
    queryFn: roomsApi.fetchOccupancySummary,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RoomInput) => roomsApi.createRoom(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RoomUpdateInput }) => roomsApi.updateRoom(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roomsApi.deleteRoom(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}
