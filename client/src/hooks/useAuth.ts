import { useMutation, useQuery } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { useAuthStore } from '../store/authStore';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => setAuth(data.user, data.token),
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => setAuth(data.user, data.token),
  });
}

// Keeps the stored user (and role) in sync with the server. A deactivated
// account gets a 401 here, which logs it out.
export function useSyncCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const user = await authApi.fetchMe();
      setUser(user);
      return user;
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}
