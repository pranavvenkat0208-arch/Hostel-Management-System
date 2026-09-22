import { useState } from 'react';
import {
  useAllMaintenanceRequests,
  useAssignMaintenanceRequest,
  useUpdateMaintenanceStatus,
} from '../../hooks/useMaintenance';
import { useUsers } from '../../hooks/useUsers';
import { Card, CardContent } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { PriorityBadge, MaintenanceStatusBadge } from '../../components/maintenance/StatusBadges';
import type { MaintenanceStatus, PopulatedRef } from '../../types';

function asRef(value: PopulatedRef | string | null | undefined): PopulatedRef | null {
  return value && typeof value === 'object' ? value : null;
}

export function StaffMaintenanceView() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: requests, isLoading } = useAllMaintenanceRequests(
    statusFilter ? { status: statusFilter } : undefined
  );
  const { data: staff } = useUsers({ role: 'staff' });
  const assign = useAssignMaintenanceRequest();
  const updateStatus = useUpdateMaintenanceStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Maintenance requests</h1>
          <p className="text-sm text-slate-500">Review, assign, and track resident-reported issues.</p>
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </Select>
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
                  <th className="px-5 py-3">Issue</th>
                  <th className="px-5 py-3">Resident</th>
                  <th className="px-5 py-3">Room</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Assigned to</th>
                  <th className="px-5 py-3 text-right">Update status</th>
                </tr>
              </thead>
              <tbody>
                {requests?.map((r) => {
                  const resident = asRef(r.resident);
                  const room = asRef(r.room);
                  const assignedTo = asRef(r.assignedTo);

                  return (
                    <tr key={r._id} className="border-b border-slate-50 align-top last:border-0">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{r.title}</p>
                        <p className="max-w-xs text-xs text-slate-500">{r.description}</p>
                        <span className="text-xs capitalize text-slate-400">{r.category}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{resident?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-600">{room?.roomNumber ?? '—'}</td>
                      <td className="px-5 py-3">
                        <PriorityBadge priority={r.priority} />
                      </td>
                      <td className="px-5 py-3">
                        <MaintenanceStatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-3">
                        <Select
                          value={assignedTo?._id ?? ''}
                          onChange={(e) => e.target.value && assign.mutate({ id: r._id, assignedTo: e.target.value })}
                          className="h-8 text-xs"
                        >
                          <option value="">Unassigned</option>
                          {staff?.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-5 py-3">
                        <Select
                          value={r.status}
                          onChange={(e) =>
                            updateStatus.mutate({ id: r._id, status: e.target.value as MaintenanceStatus })
                          }
                          className="h-8 text-xs"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </Select>
                      </td>
                    </tr>
                  );
                })}
                {requests?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                      No maintenance requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
