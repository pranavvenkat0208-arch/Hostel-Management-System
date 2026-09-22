import { useState } from 'react';
import { DoorOpen, LogOut, ArrowRightLeft, Trash2 } from 'lucide-react';
import { useResidents, useDeleteResident } from '../../hooks/useResidents';
import { useCheckOutResident } from '../../hooks/useAllocations';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { AllocateRoomModal } from '../../components/rooms/AllocateRoomModal';
import { getErrorMessage } from '../../lib/utils';
import type { Resident } from '../../types';

export function ResidentsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const { data: residents, isLoading } = useResidents();
  const checkOut = useCheckOutResident();
  const deleteResident = useDeleteResident();

  const [modalResident, setModalResident] = useState<Resident | null>(null);
  const [modalMode, setModalMode] = useState<'allocate' | 'change'>('allocate');

  function openAllocate(resident: Resident) {
    setModalResident(resident);
    setModalMode('allocate');
  }

  function openChange(resident: Resident) {
    setModalResident(resident);
    setModalMode('change');
  }

  function handleCheckOut(resident: Resident) {
    if (confirm(`Check out ${resident.name}?`)) {
      checkOut.mutate({ residentId: resident._id });
    }
  }

  function handleDelete(resident: Resident) {
    if (!confirm(`Delete ${resident.name}'s account? This removes their login and profile permanently.`)) return;
    deleteResident.mutate(resident._id, { onError: (error) => alert(getErrorMessage(error)) });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Residents</h1>
        <p className="text-sm text-slate-500">View residents and manage their room assignments.</p>
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
                  <th className="px-5 py-3">Room</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {residents?.map((resident) => (
                  <tr key={resident._id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-900">{resident.name}</td>
                    <td className="px-5 py-3 text-slate-600">{resident.email}</td>
                    <td className="px-5 py-3 text-slate-600">{resident.phone || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{resident.currentRoom?.roomNumber ?? '—'}</td>
                    <td className="px-5 py-3">
                      <Badge variant={resident.status === 'active' ? 'success' : 'default'}>
                        {resident.status === 'active' ? 'Active' : 'Checked out'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        {resident.currentRoom ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openChange(resident)}
                              title="Change room"
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCheckOut(resident)}
                              title="Check out"
                            >
                              <LogOut className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openAllocate(resident)}
                            title="Allocate room"
                          >
                            <DoorOpen className="h-4 w-4" />
                          </Button>
                        )}
                        {role === 'admin' && !resident.currentRoom && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(resident)}
                            title="Delete resident"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {residents?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                      No residents yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <AllocateRoomModal
        open={Boolean(modalResident)}
        onClose={() => setModalResident(null)}
        resident={modalResident}
        mode={modalMode}
      />
    </div>
  );
}
