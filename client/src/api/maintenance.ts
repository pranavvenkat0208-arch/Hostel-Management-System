import { api } from './axios';
import type { MaintenanceTicket, MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from '../types';

export interface CreateMaintenanceInput {
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
}

export async function createMaintenanceRequest(input: CreateMaintenanceInput) {
  const res = await api.post<{ request: MaintenanceTicket }>('/maintenance', input);
  return res.data.request;
}

export async function fetchMyMaintenanceRequests() {
  const res = await api.get<{ requests: MaintenanceTicket[] }>('/maintenance/my');
  return res.data.requests;
}

export async function fetchAllMaintenanceRequests(params?: {
  status?: string;
  priority?: string;
  assignedTo?: string;
}) {
  const res = await api.get<{ requests: MaintenanceTicket[] }>('/maintenance', { params });
  return res.data.requests;
}

// Includes the status timeline with names.
export async function fetchMaintenanceRequest(id: string) {
  const res = await api.get<{ request: MaintenanceTicket }>(`/maintenance/${id}`);
  return res.data.request;
}

export async function assignMaintenanceRequest(id: string, assignedTo: string) {
  const res = await api.patch<{ request: MaintenanceTicket }>(`/maintenance/${id}/assign`, { assignedTo });
  return res.data.request;
}

export async function updateMaintenanceStatus(id: string, status: MaintenanceStatus, note?: string) {
  const res = await api.patch<{ request: MaintenanceTicket }>(`/maintenance/${id}/status`, { status, note });
  return res.data.request;
}
