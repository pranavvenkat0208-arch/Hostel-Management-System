import { api } from './axios';
import type { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
  phone?: string;
}

export async function login(input: LoginInput) {
  const res = await api.post<AuthResponse>('/auth/login', input);
  return res.data;
}

export async function fetchMe() {
  const res = await api.get<{ user: User }>('/auth/me');
  return res.data.user;
}

export async function register(input: RegisterInput) {
  const res = await api.post<AuthResponse>('/auth/register', input);
  return res.data;
}
