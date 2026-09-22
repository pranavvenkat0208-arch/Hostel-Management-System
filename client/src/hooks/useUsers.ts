import { useQuery } from '@tanstack/react-query';
import * as usersApi from '../api/users';
import type { Role } from '../types';

export function useUsers(params?: { role?: Role }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.fetchUsers(params),
  });
}
