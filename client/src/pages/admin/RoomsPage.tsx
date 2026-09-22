import { useState } from 'react';
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react';
import { useRooms, useOccupancySummary, useDeleteRoom, useUpdateRoom } from '../../hooks/useRooms';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { RoomFormModal } from '../../components/rooms/RoomFormModal';
import type { Room } from '../../types';

function OccupancyBadge({ room }: { room: Room }) {
  if (room.underMaintenance) return <Badge variant="warning">Maintenance</Badge>;
  if (room.occupied >= room.capacity) return <Badge variant="danger">Full</Badge>;
  return <Badge variant="success">Available</Badge>;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}

export function RoomsPage() {
  const { data: rooms, isLoading } = useRooms();
  const { data: summary } = useOccupancySummary();
  const deleteRoom = useDeleteRoom();
  const updateRoom = useUpdateRoom();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  function openAdd() {
    setEditingRoom(null);
    setModalOpen(true);
  }

  function openEdit(room: Room) {
    setEditingRoom(room);
    setModalOpen(true);
  }

  function toggleMaintenance(room: Room) {
    updateRoom.mutate({ id: room._id, input: { underMaintenance: !room.underMaintenance } });
  }

  function handleDelete(room: Room) {
    if (confirm(`Delete room ${room.roomNumber}?`)) {
      deleteRoom.mutate(room._id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Rooms</h1>
          <p className="text-sm text-slate-500">Manage room inventory and occupancy.</p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add room
        </Button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total rooms" value={summary.totalRooms} />
          <StatCard label="Total capacity" value={summary.totalCapacity} />
          <StatCard label="Occupied beds" value={summary.totalOccupied} />
          <StatCard label="Occupancy rate" value={`${summary.occupancyRate}%`} />
        </div>
      )}

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
                  <th className="px-5 py-3">Room</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Floor</th>
                  <th className="px-5 py-3">Occupancy</th>
                  <th className="px-5 py-3">Rent</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms?.map((room) => (
                  <tr key={room._id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-900">{room.roomNumber}</td>
                    <td className="px-5 py-3 capitalize text-slate-600">{room.type}</td>
                    <td className="px-5 py-3 text-slate-600">{room.floor ?? '—'}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {room.occupied}/{room.capacity}
                    </td>
                    <td className="px-5 py-3 text-slate-600">₹{room.monthlyRent}</td>
                    <td className="px-5 py-3">
                      <OccupancyBadge room={room} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleMaintenance(room)}
                          title="Toggle maintenance"
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(room)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(room)} title="Delete">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rooms?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                      No rooms yet — add your first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <RoomFormModal open={modalOpen} onClose={() => setModalOpen(false)} room={editingRoom} />
    </div>
  );
}
