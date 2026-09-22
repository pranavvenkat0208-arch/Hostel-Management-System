import { api } from './axios';
import type { Resident, EmergencyContact } from '../types';

export async function fetchResidents(params?: { status?: string; search?: string }) {
  const res = await api.get<{ residents: Resident[] }>('/residents', { params });
  return res.data.residents;
}

export async function fetchResident(id: string) {
  const res = await api.get<{ resident: Resident }>(`/residents/${id}`);
  return res.data.resident;
}

export async function fetchMyProfile() {
  const res = await api.get<{ resident: Resident }>('/residents/me');
  return res.data.resident;
}

export async function updateMyProfile(input: { phone?: string; emergencyContact?: EmergencyContact }) {
  const res = await api.patch<{ resident: Resident }>('/residents/me', input);
  return res.data.resident;
}

export interface ResidentUpdateInput {
  name?: string;
  phone?: string;
  emergencyContact?: EmergencyContact;
}

export async function updateResident(id: string, input: ResidentUpdateInput) {
  const res = await api.patch<{ resident: Resident }>(`/residents/${id}`, input);
  return res.data.resident;
}

export async function deleteResident(id: string) {
  await api.delete(`/residents/${id}`);
}
