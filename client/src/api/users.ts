import { api } from './axios';
import type { User, Role } from '../types';

export async function fetchUsers(params?: { role?: Role }) {
  const res = await api.get<{ users: User[] }>('/users', { params });
  return res.data.users;
}
