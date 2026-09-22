import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as usersApi from '../api/users';
import type { UpdateUserDetailsInput } from '../api/users';
import type { Role } from '../types';

export function useUsers(params?: { role?: Role }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.fetchUsers(params),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => usersApi.updateUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => usersApi.updateUserStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUserDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserDetailsInput }) => usersApi.updateUserDetails(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
