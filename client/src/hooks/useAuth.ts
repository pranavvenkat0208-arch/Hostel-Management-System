import { useMutation } from '@tanstack/react-query';
import { api } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import type { User, Role } from '../types';

interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput extends LoginInput {
  name: string;
  phone?: string;
  role?: Role;
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await api.post<AuthResponse>('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => setAuth(data.user, data.token),
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await api.post<AuthResponse>('/auth/register', data);
      return res.data;
    },
    onSuccess: (data) => setAuth(data.user, data.token),
  });
}
