import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useUsers, useUpdateUserRole, useUpdateUserStatus } from '../../hooks/useUsers';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { EditUserDetailsModal } from '../../components/users/EditUserDetailsModal';
import type { Role, User } from '../../types';

export function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateUserStatus();
  const currentUser = useAuthStore((s) => s.user);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  function handleRoleChange(id: string, role: Role) {
    setPendingId(id);
    updateRole.mutate({ id, role }, { onSettled: () => setPendingId(null) });
  }

  function handleStatusToggle(id: string, isActive: boolean) {
    setPendingId(id);
    updateStatus.mutate({ id, isActive: !isActive }, { onSettled: () => setPendingId(null) });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">Manage every account's role and access.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <Spinner />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const busy = pendingId === u.id;
                  return (
                    <tr key={u.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {u.name} {isSelf && <span className="text-xs text-slate-400">(you)</span>}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{u.email}</td>
                      <td className="px-5 py-3 text-slate-600">{u.phone ?? '—'}</td>
                      <td className="px-5 py-3">
                        <Select
                          value={u.role}
                          disabled={isSelf || busy}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                          className="h-8 w-32 text-xs"
                        >
                          <option value="admin">Admin</option>
                          <option value="staff">Staff</option>
                          <option value="resident">Resident</option>
                        </Select>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={u.isActive ? 'success' : 'danger'}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditUser(u)} title="Edit details">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isSelf || busy}
                            onClick={() => handleStatusToggle(u.id, Boolean(u.isActive))}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <EditUserDetailsModal open={Boolean(editUser)} onClose={() => setEditUser(null)} user={editUser} />
    </div>
  );
}
