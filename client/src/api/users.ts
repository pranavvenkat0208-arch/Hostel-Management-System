import { api } from './axios';
import type { User, Role } from '../types';

export async function fetchUsers(params?: { role?: Role }) {
  const res = await api.get<{ users: User[] }>('/users', { params });
  return res.data.users;
}

export async function updateUserRole(id: string, role: Role) {
  const res = await api.patch<{ user: User }>(`/users/${id}/role`, { role });
  return res.data.user;
}

export async function updateUserStatus(id: string, isActive: boolean) {
  const res = await api.patch<{ user: User }>(`/users/${id}/status`, { isActive });
  return res.data.user;
}

export interface UpdateUserDetailsInput {
  email?: string;
  phone?: string;
}

export async function updateUserDetails(id: string, input: UpdateUserDetailsInput) {
  const res = await api.patch<{ user: User }>(`/users/${id}/details`, input);
  return res.data.user;
}
