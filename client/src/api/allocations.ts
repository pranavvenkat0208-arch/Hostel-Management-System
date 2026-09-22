import { api } from './axios';
import type { Allocation } from '../types';

export async function allocateRoom(input: { residentId: string; roomId: string; notes?: string }) {
  const res = await api.post<{ allocation: Allocation }>('/allocations/allocate', input);
  return res.data.allocation;
}

export async function checkOutResident(input: { residentId: string; notes?: string }) {
  const res = await api.post<{ allocation: Allocation | null }>('/allocations/check-out', input);
  return res.data;
}

export async function changeRoom(input: { residentId: string; newRoomId: string; notes?: string }) {
  const res = await api.post<{ allocation: Allocation }>('/allocations/change-room', input);
  return res.data.allocation;
}

export async function fetchAllocationHistory(params?: { residentId?: string; roomId?: string }) {
  const res = await api.get<{ allocations: Allocation[] }>('/allocations', { params });
  return res.data.allocations;
}
